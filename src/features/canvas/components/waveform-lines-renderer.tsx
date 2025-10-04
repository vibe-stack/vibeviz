"use client";

import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { isPlayingAtom } from "@/features/audio/state";
import { isExportingAtom } from "@/features/export/state";
import type { WaveformLinesObject } from "@/features/scene/types";
import {
  MeshLineGeometry,
  MeshLineNodeMaterial,
  MeshLineRaycast,
} from "@/lib/meshline-webgpu";
import { useWaveformAnalyzer } from "../hooks/use-waveform-analyzer";

type WaveformLinesRendererProps = {
  object: WaveformLinesObject;
  isSelected: boolean;
};

export function WaveformLinesRenderer({ object }: WaveformLinesRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isPlaying = useAtomValue(isPlayingAtom);
  const isExporting = useAtomValue(isExportingAtom);

  // Use custom hook for audio analysis (based on lineSegments, not lineAmount)
  const { analyzer, rawValues, smoothedValues } = useWaveformAnalyzer(
    object.lineSegments,
  );

  // Store line geometries and materials that persist
  const linesDataRef = useRef<{
    geometries: MeshLineGeometry[];
    materials: MeshLineNodeMaterial[];
    meshes: THREE.Mesh[];
  }>({ geometries: [], materials: [], meshes: [] });

  // Pre-allocated objects for reuse (avoid GC pressure)
  const reusableRefs = useRef({
    // Color objects
    baseColor: new THREE.Color(),
    emissiveColor: new THREE.Color(),
    finalColor: new THREE.Color(),
    // Reusable arrays
    shiftedValues: new Float32Array(0),
    spatiallySmoothedValues: new Float32Array(0),
    // Direction cache
    normalizedDir: { x: 0, y: 1, z: 0 },
    dirLength: 0,
    // Vector pool for points (allocated per line)
    vectorPools: [] as THREE.Vector3[][],
    linePointGroups: [] as THREE.Vector3[][],
  });

  // Cache for values that only change when object properties change
  const cachedCalcs = useRef({
    freqStart: 0,
    freqEnd: 0,
    freqRange: 1,
    segmentInv: 1,
    offsetAmount: 0,
    temporalSmoothing: 0.3,
  });

  // Apply transform to group
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        object.transform.position.x,
        object.transform.position.y,
        object.transform.position.z,
      );
      groupRef.current.rotation.set(
        object.transform.rotation.x,
        object.transform.rotation.y,
        object.transform.rotation.z,
      );
      groupRef.current.scale.set(
        object.transform.scale.x,
        object.transform.scale.y,
        object.transform.scale.z,
      );
    }
  }, [object.transform]);

  // Spatial smoothing on audio data (matches instancer renderer logic)
  const applySpatialSmoothing = (
    rawData: Float32Array,
    smoothedData: Float32Array,
    smoothing: number,
    isClosedLoop: boolean,
  ): void => {
    if (smoothing <= 0) {
      // No smoothing, just copy raw to smoothed
      smoothedData.set(rawData);
      return;
    }

    const radius = Math.ceil(smoothing * 5); // smoothing 0-1 maps to radius 0-5
    const dataLength = rawData.length;

    for (let i = 0; i < dataLength; i++) {
      let sum = rawData[i];
      let count = 1;

      for (let j = 1; j <= radius; j++) {
        const weight = 1 - j / (radius + 1); // Linear falloff

        // Left neighbor (with wrapping for closed loops)
        let leftIdx = i - j;
        if (leftIdx < 0) {
          leftIdx = isClosedLoop ? dataLength + leftIdx : -1;
        }
        if (leftIdx >= 0) {
          sum += rawData[leftIdx] * weight;
          count += weight;
        }

        // Right neighbor (with wrapping for closed loops)
        let rightIdx = i + j;
        if (rightIdx >= dataLength) {
          rightIdx = isClosedLoop ? rightIdx - dataLength : -1;
        }
        if (rightIdx >= 0 && rightIdx < dataLength) {
          sum += rawData[rightIdx] * weight;
          count += weight;
        }
      }

      smoothedData[i] = sum / count;
    }
  };

  // Create/update line geometries and materials
  useEffect(() => {
    // Dispose old geometries and materials
    linesDataRef.current.geometries.forEach((g) => {
      g.dispose();
    });
    linesDataRef.current.materials.forEach((m) => {
      m.dispose();
    });

    // Clear the group if it exists
    if (groupRef.current) {
      groupRef.current.clear();
    }

    const geometries: MeshLineGeometry[] = [];
    const materials: MeshLineNodeMaterial[] = [];
    const meshes: THREE.Mesh[] = [];

    // Allocate vector pools for each line
    const vectorPools: THREE.Vector3[][] = [];
    const linePointGroups: THREE.Vector3[][] = [];
    const pointsPerLine =
      object.layout === "radial"
        ? object.lineSegments + 1
        : object.lineSegments;

    for (let lineIdx = 0; lineIdx < object.lineAmount; lineIdx++) {
      // Create initial points for this line
      const points: THREE.Vector3[] = [];

      if (object.layout === "linear") {
        // Linear: points go along X-axis, Y changes with audio
        for (let i = 0; i < object.lineSegments; i++) {
          const x = (i / (object.lineSegments - 1)) * 10 - 5; // -5 to 5 range
          points.push(new THREE.Vector3(x, 0, 0));
        }
      } else if (object.layout === "radial") {
        // Radial: points form a circle, Y changes with audio
        for (let i = 0; i <= object.lineSegments; i++) {
          // +1 to close the loop
          const angle = (i / object.lineSegments) * Math.PI * 2;
          const radius = 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          points.push(new THREE.Vector3(x, 0, z));
        }
      }

      // Pre-allocate vector pool for this line (for data points)
      const pool: THREE.Vector3[] = [];
      for (let i = 0; i < pointsPerLine; i++) {
        pool.push(new THREE.Vector3());
      }
      vectorPools.push(pool);
      linePointGroups.push(pool.slice());

      const geometry = new MeshLineGeometry();
      geometry.setPoints(points);

      // WebGPU-compatible MeshLine material with thickness support!
      const material = new MeshLineNodeMaterial({
        color: new THREE.Color(object.color),
        lineWidth: object.thickness,
        opacity: 1,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        sizeAttenuation: true,
        transparent: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.raycast = MeshLineRaycast;

      geometries.push(geometry);
      materials.push(material);
      meshes.push(mesh);
    }

    linesDataRef.current = { geometries, materials, meshes };
    reusableRefs.current.vectorPools = vectorPools;
    reusableRefs.current.linePointGroups = linePointGroups;

    // Add meshes to the group
    if (groupRef.current) {
      meshes.forEach((mesh) => {
        groupRef.current?.add(mesh);
      });
    }

    return () => {
      // Thorough cleanup
      geometries.forEach((g) => {
        g.dispose();
      });
      materials.forEach((m) => {
        m.dispose();
      });
      if (groupRef.current) {
        groupRef.current.clear();
      }
    };
  }, [
    object.lineAmount,
    object.lineSegments,
    object.layout,
    object.color,
    object.thickness,
  ]);

  // Pre-calculate values that don't change often
  useEffect(() => {
    const cache = cachedCalcs.current;
    cache.segmentInv = 1 / object.lineSegments;
    cache.offsetAmount = Math.floor(object.offset * object.lineSegments);

    // Normalize direction vector (only when it changes)
    const dirLength = Math.sqrt(
      object.direction.x * object.direction.x +
        object.direction.y * object.direction.y +
        object.direction.z * object.direction.z,
    );
    const refs = reusableRefs.current;
    refs.dirLength = dirLength;
    refs.normalizedDir.x = dirLength > 0 ? object.direction.x / dirLength : 0;
    refs.normalizedDir.y = dirLength > 0 ? object.direction.y / dirLength : 1;
    refs.normalizedDir.z = dirLength > 0 ? object.direction.z / dirLength : 0;

    // Resize shifted values array if needed
    if (refs.shiftedValues.length !== object.lineSegments) {
      refs.shiftedValues = new Float32Array(object.lineSegments);
    }
    if (refs.spatiallySmoothedValues.length !== object.lineSegments) {
      refs.spatiallySmoothedValues = new Float32Array(object.lineSegments);
    }
  }, [object.lineSegments, object.offset, object.direction]);

  useFrame(() => {
    const { geometries, materials } = linesDataRef.current;
    if (
      !analyzer ||
      !rawValues ||
      !smoothedValues ||
      (!isPlaying && !isExporting) ||
      geometries.length === 0
    )
      return;

    const values = analyzer.getValue() as Float32Array;
    const cache = cachedCalcs.current;
    const refs = reusableRefs.current;

    // Update frequency range cache (changes rarely)
    cache.freqStart = Math.floor(object.freqRangeStart * values.length);
    cache.freqEnd = Math.floor(object.freqRangeEnd * values.length);
    cache.freqRange = Math.max(1, cache.freqEnd - cache.freqStart);

    const temporalSmoothing = cache.temporalSmoothing;
    const oneMinusSmoothing = 1 - temporalSmoothing;

    // COMBINED LOOP: Extract audio and apply temporal smoothing
    for (let i = 0; i < object.lineSegments; i++) {
      // Extract and process audio data
      const dataIndex =
        cache.freqStart + Math.floor(i * cache.segmentInv * cache.freqRange);
      const rawValue = values[Math.min(dataIndex, values.length - 1)];
      let normalizedAmplitude = Math.max(0, (rawValue + 100) / 100);
      normalizedAmplitude =
        Math.max(0, normalizedAmplitude - object.audioThreshold) *
        object.audioGain;
      rawValues[i] = Math.min(1, normalizedAmplitude);

      // Apply temporal smoothing inline
      smoothedValues[i] =
        smoothedValues[i] * oneMinusSmoothing +
        rawValues[i] * temporalSmoothing;
    }

    // Apply spatial smoothing (like instancer renderer)
    // Treat as closed loop if radial layout OR if offset is used (for ring smoothing)
    const isClosedLoop = object.layout === "radial" || object.offset > 0;
    applySpatialSmoothing(
      smoothedValues,
      refs.spatiallySmoothedValues,
      object.smoothing,
      isClosedLoop,
    );

    // Apply offset AFTER smoothing and calculate total amplitude
    let totalAmplitude = 0;
    for (let i = 0; i < object.lineSegments; i++) {
      const sourceIndex = (i + cache.offsetAmount) % object.lineSegments;
      const shiftedValue = refs.spatiallySmoothedValues[sourceIndex];
      refs.shiftedValues[i] = shiftedValue;
      totalAmplitude += shiftedValue;
    }

    const avgAmplitude = totalAmplitude / object.lineSegments;

    // Update materials with emissive boost (reuse color objects)
    refs.baseColor.set(object.color);
    refs.emissiveColor.set(object.emissiveColor);
    const baseEmissive = object.emissiveIntensity;
    const boostedEmissive = baseEmissive + avgAmplitude * object.emissiveBoost;

    refs.finalColor.copy(refs.baseColor);
    refs.emissiveColor.multiplyScalar(boostedEmissive);
    refs.finalColor.lerp(refs.emissiveColor, Math.min(1, boostedEmissive));

    // Batch material update
    for (let m = 0; m < materials.length; m++) {
      materials[m].color.copy(refs.finalColor);
    }

    // Pre-calculate common values outside the geometry loop
    const totalLines = object.lineAmount;
    const totalLinesMinusOne = totalLines > 1 ? totalLines - 1 : 1;
    const dynamicHeight = object.dynamicHeight;
    const normalizedDir = refs.normalizedDir;
    const shiftedValues = refs.shiftedValues;
    const isLinear = object.layout === "linear";
    const pivotPoint = object.pivotPoint;
    const segmentsMinusOne = object.lineSegments - 1;
    const minSegmentsDivider = Math.max(1, segmentsMinusOne);
    const startConvergence = object.lineStartConvergence;
    const centerConvergence = object.lineCenterConvergence;
    const endConvergence = object.lineEndConvergence;
    const startGap = object.lineStartGap;
    const centerGap = object.lineCenterGap;
    const endGap = object.lineEndGap;

    // Calculate pivot offset for the group of lines
    // This offset is applied to center or top-align the entire group
    let groupPivotOffset = 0;
    if (totalLines > 1) {
      // Calculate the total span of all lines with interpolated gap values
      let totalSpan = 0;
      for (let i = 0; i < totalLines - 1; i++) {
        const linePosition = i / totalLinesMinusOne;
        let gapMultiplier: number;
        if (linePosition < 0.5) {
          // First half: interpolate from start to center
          const t = linePosition * 2;
          gapMultiplier = startGap * (1 - t) + centerGap * t;
        } else {
          // Second half: interpolate from center to end
          const t = (linePosition - 0.5) * 2;
          gapMultiplier = centerGap * (1 - t) + endGap * t;
        }
        totalSpan += object.lineGaps * gapMultiplier;
      }

      if (pivotPoint === "center") {
        groupPivotOffset = -totalSpan * 0.5;
      } else if (pivotPoint === "top") {
        groupPivotOffset = -totalSpan;
      }
    }

    // Update each line's geometry
    for (let lineIdx = 0; lineIdx < geometries.length; lineIdx++) {
      const geometry = geometries[lineIdx];

      // Calculate gap for this specific line with interpolation
      const linePosition = totalLines > 1 ? lineIdx / totalLinesMinusOne : 0;
      let _gapMultiplier: number;
      if (linePosition < 0.5) {
        // First half: interpolate from start to center
        const t = linePosition * 2;
        _gapMultiplier = startGap * (1 - t) + centerGap * t;
      } else {
        // Second half: interpolate from center to end
        const t = (linePosition - 0.5) * 2;
        _gapMultiplier = centerGap * (1 - t) + endGap * t;
      }

      // Calculate cumulative offset for this line
      let cumulativeOffset = 0;
      for (let i = 0; i < lineIdx; i++) {
        const prevLinePosition = totalLines > 1 ? i / totalLinesMinusOne : 0;
        let prevGapMultiplier: number;
        if (prevLinePosition < 0.5) {
          const t = prevLinePosition * 2;
          prevGapMultiplier = startGap * (1 - t) + centerGap * t;
        } else {
          const t = (prevLinePosition - 0.5) * 2;
          prevGapMultiplier = centerGap * (1 - t) + endGap * t;
        }
        cumulativeOffset += object.lineGaps * prevGapMultiplier;
      }
      const baseYOffset = cumulativeOffset + groupPivotOffset;

      // Create data points for this line (reuse existing Vector3 objects from pool)
      const vectorPool = refs.vectorPools[lineIdx];
      const linePointGroups = refs.linePointGroups;
      if (!vectorPool || !linePointGroups) {
        continue;
      }
      const expectedPoints = isLinear
        ? object.lineSegments
        : object.lineSegments + 1;
      if (vectorPool.length < expectedPoints) {
        for (let i = vectorPool.length; i < expectedPoints; i++) {
          vectorPool.push(new THREE.Vector3());
        }
      }
      if (!linePointGroups[lineIdx]) {
        linePointGroups[lineIdx] = [];
      }
      const pointsForLine = linePointGroups[lineIdx];
      if (pointsForLine.length !== expectedPoints) {
        pointsForLine.length = expectedPoints;
        for (let i = 0; i < expectedPoints; i++) {
          pointsForLine[i] = vectorPool[i];
        }
      }
      let dataPointCount = 0;

      if (isLinear) {
        for (let i = 0; i < object.lineSegments; i++) {
          const amplitude = shiftedValues[i];
          const height = amplitude * dynamicHeight;

          const x = (i / minSegmentsDivider) * 10 - 5;

          // Calculate convergence: interpolate between start, center (at 0.5), and end
          const segmentProgress = i / minSegmentsDivider; // 0 to 1 along the line
          let convergenceAtSegment: number;
          if (segmentProgress < 0.5) {
            // First half: interpolate from start to center
            const t = segmentProgress * 2; // 0 to 1 in first half
            convergenceAtSegment =
              startConvergence * (1 - t) + centerConvergence * t;
          } else {
            // Second half: interpolate from center to end
            const t = (segmentProgress - 0.5) * 2; // 0 to 1 in second half
            convergenceAtSegment =
              centerConvergence * (1 - t) + endConvergence * t;
          }
          const yOffset = baseYOffset * (1 - convergenceAtSegment);

          // Reuse existing vector
          const vec = vectorPool[dataPointCount++];
          vec.x = x + height * normalizedDir.x;
          vec.y = yOffset + height * normalizedDir.y;
          vec.z = height * normalizedDir.z;
        }
      } else {
        // radial
        for (let i = 0; i <= object.lineSegments; i++) {
          const segmentIdx = i % object.lineSegments;
          const amplitude = shiftedValues[segmentIdx];
          const height = amplitude * dynamicHeight;

          const angle = (i / object.lineSegments) * Math.PI * 2;
          const cosAngle = Math.cos(angle);
          const sinAngle = Math.sin(angle);

          // Calculate convergence for radial layout: interpolate between start, center, and end
          const segmentProgress =
            (i % object.lineSegments) / object.lineSegments;
          let convergenceAtSegment: number;
          if (segmentProgress < 0.5) {
            // First half: interpolate from start to center
            const t = segmentProgress * 2; // 0 to 1 in first half
            convergenceAtSegment =
              startConvergence * (1 - t) + centerConvergence * t;
          } else {
            // Second half: interpolate from center to end
            const t = (segmentProgress - 0.5) * 2; // 0 to 1 in second half
            convergenceAtSegment =
              centerConvergence * (1 - t) + endConvergence * t;
          }
          const radialOffset = baseYOffset * (1 - convergenceAtSegment);
          const baseRadius = 2 + radialOffset;

          // Reuse existing vector
          const vec = vectorPool[dataPointCount++];
          vec.x = cosAngle * baseRadius + height * normalizedDir.x;
          vec.y = height * normalizedDir.y;
          vec.z = sinAngle * baseRadius + height * normalizedDir.z;
        }
      }

      // Update MeshLineGeometry with new points (direct update, no smoothing)
      geometry.updateFromVectorArray(pointsForLine);
    }
  });

  // Component cleanup
  useEffect(() => {
    return () => {
      // Dispose all resources on unmount
      linesDataRef.current.geometries.forEach((g) => {
        g.dispose();
      });
      linesDataRef.current.materials.forEach((m) => {
        m.dispose();
      });
      if (groupRef.current) {
        groupRef.current.clear();
      }
      // Clear refs
      linesDataRef.current = { geometries: [], materials: [], meshes: [] };
      reusableRefs.current.vectorPools = [];
      reusableRefs.current.linePointGroups = [];
    };
  }, []);

  return (
    <group ref={groupRef}>
      {/* Meshes are added directly to the group in the effect */}
    </group>
  );
}
