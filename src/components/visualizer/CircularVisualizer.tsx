"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Group, Mesh, MeshStandardMaterial, Color } from "three/webgpu";
import { usePlaybackTimeRef } from "@/context/playback-time-context";
import type { BarsSettings } from "@/state/visualizer-store";

interface CircularVisualizerProps {
  getFrequencyData: () => Uint8Array;
  settings: BarsSettings;
}

export const CircularVisualizer = ({
  getFrequencyData,
  settings,
}: CircularVisualizerProps) => {
  if (!settings.enabled) {
    return null;
  }

  const groupRef = useRef<Group>(null);
  const barIntensityRef = useRef<Float32Array>(
    new Float32Array(settings.barCount).fill(0),
  );
  const rawAmplitudeRef = useRef<Float32Array>(
    new Float32Array(settings.barCount),
  );
  const smoothedAmplitudeRef = useRef<Float32Array>(
    new Float32Array(settings.barCount),
  );
  const playbackTimeRef = usePlaybackTimeRef();

  const baseColor = useMemo(
    () => new Color(settings.material.color),
    [settings.material.color],
  );
  const highlightColor = useMemo(() => {
    const c = new Color(settings.material.color);
    return c.lerp(new Color("#ffffff"), settings.highlightStrength);
  }, [settings.material.color, settings.highlightStrength]);
  const emissiveBase = useMemo(
    () => new Color(settings.material.color),
    [settings.material.color],
  );

  const bars = useMemo(() => {
    barIntensityRef.current = new Float32Array(settings.barCount).fill(0);
    rawAmplitudeRef.current = new Float32Array(settings.barCount);
    smoothedAmplitudeRef.current = new Float32Array(settings.barCount);

    return Array.from({ length: settings.barCount }, (_, i) => {
      const angle = (i / settings.barCount) * Math.PI * 2;
      const direction = new Vector3(
        Math.cos(angle),
        0,
        Math.sin(angle),
      );
      const basePosition = direction.clone().multiplyScalar(settings.radius);

      return {
        basePosition,
        direction,
        rotation: [0, -angle + Math.PI / 2, 0] as [number, number, number],
        index: i,
      };
    });
  }, [settings.barCount, settings.radius]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    let barHeights = barIntensityRef.current;
    let rawAmplitudes = rawAmplitudeRef.current;
    let smoothedAmplitudes = smoothedAmplitudeRef.current;

    const { barCount } = settings;
    if (barHeights.length !== barCount) {
      barHeights = barIntensityRef.current = new Float32Array(barCount).fill(0);
    }
    if (rawAmplitudes.length !== barCount) {
      rawAmplitudes = rawAmplitudeRef.current = new Float32Array(barCount);
    }
    if (smoothedAmplitudes.length !== barCount) {
      smoothedAmplitudes =
        smoothedAmplitudeRef.current = new Float32Array(barCount);
    }

    const frequencyData = getFrequencyData();
    const frequencyLength = frequencyData.length;

    const {
      rotationSpeed,
      smoothing,
      maxBarHeight,
      baseHeight,
      scaleMode,
      barWidth,
      radialThickness,
      emissiveIntensity,
      radius,
      audioThreshold,
      audioGain,
      frequencyRangeStart,
      frequencyRangeEnd,
    } = settings;

    const neighborSteps = Math.min(
      Math.round(smoothing * 8),
      Math.floor(barCount / 2),
    );

    if (frequencyLength === 0) {
      rawAmplitudes.fill(0);
    } else {
      // Calculate the actual frequency range to use
      const rangeStart = Math.floor(frequencyLength * frequencyRangeStart);
      const rangeEnd = Math.floor(frequencyLength * frequencyRangeEnd);
      const usableFrequencyLength = Math.max(1, rangeEnd - rangeStart);

      if (neighborSteps === 0) {
        for (let i = 0; i < barCount; i += 1) {
          const relativeIndex = (i / barCount) * usableFrequencyLength;
          const dataIndex = rangeStart + Math.floor(relativeIndex);
          const clampedIndex = Math.min(dataIndex, frequencyLength - 1);
          const normalized = (frequencyData[clampedIndex] ?? 0) / 255;
          // Apply audio threshold and gain
          const processed = Math.max(0, (normalized - audioThreshold) * audioGain);
          rawAmplitudes[i] = Math.min(1, processed);
        }
      } else {
        const binsPerBar = usableFrequencyLength / barCount;
        for (let i = 0; i < barCount; i += 1) {
          const relativeStart = i * binsPerBar;
          const relativeEnd = (i + 1) * binsPerBar;
          
          const start = rangeStart + Math.floor(relativeStart);
          let end = rangeStart + Math.floor(relativeEnd);
          if (start === end) {
            end = Math.min(start + 1, rangeEnd);
          }
          end = Math.min(end, frequencyLength);

          let sum = 0;
          let count = 0;
          for (let idx = start; idx < end; idx += 1) {
            sum += frequencyData[idx] ?? 0;
            count += 1;
          }

          if (count === 0) {
            const fallbackIndex = Math.min(frequencyLength - 1, start);
            sum += frequencyData[fallbackIndex] ?? 0;
            count = 1;
          }

          const normalized = sum / count / 255;
          // Apply audio threshold and gain
          const processed = Math.max(0, (normalized - audioThreshold) * audioGain);
          rawAmplitudes[i] = Math.min(1, processed);
        }
      }
    }

    if (neighborSteps > 0) {
      for (let i = 0; i < barCount; i += 1) {
        let weighted = 0;
        let weightSum = 0;

        for (let offset = -neighborSteps; offset <= neighborSteps; offset += 1) {
          const neighborIndex = (i + offset + barCount) % barCount;
          const distance = Math.abs(offset);
          const weight = 1 - distance / (neighborSteps + 1);
          weighted += rawAmplitudes[neighborIndex] * weight;
          weightSum += weight;
        }

        smoothedAmplitudes[i] =
          weightSum > 0 ? weighted / weightSum : rawAmplitudes[i];
      }
    }

    const amplitudeSource =
      neighborSteps > 0 ? smoothedAmplitudes : rawAmplitudes;

    group.rotation.y = playbackTimeRef.current * rotationSpeed;

    for (let i = 0; i < Math.min(group.children.length, barCount); i += 1) {
      const child = group.children[i];
      if (!(child instanceof Mesh)) {
        continue;
      }

      const bar = bars[i];
      if (!bar) {
        continue;
      }

      const amplitude = amplitudeSource[i] ?? 0;
      const eased = barHeights[i] * 0.7 + amplitude * 0.3;
      barHeights[i] = eased;

      const growth = Math.max(0, baseHeight + eased * maxBarHeight);

      if (scaleMode === "vertical") {
        child.scale.set(barWidth, growth, barWidth);
        child.position.set(bar.basePosition.x, growth / 2, bar.basePosition.z);
      } else {
        const thickness = radialThickness;
        child.scale.set(thickness, thickness, growth * 1.2);
        const actualLength = 0.28 * growth * 1.2;
        const offset = radius + actualLength / 2;
        child.position.set(
          bar.direction.x * offset,
          thickness / 2,
          bar.direction.z * offset,
        );
      }

      const material = child.material as MeshStandardMaterial;
      const blend = eased ** 1.5;
      material.color.copy(baseColor).lerp(highlightColor, blend);
      material.metalness = settings.material.metalness;
      material.roughness = settings.material.roughness;
      material.emissive
        .copy(emissiveBase)
        .multiplyScalar(0.2 + blend * emissiveIntensity);
    }
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 2, 0, 0]}>
      {bars.map((bar) => (
        <mesh key={bar.index} rotation={bar.rotation}>
          <boxGeometry args={[0.28, 1, 0.28]} />
          <meshStandardMaterial
            color={settings.material.color}
            metalness={settings.material.metalness}
            roughness={settings.material.roughness}
          />
        </mesh>
      ))}
    </group>
  );
};
