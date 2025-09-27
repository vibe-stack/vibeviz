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
import type { VortexSettings } from "@/state/visualizer-store";
import { samplePalette } from "../utils/colors";
import type { ParticleModeComponentProps } from "../ParticleSystem";

interface VortexData {
  directions: Float32Array;
  radii: Float32Array;
  seeds: Float32Array;
  heights: Float32Array;
  energies: Float32Array;
}

const createData = (
  count: number,
  radius: number,
  jitter: number,
): VortexData => {
  const directions = new Float32Array(count * 3);
  const radii = new Float32Array(count);
  const seeds = new Float32Array(count);
  const heights = new Float32Array(count);
  const energies = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);

    directions[i * 3] = x;
    directions[i * 3 + 1] = y;
    directions[i * 3 + 2] = z;

    radii[i] = radius * (0.35 + Math.random() * 0.65);
    seeds[i] = Math.random() * Math.PI * 2;
    heights[i] = (Math.random() - 0.5) * radius * jitter * 0.8;
    energies[i] = Math.random() * 0.2;
  }

  return { directions, radii, seeds, heights, energies };
};

type Props = ParticleModeComponentProps<VortexSettings>;

export const VortexParticles = ({
  global,
  material,
  geometry,
  palette,
  params,
  getAudioAnalysis,
  playbackTimeRef,
  materialConfig,
}: Props) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dataRef = useRef<VortexData | null>(null);

  const dummyMatrix = useMemo(() => new Matrix4(), []);
  const dummyPosition = useMemo(() => new Vector3(), []);
  const dummyScale = useMemo(() => new Vector3(1, 1, 1), []);
  const dummyQuaternion = useMemo(() => new Quaternion(), []);
  const workingColor = useMemo(() => new Color(), []);

  useEffect(() => {
    dataRef.current = createData(global.count, global.spawnRadius, global.spawnJitter);
    if (meshRef.current) {
      meshRef.current.count = global.count;
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [global.count, global.spawnJitter, global.spawnRadius]);

  useFrame(() => {
    const mesh = meshRef.current;
    const data = dataRef.current;
    if (!mesh || !data) return;

    const audio = getAudioAnalysis();
    const t = playbackTimeRef.current;

    const swirl = params.swirlStrength * (0.45 + audio.bands.mid * 1);
    const axial = params.axialPull * (0.35 + audio.bands.low * 0.9);
    const beatPulse = 1 + audio.beat * (params.beatPulse * 0.75);
    const noiseStrength = params.noiseStrength * (0.4 + audio.bands.high * 0.8);
    const drift = params.verticalDrift * (0.35 + audio.bands.mid * 0.65);

    const { directions, radii, seeds, heights, energies } = data;

    for (let i = 0; i < global.count; i += 1) {
      const dirX = directions[i * 3];
      const dirY = directions[i * 3 + 1];
      const dirZ = directions[i * 3 + 2];

      const seed = seeds[i];
      const baseRadius = radii[i];
      const baseHeight = heights[i];

      const swirlAngle = t * (0.12 + audio.average * 0.6) + seed * 1.15;
      const radialNoise = Math.sin(swirlAngle) * noiseStrength;
      const jitter = Math.cos(seed * 1.4 + t * 0.45) * global.spawnJitter * 0.25;

      const radius = baseRadius * beatPulse + radialNoise * global.spawnRadius;
      const height =
        baseHeight +
        dirY * axial * global.spawnRadius * 0.45 +
        Math.sin(t * 0.6 + seed) * drift * global.spawnRadius * 0.3;

      const x = dirX * radius + Math.sin(t * 0.4 + seed) * jitter;
      const y = dirY * radius * 0.35 + height;
      const z = dirZ * radius + Math.cos(t * 0.38 + seed * 1.1) * jitter;

      const energyTarget =
        audio.bands.high * 0.75 + audio.bands.mid * 0.35 + audio.beat * 0.9;
      const decay = 1 - global.trail * 0.4;
      energies[i] = energies[i] * decay + energyTarget * (1 - decay);

      const scale = global.size * (0.8 + energies[i] * 3.2 + audio.beat * 0.6);

      dummyPosition.set(x, y, z);
      dummyScale.set(scale, scale, scale);
      dummyQuaternion.set(0, 0, 0, 1);
      dummyMatrix.compose(dummyPosition, dummyQuaternion, dummyScale);
      mesh.setMatrixAt(i, dummyMatrix);

      const paletteMix = Math.min(1, energies[i] * 1.1 + audio.bands.mid * 0.6);
      mesh.setColorAt(i, samplePalette(palette, paletteMix, workingColor));
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }

    material.emissiveIntensity =
      materialConfig.emissiveIntensity * (0.7 + audio.bands.high * 0.8 + audio.beat * 0.6);
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, global.count]}
      key={`vortex-${global.count}`}
    />
  );
};
