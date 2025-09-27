"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Group, Mesh, MeshStandardMaterial } from "three";

interface CircularVisualizerProps {
  frequencyData: Uint8Array;
  radius: number;
  maxBarHeight: number;
  barCount?: number;
}

export const CircularVisualizer = ({
  frequencyData,
  radius,
  maxBarHeight,
  barCount = 64,
}: CircularVisualizerProps) => {
  const groupRef = useRef<Group>(null);

  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const angle = (i / barCount) * Math.PI * 2;
      const position = new Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius,
      );

      return {
        position,
        rotation: [0, -angle, 0] as [number, number, number],
        index: i,
      };
    });
  }, [barCount, radius]);

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((child, i) => {
      if (child.type === "Mesh") {
        const dataIndex = Math.floor((i * frequencyData.length) / barCount);
        const amplitude = frequencyData[dataIndex] / 255;
        const height = Math.max(0.1, amplitude * maxBarHeight);

        child.scale.y = height;
        child.position.y = height / 2;

        // Color based on frequency amplitude
        const material = (child as Mesh).material as MeshStandardMaterial;
        if (material.color) {
          const hue = 0.6 - amplitude * 0.3; // Blue to cyan
          material.color.setHSL(hue, 0.8, 0.5 + amplitude * 0.3);
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {bars.map((bar, i) => (
        <mesh key={i} position={bar.position} rotation={bar.rotation}>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#1e40af"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};
