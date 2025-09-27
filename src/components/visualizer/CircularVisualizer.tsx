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

interface CircularVisualizerProps {
  getFrequencyData: () => Uint8Array;
  settings: {
    radius: number;
    maxBarHeight: number;
    barCount: number;
  };
}

const BASE_COLOR = new Color("#3b82f6");
const HIGHLIGHT_COLOR = new Color("#67e8f9");

export const CircularVisualizer = ({
  getFrequencyData,
  settings,
}: CircularVisualizerProps) => {
  const groupRef = useRef<Group>(null);
  const barIntensityRef = useRef<Float32Array>(
    new Float32Array(settings.barCount).fill(0),
  );
  const playbackTimeRef = usePlaybackTimeRef();

  const bars = useMemo(() => {
    barIntensityRef.current = new Float32Array(settings.barCount).fill(0);

    return Array.from({ length: settings.barCount }, (_, i) => {
      const angle = (i / settings.barCount) * Math.PI * 2;
      const position = new Vector3(
        Math.cos(angle) * settings.radius,
        0,
        Math.sin(angle) * settings.radius,
      );

      return {
        position,
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
        const dataIndex = Math.floor(
          (i * frequencyData.length) / settings.barCount,
        );
        const amplitude = frequencyData[dataIndex] / 255;
        const smoothed = barHeights[i] * 0.7 + amplitude * 0.3;
        barHeights[i] = smoothed;

        const height = Math.max(0.12, smoothed * settings.maxBarHeight);
        child.scale.y = height;
        child.position.y = height / 2;

        const material = child.material as MeshStandardMaterial;
        const blend = smoothed ** 1.5;
        material.color.copy(BASE_COLOR).lerp(HIGHLIGHT_COLOR, blend);
        material.emissiveIntensity = 0.25 + blend * 0.6;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {bars.map((bar) => (
        <mesh key={bar.index} position={bar.position} rotation={bar.rotation}>
          <boxGeometry args={[0.28, 1, 0.28]} />
          <meshStandardMaterial
            color={BASE_COLOR}
            emissive="#1e3a8a"
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
};
