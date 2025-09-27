"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from "three/webgpu";
import type { BurstSettings } from "@/state/visualizer-store";
import { samplePalette } from "../utils/colors";
import type { ParticleModeComponentProps } from "../ParticleSystem";

interface BurstData {
  positions: Float32Array;
  velocities: Float32Array;
  ages: Float32Array;
  lifetimes: Float32Array;
  seeds: Float32Array;
}

const createData = (count: number): BurstData => ({
  positions: new Float32Array(count * 3),
  velocities: new Float32Array(count * 3),
  ages: new Float32Array(count),
  lifetimes: new Float32Array(count),
  seeds: new Float32Array(count),
});

type Props = ParticleModeComponentProps<BurstSettings>;

export const BurstParticles = ({
  global,
  geometry,
  material,
  palette,
  params,
  getAudioAnalysis,
  playbackTimeRef,
  materialConfig,
}: Props) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dataRef = useRef<BurstData | null>(null);
  const spawnCursorRef = useRef(0);
  const audioRef = useRef(getAudioAnalysis());

  const dummyMatrix = useMemo(() => new Matrix4(), []);
  const dummyPosition = useMemo(() => new Vector3(), []);
  const dummyScale = useMemo(() => new Vector3(1, 1, 1), []);
  const dummyQuaternion = useMemo(() => new Quaternion(), []);
  const workingColor = useMemo(() => new Color(), []);

  useEffect(() => {
    dataRef.current = createData(global.count);
    spawnCursorRef.current = 0;
    if (dataRef.current) {
      const { ages, lifetimes, seeds } = dataRef.current;
      for (let i = 0; i < global.count; i += 1) {
        ages[i] = Number.POSITIVE_INFINITY;
        lifetimes[i] = 1;
        seeds[i] = Math.random();
      }
    }
    if (meshRef.current) {
      meshRef.current.count = global.count;
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [global.count]);

  const respawnParticle = (index: number, audioBeat: number) => {
    const data = dataRef.current;
    if (!data) return;

    const { positions, velocities, ages, lifetimes, seeds } = data;
    const seed = (seeds[index] + Math.random()) % 1;
    seeds[index] = seed;

    const theta = seed * Math.PI * 2;
    const phi = Math.acos(2 * seed - 1);
    const dirX = Math.sin(phi) * Math.cos(theta);
    const dirY = Math.cos(phi);
    const dirZ = Math.sin(phi) * Math.sin(theta);

    const burstPower = params.burstStrength * (0.8 + audioBeat * 1.6);
    const spread = params.burstSpread * (0.4 + audioRef.current.bands.high * 0.9);

    positions[index * 3] = dirX * global.spawnRadius * spread * 0.4;
    positions[index * 3 + 1] = dirY * global.spawnRadius * spread * 0.25;
    positions[index * 3 + 2] = dirZ * global.spawnRadius * spread * 0.4;

    velocities[index * 3] = dirX * burstPower;
    velocities[index * 3 + 1] = burstPower * (0.6 + dirY * 0.4);
    velocities[index * 3 + 2] = dirZ * burstPower;

    ages[index] = 0;
    lifetimes[index] = (0.6 + Math.random() * 0.8) * params.decay;
  };

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const data = dataRef.current;
    if (!mesh || !data) return;

    const audio = getAudioAnalysis();
    audioRef.current = audio;

    const limitedDelta = Math.min(delta, 0.05);
    const time = playbackTimeRef.current;
    const spawnRate =
      (params.emissionRate * (0.2 + audio.bands.high * 1.1) +
        audio.beat * params.emissionRate) *
      limitedDelta;
    const spawnCount = Math.floor(spawnRate);
    let remainder = spawnRate - spawnCount;
    if (Math.random() < remainder) {
      remainder = 0;
    }

    for (let s = 0; s < spawnCount; s += 1) {
      const index = spawnCursorRef.current % global.count;
      spawnCursorRef.current += 1;
      respawnParticle(index, audio.beat);
    }

    const { positions, velocities, ages, lifetimes, seeds } = data;

    for (let i = 0; i < global.count; i += 1) {
      const age = ages[i];
      const lifetime = lifetimes[i];

      if (age >= lifetime) {
        if (audio.beat > 0.4 && Math.random() < audio.beat * 0.6) {
          respawnParticle(i, audio.beat);
        }
        continue;
      }

      const velocityIndex = i * 3;
      const positionIndex = i * 3;

      const decay = 1 - Math.min(0.92, global.drag * 1.6) * limitedDelta;
      velocities[velocityIndex] *= decay;
      velocities[velocityIndex + 1] =
        (velocities[velocityIndex + 1] - params.gravity * limitedDelta) * decay;
      velocities[velocityIndex + 2] *= decay;

      positions[positionIndex] +=
        velocities[velocityIndex] * global.speed * limitedDelta;
      positions[positionIndex + 1] +=
        velocities[velocityIndex + 1] * global.speed * limitedDelta;
      positions[positionIndex + 2] +=
        velocities[velocityIndex + 2] * global.speed * limitedDelta;

      const swirl = time * 0.25 + seeds[i] * 12;
      positions[positionIndex] +=
        Math.cos(swirl) * limitedDelta * (0.6 + audio.bands.mid * 0.8);
      positions[positionIndex + 2] +=
        Math.sin(swirl) * limitedDelta * (0.6 + audio.bands.mid * 0.8);

      ages[i] = age + limitedDelta;

      const normalizedAge = Math.min(1, ages[i] / lifetime);
      const brightness = 1 - normalizedAge;
      const energy =
        brightness * (0.5 + audio.bands.high * 0.8) + audio.beat * 0.6;

      const scale = global.size * (0.5 + brightness * 2.2 + audio.beat * 0.8);

      dummyPosition.set(
        positions[positionIndex],
        positions[positionIndex + 1],
        positions[positionIndex + 2],
      );
      dummyScale.set(scale, scale, scale);
      dummyQuaternion.set(0, 0, 0, 1);
      dummyMatrix.compose(dummyPosition, dummyQuaternion, dummyScale);
      mesh.setMatrixAt(i, dummyMatrix);

      mesh.setColorAt(
        i,
        samplePalette(palette, Math.min(1, energy), workingColor),
      );
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }

    material.emissiveIntensity =
      materialConfig.emissiveIntensity * (0.6 + audio.beat * 1.4 + audio.peak * 0.5);
    material.opacity = materialConfig.opacity * (0.8 + audio.beat * 0.2);
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, global.count]}
      key={`bursts-${global.count}`}
    />
  );
};
