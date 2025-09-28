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
import type { NebulaSettings } from "@/state/visualizer-store";
import { samplePalette } from "../utils/colors";
import type { ParticleModeComponentProps } from "../ParticleSystem";
import { pseudoCurlNoise, pseudoNoise3 } from "../utils/noise";

interface NebulaData {
  origins: Float32Array;
  seeds: Float32Array;
  energies: Float32Array;
}

const createData = (count: number, radius: number): NebulaData => {
  const origins = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const energies = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.2 + Math.random() * 0.8);

    origins[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
    origins[i * 3 + 1] = Math.cos(phi) * r * 0.6;
    origins[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;

    seeds[i] = Math.random() * 10;
    energies[i] = Math.random() * 0.4;
  }

  return { origins, seeds, energies };
};

type Props = ParticleModeComponentProps<NebulaSettings>;

export const NebulaParticles = ({
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
  const dataRef = useRef<NebulaData | null>(null);
  const smoothedAudioRef = useRef({
    initialized: false,
    low: 0,
    mid: 0,
    high: 0,
    beat: 0,
  });

  const dummyMatrix = useMemo(() => new Matrix4(), []);
  const dummyPosition = useMemo(() => new Vector3(), []);
  const dummyScale = useMemo(() => new Vector3(1, 1, 1), []);
  const dummyQuaternion = useMemo(() => new Quaternion(), []);
  const workingColor = useMemo(() => new Color(), []);

  useEffect(() => {
    dataRef.current = createData(global.count, global.spawnRadius);
    if (meshRef.current) {
      meshRef.current.count = global.count;
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [global.count, global.spawnRadius]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const data = dataRef.current;
    if (!mesh || !data) return;

    const audio = getAudioAnalysis();
    const time = playbackTimeRef.current;

    const { origins, seeds, energies } = data;

    const smoothingAmount = Math.min(Math.max(params.smoothing, 0), 1);
    const smoothingTime = smoothingAmount * 0.45;
    const lerpFactor = smoothingAmount <= 0 ? 1 : delta / (smoothingTime + delta);

    const smoothed = smoothedAudioRef.current;
    if (!smoothed.initialized) {
      smoothed.low = audio.bands.low;
      smoothed.mid = audio.bands.mid;
      smoothed.high = audio.bands.high;
      smoothed.beat = audio.beat;
      smoothed.initialized = true;
    } else {
      smoothed.low += (audio.bands.low - smoothed.low) * lerpFactor;
      smoothed.mid += (audio.bands.mid - smoothed.mid) * lerpFactor;
      smoothed.high += (audio.bands.high - smoothed.high) * lerpFactor;
      smoothed.beat += (audio.beat - smoothed.beat) * lerpFactor;
    }

    const impact = Math.max(0, params.impact);
    const impactedLow = smoothed.low * impact;
    const impactedMid = smoothed.mid * impact;
    const impactedHigh = smoothed.high * impact;
    const impactedBeat = smoothed.beat * impact;

    const curlStrength = params.curlStrength * (0.4 + impactedMid * 1.2);
    const shimmer = params.shimmer * (0.5 + impactedHigh * 1.1);
    const energyTargetBase =
      impactedLow * 0.5 + impactedHigh * 0.7 + impactedBeat * shimmer;

    for (let i = 0; i < global.count; i += 1) {
      const baseX = origins[i * 3];
      const baseY = origins[i * 3 + 1];
      const baseZ = origins[i * 3 + 2];
      const seed = seeds[i];

      const flow = pseudoCurlNoise(
        baseX * params.noiseScale * 0.3 + time * params.driftSpeed,
        baseY * params.noiseScale * 0.3 + seed,
        baseZ * params.noiseScale * 0.3 - time * params.driftSpeed,
        0.5,
      );

      const offsetX = flow.x * curlStrength * global.spawnRadius;
      const offsetY = flow.y * curlStrength * global.spawnRadius * 0.8;
      const offsetZ = flow.z * curlStrength * global.spawnRadius;

      const noise =
        pseudoNoise3(
          baseX * params.noiseScale + time * params.driftSpeed,
          baseY * params.noiseScale - seed,
          baseZ * params.noiseScale + time * params.driftSpeed * 0.7,
        ) - 0.5;

      const x = baseX + offsetX + noise * global.spawnRadius * 0.45;
      const y = baseY + offsetY + noise * global.spawnRadius * 0.32;
      const z = baseZ + offsetZ + noise * global.spawnRadius * 0.45;

      const energyTarget = energyTargetBase;
      const decay = 1 - Math.min(0.88, global.trail * params.fade);
      energies[i] = energies[i] * decay + energyTarget * (1 - decay);

      const scale =
        global.size *
        (0.9 + energies[i] * 2.8 + Math.abs(noise) * params.shimmer * 1.4);

      dummyPosition.set(x, y, z);
      dummyScale.set(scale, scale, scale);
      dummyQuaternion.set(0, 0, 0, 1);
      dummyMatrix.compose(dummyPosition, dummyQuaternion, dummyScale);
      mesh.setMatrixAt(i, dummyMatrix);

      const paletteMix = Math.min(1, 0.35 + energies[i] + Math.abs(noise) * 0.6);
      mesh.setColorAt(i, samplePalette(palette, paletteMix, workingColor));
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }

    material.emissiveIntensity =
      materialConfig.emissiveIntensity *
      (0.6 + impactedHigh * 1.1 + impactedBeat * 0.8);
    material.opacity =
      materialConfig.opacity * (0.85 + impactedMid * 0.15);
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, global.count]}
      key={`nebula-${global.count}`}
    />
  );
};
