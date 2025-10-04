"use client";

import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import type { Group, InstancedMesh, MeshStandardMaterial } from "three";
import * as THREE from "three";
import * as Tone from "tone";
import { audioPlayerAtom, isPlayingAtom } from "@/features/audio/state";
import { isExportingAtom } from "@/features/export/state";
import { sceneObjectsAtom } from "@/features/scene/state";
import type { WaveformInstancerObject } from "@/features/scene/types";

type WaveformInstancerRendererProps = {
  object: WaveformInstancerObject;
  isSelected: boolean;
};

export function WaveformInstancerRenderer({
  object,
}: WaveformInstancerRendererProps) {
  const groupRef = useRef<Group>(null);
  const instancedRef = useRef<InstancedMesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const allObjects = useAtomValue(sceneObjectsAtom);
  const audioPlayer = useAtomValue(audioPlayerAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const isExporting = useAtomValue(isExportingAtom);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const rawValuesRef = useRef<Float32Array | null>(null);

  // Pre-allocated objects for matrix calculations
  const matrices = useMemo(() => new THREE.Matrix4(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const scale = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);
  const tempUnitRadial = useMemo(() => new THREE.Vector3(), []);
  const tempXAxis = useMemo(() => new THREE.Vector3(), []);
  const tempY = useMemo(() => new THREE.Vector3(), []);
  const tempZ = useMemo(() => new THREE.Vector3(0, 1, 0), []); // Constant up
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);

  // Pre-calculated trigonometry for radial arrangements (recomputed when needed)
  const trigCacheRef = useRef<{ cos: Float32Array; sin: Float32Array } | null>(
    null,
  );

  const targetPrimitive = object.targetPrimitiveId
    ? allObjects.find((obj) => obj.id === object.targetPrimitiveId)
    : null;

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

  useEffect(() => {
    // Connect analyzer to shared audio player
    if (audioPlayer && !analyzerRef.current) {
      // FFT size must be power of 2 - use FFT for frequency analysis
      const fftSize =
        2 ** Math.ceil(Math.log2(Math.min(object.instanceCount, 2048)));

      // Use 'fft' type for frequency data (shows highs/lows across spectrum)
      const analyzer = new Tone.Analyser("fft", fftSize);

      // Connect to the existing player
      audioPlayer.connect(analyzer);

      analyzerRef.current = analyzer;
      rawValuesRef.current = new Float32Array(object.instanceCount);

      console.log("FFT analyzer connected to main player with size:", fftSize);
    }

    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.dispose();
        analyzerRef.current = null;
        rawValuesRef.current = null;
      }
    };
  }, [audioPlayer, object.instanceCount]);

  // biome-ignore lint/correctness/useExhaustiveDependencies(tempMatrix): suppress dependency analysis warning
  // biome-ignore lint/correctness/useExhaustiveDependencies(tempMatrix.makeBasis): suppress dependency analysis warning
  // biome-ignore lint/correctness/useExhaustiveDependencies(tempY): suppress dependency analysis warning
  // biome-ignore lint/correctness/useExhaustiveDependencies(tempY.copy): suppress dependency analysis warning
  // biome-ignore lint/correctness/useExhaustiveDependencies(tempZ): suppress dependency analysis warning
  // biome-ignore lint/correctness/useExhaustiveDependencies(tempXAxis): suppress dependency analysis warning
  // biome-ignore lint/correctness/useExhaustiveDependencies(tempXAxis.crossVectors): suppress dependency analysis warning
  // biome-ignore lint/correctness/useExhaustiveDependencies(tempUnitRadial): suppress dependency analysis warning
  // biome-ignore lint/correctness/useExhaustiveDependencies(tempUnitRadial.set): suppress dependency analysis warning
  useEffect(() => {
    const instanced = instancedRef.current;
    if (!instanced) return;

    const startDeg = object.arcStartDegrees ?? 0;
    const endDeg = object.arcEndDegrees ?? 360;
    const arcRange = endDeg - startDeg;

    // Initial height for setup
    const initialHeight = object.baseHeight;

    for (let i = 0; i < object.instanceCount; i++) {
      // Calculate pivot offset based on pivot point
      let pivotOffset = 0;
      if (object.pivotPoint === "bottom") {
        pivotOffset = initialHeight / 2;
      } else if (object.pivotPoint === "center") {
        pivotOffset = 0;
      } else if (object.pivotPoint === "top") {
        pivotOffset = -initialHeight / 2;
      }

      if (object.arrangement === "linear") {
        const x = (i - object.instanceCount / 2) * object.spacing;
        // Scale from pivot point
        position.set(x, pivotOffset, 0);
        scale.set(1, initialHeight, 1);
        quaternion.identity(); // No rotation
      } else if (object.arrangement === "radial") {
        // Radial - scale upwards from base position
        const t = i / (object.instanceCount - 1 || 1);
        const angleDeg = startDeg + t * arcRange;
        const angle = (angleDeg * Math.PI) / 180;
        const radius = object.spacing * object.instanceCount * 0.1;

        // Base position on circle, then apply pivot offset on Y
        position.set(
          Math.cos(angle) * radius,
          pivotOffset,
          Math.sin(angle) * radius,
        );
        scale.set(1, initialHeight, 1);
        quaternion.identity();
      } else if (object.arrangement === "radial-outwards") {
        // Radial-outwards - arranged in arc, rotated so Y-axis points radially outward
        const t = i / (object.instanceCount - 1 || 1);
        const angleDeg = startDeg + t * arcRange;
        const angle = (angleDeg * Math.PI) / 180;
        const baseRadius = object.spacing * object.instanceCount * 0.1;

        // Unit radial vector
        tempUnitRadial.set(Math.cos(angle), 0, Math.sin(angle));

        // Basis: yAxis = radial (outward), zAxis = up (global Y), xAxis = y cross z (tangential)
        tempY.copy(tempUnitRadial);
        tempXAxis.crossVectors(tempY, tempZ).normalize();

        // Position: offset along radial for pivot
        const radialOffset = baseRadius + pivotOffset;
        position.copy(tempUnitRadial).multiplyScalar(radialOffset);

        // Scale on Y-axis (length along radial)
        scale.set(1, initialHeight, 1);

        // Rotation from basis matrix
        tempMatrix.makeBasis(tempXAxis, tempY, tempZ);
        quaternion.setFromRotationMatrix(tempMatrix);
      }

      matrices.compose(position, quaternion, scale);
      instanced.setMatrixAt(i, matrices);
    }
    instanced.instanceMatrix.needsUpdate = true;
  }, [
    object.instanceCount,
    object.arrangement,
    object.spacing,
    object.arcStartDegrees,
    object.arcEndDegrees,
    object.baseHeight,
    object.pivotPoint,
    matrices,
    position,
    quaternion,
    scale,
  ]);

  useFrame(() => {
    const instanced = instancedRef.current;
    const analyzer = analyzerRef.current;
    const rawValues = rawValuesRef.current;
    const material = materialRef.current;
    if (!instanced || !analyzer || !rawValues || (!isPlaying && !isExporting)) return;

    const values = analyzer.getValue() as Float32Array;
    const startDeg = object.arcStartDegrees ?? 0;
    const endDeg = object.arcEndDegrees ?? 360;
    const arcRange = endDeg - startDeg;

    // Calculate frequency range indices
    const freqStart = Math.floor(object.freqRangeStart * values.length);
    const freqEnd = Math.floor(object.freqRangeEnd * values.length);
    const freqRange = freqEnd - freqStart;

    // Pre-calculate common values
    const isLinear = object.arrangement === "linear";
    const isRadial = object.arrangement === "radial";
    const isRadialOutwards = object.arrangement === "radial-outwards";
    const halfCount = object.instanceCount / 2;
    const countMinusOne = object.instanceCount - 1 || 1;

    // Pre-calculate trigonometry for radial arrangements
    let cosValues: Float32Array | undefined;
    let sinValues: Float32Array | undefined;
    let baseRadius = 0;

    if (isRadial || isRadialOutwards) {
      baseRadius = object.spacing * object.instanceCount * 0.1;

      // Reuse or create trig cache
      if (
        !trigCacheRef.current ||
        trigCacheRef.current.cos.length !== object.instanceCount
      ) {
        trigCacheRef.current = {
          cos: new Float32Array(object.instanceCount),
          sin: new Float32Array(object.instanceCount),
        };
      }

      cosValues = trigCacheRef.current.cos;
      sinValues = trigCacheRef.current.sin;

      // Pre-calculate all angles, sin, cos
      const angleStep = (arcRange * Math.PI) / 180 / countMinusOne;
      const startAngle = (startDeg * Math.PI) / 180;

      for (let i = 0; i < object.instanceCount; i++) {
        const angle = startAngle + i * angleStep;
        cosValues[i] = Math.cos(angle);
        sinValues[i] = Math.sin(angle);
      }
    }

    const instanceCountInv = 1 / object.instanceCount;
    const audioThreshold = object.audioThreshold;
    const audioGain = object.audioGain;
    const baseHeight = object.baseHeight;
    const dynamicLength = object.dynamicLength;
    const spacing = object.spacing;

    // Pre-calculate pivot offsets will be done per-instance since they depend on height
    const pivotBottom = object.pivotPoint === "bottom";
    const pivotTop = object.pivotPoint === "top";

    // First pass: get raw amplitude values
    for (let i = 0; i < object.instanceCount; i++) {
      // Map instance index to analyzer frequency bins within the specified range
      const dataIndex =
        freqStart + Math.floor(i * instanceCountInv * freqRange);
      const rawValue = values[Math.min(dataIndex, values.length - 1)];

      // FFT returns decibel values (typically -100 to 0)
      // Convert to 0-1 range for visualization
      let normalizedAmplitude = Math.max(0, (rawValue + 100) / 100);

      // Apply audio threshold and gain
      normalizedAmplitude =
        Math.max(0, normalizedAmplitude - audioThreshold) * audioGain;

      // Clamp to 0-1
      rawValues[i] = Math.min(1, normalizedAmplitude);
    }

    // Second pass: apply spatial smoothing (neighbor averaging) and render
    const smoothing = object.smoothing;
    let totalAmplitude = 0;

    // Check if arrangement forms a closed loop (full 360 degree circle)
    const isClosedLoop =
      (isRadial || isRadialOutwards) && Math.abs(endDeg - startDeg - 360) < 1;

    for (let i = 0; i < object.instanceCount; i++) {
      let smoothedValue = rawValues[i];

      // Apply spatial smoothing if enabled (average with neighbors)
      if (smoothing > 0) {
        // Use a simple box blur with radius based on smoothing value
        const radius = Math.ceil(smoothing * 5); // smoothing 0-1 maps to radius 0-5
        let sum = rawValues[i];
        let count = 1;

        for (let j = 1; j <= radius; j++) {
          const weight = 1 - j / (radius + 1); // Linear falloff

          // Left neighbor (with wrapping for closed loops)
          let leftIdx = i - j;
          if (leftIdx < 0) {
            leftIdx = isClosedLoop ? object.instanceCount + leftIdx : -1;
          }
          if (leftIdx >= 0) {
            sum += rawValues[leftIdx] * weight;
            count += weight;
          }

          // Right neighbor (with wrapping for closed loops)
          let rightIdx = i + j;
          if (rightIdx >= object.instanceCount) {
            rightIdx = isClosedLoop ? rightIdx - object.instanceCount : -1;
          }
          if (rightIdx >= 0 && rightIdx < object.instanceCount) {
            sum += rawValues[rightIdx] * weight;
            count += weight;
          }
        }

        smoothedValue = sum / count;
      }

      totalAmplitude += smoothedValue;

      // Calculate height based on base + dynamic
      const height = baseHeight + smoothedValue * dynamicLength;

      // Calculate pivot offset based on pivot point
      let pivotOffset = 0;
      if (pivotBottom) {
        pivotOffset = height * 0.5;
      } else if (pivotTop) {
        pivotOffset = -height * 0.5;
      }

      if (isLinear) {
        const x = (i - halfCount) * spacing;
        position.set(x, pivotOffset, 0);
        scale.set(1, height, 1);
        quaternion.set(0, 0, 0, 1); // Identity quaternion (faster than .identity())
      } else if (isRadial) {
        // Use pre-calculated sin/cos
        position.set(
          cosValues![i] * baseRadius,
          pivotOffset,
          sinValues![i] * baseRadius,
        );
        scale.set(1, height, 1);
        quaternion.set(0, 0, 0, 1);
      } else if (isRadialOutwards) {
        // Use pre-calculated sin/cos
        const cosAngle = cosValues![i];
        const sinAngle = sinValues![i];

        // Unit radial vector (reuse tempUnitRadial)
        tempUnitRadial.set(cosAngle, 0, sinAngle);

        // Position: offset along radial for pivot
        const radialOffset = baseRadius + pivotOffset;
        position.set(cosAngle * radialOffset, 0, sinAngle * radialOffset);

        // Scale on Y-axis (length along radial)
        scale.set(1, height, 1);

        // Basis calculation: yAxis = radial (outward), zAxis = up (global Y), xAxis = y cross z (tangential)
        // tempY = tempUnitRadial (already set)
        tempY.copy(tempUnitRadial);

        // Cross product: (radial) × (up) = tangential
        // Optimized cross product for (cosAngle, 0, sinAngle) × (0, 1, 0)
        tempXAxis.set(-sinAngle, 0, cosAngle);

        // Rotation from basis matrix
        tempMatrix.makeBasis(tempXAxis, tempY, tempZ);
        quaternion.setFromRotationMatrix(tempMatrix);
      }

      matrices.compose(position, quaternion, scale);
      instanced.setMatrixAt(i, matrices);
    }
    instanced.instanceMatrix.needsUpdate = true;

    // Apply emissive boost based on average amplitude
    if (material && object.emissiveBoost > 0) {
      const avgAmplitude = totalAmplitude * instanceCountInv;
      const baseEmissive =
        targetPrimitive?.type === "primitive"
          ? targetPrimitive.material.emissiveIntensity
          : 0;
      material.emissiveIntensity =
        baseEmissive + avgAmplitude * object.emissiveBoost;
    }
  });

  if (!targetPrimitive || targetPrimitive.type !== "primitive") {
    return null;
  }

  const getGeometry = () => {
    switch (targetPrimitive.primitiveType) {
      case "cube":
        return <boxGeometry args={[0.5, 1, 0.5]} />;
      case "pyramid":
        return <coneGeometry args={[0.25, 1, 4]} />;
      case "torus":
        return <torusGeometry args={[0.25, 0.1, 8, 16]} />;
      case "cylinder":
        return (
          <cylinderGeometry
            args={[
              targetPrimitive.cylinderTopRadius ?? 0.25,
              targetPrimitive.cylinderBottomRadius ?? 0.25,
              1,
              16,
            ]}
          />
        );
    }
  };

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={instancedRef}
        args={[undefined, undefined, object.instanceCount]}
      >
        {getGeometry()}
        <meshStandardMaterial
          ref={materialRef}
          color={targetPrimitive.material.color}
          roughness={targetPrimitive.material.roughness}
          metalness={targetPrimitive.material.metalness}
          emissive={targetPrimitive.material.emissiveColor}
          emissiveIntensity={targetPrimitive.material.emissiveIntensity}
        />
      </instancedMesh>
    </group>
  );
}
