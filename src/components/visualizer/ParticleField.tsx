"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Matrix4,
  Color,
  InstancedMesh,
  MeshStandardMaterial,
  SphereGeometry,
  BoxGeometry,
  Vector3,
  Quaternion,
} from "three/webgpu";
import { usePlaybackTimeRef } from "@/context/playback-time-context";
import type { ParticleSettings } from "@/state/visualizer-store";

interface ParticleFieldProps {
  getFrequencyData: () => Uint8Array;
  settings: ParticleSettings;
}

interface ParticleData {
  baseDirections: Float32Array;
  seeds: Float32Array;
  baseRadius: Float32Array;
  swirlOffsets: Float32Array;
  energy: Float32Array;
}

const createParticleData = (count: number, spread: number): ParticleData => {
  const baseDirections = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const baseRadius = new Float32Array(count);
  const swirlOffsets = new Float32Array(count);
  const energy = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const dirX = Math.sin(phi) * Math.cos(theta);
    const dirY = Math.cos(phi) * 0.65;
    const dirZ = Math.sin(phi) * Math.sin(theta);

    const radius = spread * (0.4 + Math.random() * 0.6);

    baseDirections[i * 3] = dirX;
    baseDirections[i * 3 + 1] = dirY;
    baseDirections[i * 3 + 2] = dirZ;

    baseRadius[i] = radius;
    seeds[i] = Math.random() * Math.PI * 2;
    swirlOffsets[i] = Math.random() * 4 + 1;
    energy[i] = 0;
  }

  return { baseDirections, seeds, baseRadius, swirlOffsets, energy };
};

const geometryForShape = (shape: "sphere" | "cube") => {
  if (shape === "cube") {
    return new BoxGeometry(1, 1, 1, 1, 1, 1);
  }
  return new SphereGeometry(0.75, 24, 24);
};

export const ParticleField = ({ getFrequencyData, settings }: ParticleFieldProps) => {
  if (!settings.enabled) {
    return null;
  }

  const meshRef = useRef<InstancedMesh>(null);
  const dataRef = useRef<ParticleData | null>(null);
  const playbackTimeRef = usePlaybackTimeRef();
  const dummyMatrix = useMemo(() => new Matrix4(), []);
  const dummyPosition = useMemo(() => new Vector3(), []);
  const dummyScale = useMemo(() => new Vector3(1, 1, 1), []);
  const dummyQuaternion = useMemo(() => new Quaternion(), []);

  const baseColor = useMemo(
    () => new Color(settings.material.color),
    [settings.material.color],
  );
  const highlightColor = useMemo(() => {
    const c = new Color(settings.material.color);
    return c.lerp(new Color("#ffffff"), 0.5);
  }, [settings.material.color]);

  const geometry = useMemo(
    () => geometryForShape(settings.shape),
    [settings.shape],
  );

  const material = useMemo(() => {
    const mat = new MeshStandardMaterial();
    mat.transparent = true;
    return mat;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    dataRef.current = createParticleData(settings.count, settings.spread);
    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [settings.count, settings.spread, settings.shape]);

  useFrame(() => {
    const mesh = meshRef.current;
    const data = dataRef.current;
    if (!mesh || !data) return;

    const frequency = getFrequencyData();
    if (frequency.length === 0) return;

    const { baseDirections, seeds, swirlOffsets, baseRadius, energy } = data;
    const time = playbackTimeRef.current;

    let low = 0;
    let mid = 0;
    let high = 0;

    const third = Math.floor(frequency.length / 3);
    for (let i = 0; i < frequency.length; i += 1) {
      const normalized = frequency[i] / 255;
      if (i < third) {
        low += normalized;
      } else if (i < third * 2) {
        mid += normalized;
      } else {
        high += normalized;
      }
    }

    const lowAvg = low / Math.max(1, third);
    const midAvg = mid / Math.max(1, third);
    const highAvg = high / Math.max(1, frequency.length - third * 2);

    const swirlMultiplier = 0.3 + midAvg * 0.8;
    const expansion = lowAvg * settings.velocity * 2.4 + 0.15;
    const sparkle = highAvg * settings.trail * 1.4;

    for (let i = 0; i < settings.count; i += 1) {
      const dX = baseDirections[i * 3];
      const dY = baseDirections[i * 3 + 1];
      const dZ = baseDirections[i * 3 + 2];

      const spin = time * (0.35 + swirlOffsets[i] * 0.12);
      const spiral = Math.sin(spin + seeds[i]) * swirlMultiplier;

      const base = baseRadius[i] + expansion;
      const radius = base + spiral * settings.spread * 0.4;

      const x = dX * radius + Math.sin(time * 0.6 + seeds[i]) * 0.4;
      const y = dY * radius + Math.cos(time * 0.8 + seeds[i] * 1.7) * 0.3;
      const z = dZ * radius + Math.cos(time * 0.45 + seeds[i]) * 0.4;

      const energyTarget = Math.min(1, Math.abs(spiral) * 0.7 + sparkle * 0.9);
      energy[i] = energy[i] * (1 - settings.trail * 0.45) + energyTarget * settings.trail;

      const scale = settings.size * (0.8 + energy[i] * 2.4);

      dummyPosition.set(x, y, z);
      dummyScale.set(scale, scale, scale);
      dummyQuaternion.set(0, 0, 0, 1);
      dummyMatrix.compose(dummyPosition, dummyQuaternion, dummyScale);
      mesh.setMatrixAt(i, dummyMatrix);

      const colorMix = Math.min(1, energy[i] * 1.4 + sparkle * 0.6);
      const color = baseColor.clone().lerp(highlightColor, colorMix);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }

    material.color.copy(highlightColor);
    material.metalness = settings.material.metalness;
    material.roughness = settings.material.roughness;
    material.emissive
      .copy(baseColor)
      .multiplyScalar(0.25 + Math.min(0.75, sparkle + midAvg * 0.6));
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, settings.count]}
      key={`${settings.shape}-${settings.count}`}
    />
  );
};
