"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Vector3,
  Group,
  Mesh,
  MeshStandardMaterial,
  Color,
} from "three/webgpu";
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
  const playbackTimeRef = usePlaybackTimeRef();

  const baseColor = useMemo(
    () => new Color(settings.material.color),
    [settings.material.color],
  );
  const highlightColor = useMemo(() => {
    const c = new Color(settings.material.color);
    return c.lerp(new Color("#ffffff"), 0.45);
  }, [settings.material.color]);
  const emissiveBase = useMemo(
    () => new Color(settings.material.color),
    [settings.material.color],
  );

  const bars = useMemo(() => {
    barIntensityRef.current = new Float32Array(settings.barCount).fill(0);

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
        rotation: [0, -angle, 0] as [number, number, number],
        index: i,
      };
    });
  }, [settings.barCount, settings.radius]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const frequencyData = getFrequencyData();
    const barHeights = barIntensityRef.current;

    group.rotation.y = playbackTimeRef.current * 0.05;

    for (let i = 0; i < group.children.length; i += 1) {
      const child = group.children[i];
      if (child instanceof Mesh) {
        const bar = bars[i];
        const dataIndex = Math.floor(
          (i * frequencyData.length) / settings.barCount,
        );
        const amplitude = frequencyData[dataIndex] / 255;
        const smoothed = barHeights[i] * 0.7 + amplitude * 0.3;
        barHeights[i] = smoothed;

        const growth = Math.max(0.12, smoothed * settings.maxBarHeight);

        if (settings.scaleMode === "vertical") {
          child.scale.set(1, growth, 1);
          child.position.set(bar.basePosition.x, growth / 2, bar.basePosition.z);
        } else {
          const thickness = 0.35;
          child.scale.set(thickness, thickness, growth * 1.2);
          const offset = settings.radius + (child.scale.z / 2);
          child.position.set(
            bar.direction.x * offset,
            thickness / 2,
            bar.direction.z * offset,
          );
        }

        const material = child.material as MeshStandardMaterial;
        const blend = smoothed ** 1.5;
        material.color.copy(baseColor).lerp(highlightColor, blend);
        material.metalness = settings.material.metalness;
        material.roughness = settings.material.roughness;
        material.emissive
          .copy(emissiveBase)
          .multiplyScalar(0.2 + blend * 0.6);
      }
    }
  });

  return (
    <group ref={groupRef}>
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
