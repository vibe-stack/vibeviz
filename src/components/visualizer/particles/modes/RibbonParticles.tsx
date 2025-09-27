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
import type { RibbonSettings } from "@/state/visualizer-store";
import { samplePalette } from "../utils/colors";
import type { ParticleModeComponentProps } from "../ParticleSystem";

interface RibbonData {
  bands: Uint16Array;
  segments: Uint16Array;
  phases: Float32Array;
  energies: Float32Array;
  segmentsPerBand: number;
}

const createData = (
  count: number,
  bandCount: number,
  trailLength: number,
): RibbonData => {
  const bands = new Uint16Array(count);
  const segments = new Uint16Array(count);
  const phases = new Float32Array(count);
  const energies = new Float32Array(count);

  const perBand = Math.max(
    4,
    Math.min(Math.floor(count / Math.max(1, bandCount)), Math.round(trailLength)),
  );

  for (let i = 0; i < count; i += 1) {
    const band = Math.floor(i / perBand) % Math.max(1, bandCount);
    const segment = i % perBand;
    bands[i] = band;
    segments[i] = segment;
    phases[i] = Math.random() * Math.PI * 2;
    energies[i] = Math.random() * 0.25;
  }

  return { bands, segments, phases, energies, segmentsPerBand: perBand };
};

type Props = ParticleModeComponentProps<RibbonSettings>;

export const RibbonParticles = ({
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
  const dataRef = useRef<RibbonData | null>(null);

  const dummyMatrix = useMemo(() => new Matrix4(), []);
  const dummyPosition = useMemo(() => new Vector3(), []);
  const dummyScale = useMemo(() => new Vector3(1, 1, 1), []);
  const dummyQuaternion = useMemo(() => new Quaternion(), []);
  const workingColor = useMemo(() => new Color(), []);

  useEffect(() => {
    dataRef.current = createData(
      global.count,
      Math.max(1, params.bandCount),
      Math.max(4, params.trailLength),
    );
    if (meshRef.current) {
      meshRef.current.count = global.count;
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [global.count, params.bandCount, params.trailLength]);

  useFrame(() => {
    const mesh = meshRef.current;
    const data = dataRef.current;
    if (!mesh || !data) return;

    const audio = getAudioAnalysis();
    const time = playbackTimeRef.current;

    const { bands, segments, phases, energies, segmentsPerBand } = data;
    const bandCount = Math.max(1, params.bandCount);

    for (let i = 0; i < global.count; i += 1) {
      const bandIndex = bands[i];
      const segmentIndex = segments[i];
      const phase = phases[i];

      const progress = segmentIndex / segmentsPerBand;
      const bandProgress = bandIndex / bandCount;

      const bandPhase = bandIndex * 0.9;
      const tempoSpin = time * (0.18 + audio.bands.low * 0.45) + bandPhase;

      const wave =
        Math.sin(time * params.waveFrequency + progress * Math.PI * 4 + phase) *
        params.waveAmplitude *
        (0.3 + audio.bands.mid * 1.2);
      const noise =
        Math.sin(phase + time * 0.9) * params.noiseStrength * global.spawnJitter;

      const radius =
        global.spawnRadius *
        (0.55 + bandProgress * 0.9 + wave * 0.14 + audio.bands.low * 0.35);

      const radialPulse = 1 + audio.beat * 0.22 + Math.sin(time * 0.6 + progress * Math.PI * 6 + bandPhase) * params.noiseStrength * 0.12;

      const angle =
        progress * Math.PI * 2 +
        bandProgress * Math.PI * 0.7 +
        tempoSpin * (0.6 + global.speed * 0.3) +
        wave * 0.1;

      const ribbonHeight =
        wave * global.spawnRadius * 0.32 +
        Math.cos(time * 0.35 + bandProgress * 2.4) *
          params.noiseStrength *
          0.75 +
        Math.sin(progress * Math.PI * 4 + tempoSpin) * global.spawnRadius * 0.08;

      const x = Math.cos(angle) * radius * radialPulse + Math.sin(progress * Math.PI * 6) * noise;
      const y = ribbonHeight;
      const z = Math.sin(angle) * radius * radialPulse + Math.cos(progress * Math.PI * 6) * noise;

      const targetEnergy =
        audio.bands.high * 0.9 + audio.bands.mid * 0.55 + audio.beat * 1;
      const decay = 1 - Math.min(0.9, global.trail * 0.55);
      energies[i] = energies[i] * decay + targetEnergy * (1 - decay);

      const scale =
        global.size *
        (0.6 + energies[i] * 2.9 + (1 - Math.abs(0.5 - progress)) * 1.1 + audio.bands.high * 0.8);

      dummyPosition.set(x, y, z);
      dummyScale.set(scale, scale * 0.55, scale * 1.15);
      dummyQuaternion.set(0, 0, 0, 1);
      dummyMatrix.compose(dummyPosition, dummyQuaternion, dummyScale);
      mesh.setMatrixAt(i, dummyMatrix);

      const paletteMix = Math.min(1, progress * 0.5 + energies[i] * 1.2 + audio.beat * 0.3);
      mesh.setColorAt(i, samplePalette(palette, paletteMix, workingColor));
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }

    material.emissiveIntensity =
      materialConfig.emissiveIntensity * (0.75 + audio.bands.mid * 0.9 + audio.beat * 0.4);
    material.opacity = materialConfig.opacity * (0.9 + audio.peak * 0.1);
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, global.count]}
      key={`ribbons-${global.count}`}
    />
  );
};
