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
import type { OrbitSettings } from "@/state/visualizer-store";
import { samplePalette } from "../utils/colors";
import type { ParticleModeComponentProps } from "../ParticleSystem";

interface OrbitData {
  rings: Uint16Array;
  phases: Float32Array;
  offsets: Float32Array;
  energies: Float32Array;
}

const createData = (count: number, ringCount: number): OrbitData => {
  const rings = new Uint16Array(count);
  const phases = new Float32Array(count);
  const offsets = new Float32Array(count);
  const energies = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    rings[i] = i % ringCount;
    phases[i] = Math.random() * Math.PI * 2;
    offsets[i] = Math.random();
    energies[i] = Math.random() * 0.3;
  }

  return { rings, phases, offsets, energies };
};

type Props = ParticleModeComponentProps<OrbitSettings>;

export const OrbitParticles = ({
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
  const dataRef = useRef<OrbitData | null>(null);

  const dummyMatrix = useMemo(() => new Matrix4(), []);
  const dummyPosition = useMemo(() => new Vector3(), []);
  const dummyScale = useMemo(() => new Vector3(1, 1, 1), []);
  const dummyQuaternion = useMemo(() => new Quaternion(), []);
  const workingColor = useMemo(() => new Color(), []);

  useEffect(() => {
    dataRef.current = createData(global.count, Math.max(1, params.ringCount));
    if (meshRef.current) {
      meshRef.current.count = global.count;
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [global.count, params.ringCount]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const data = dataRef.current;
    if (!mesh || !data) return;

    const audio = getAudioAnalysis();
    const time = playbackTimeRef.current;
    const { rings, phases, offsets, energies } = data;
    const ringCount = Math.max(1, params.ringCount);

    for (let i = 0; i < global.count; i += 1) {
      const ringIndex = rings[i];
      const phase = phases[i];
      const offset = offsets[i];

      const ringProgress = ringIndex / ringCount;
      const radiusBase =
        params.radius * (0.65 + ringProgress * (1 + params.twist * 0.6));
      const wobble =
        Math.sin(time * (0.8 + ringProgress * 0.3) + phase) *
        params.wobble *
        (0.3 + audio.bands.mid * 1.1);

      const orbitSpeed =
        (0.08 + audio.bands.mid * 0.12 + ringProgress * 0.05) *
        (1 + params.tempoFollow * audio.bands.low * 0.4) *
        (0.6 + global.speed * 0.45);
      const angle =
        phase +
        time * orbitSpeed +
        wobble * 0.35 +
        audio.beat * (0.22 + offset * 0.35);

      const radius = radiusBase * (1 + wobble * 0.35);
      const verticalSwing =
        Math.sin(time * 0.5 + phase * 2.1) * global.spawnJitter * 0.6;
      const y =
        verticalSwing +
        Math.cos(angle * 0.5 + ringProgress) *
          params.wobble *
          global.spawnRadius *
          0.15;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const targetEnergy =
        audio.bands.mid * 0.7 + audio.bands.high * 0.5 + audio.beat * 0.8;
      const decay = 1 - Math.min(0.86, global.trail * 0.5);
      energies[i] = energies[i] * decay + targetEnergy * (1 - decay);

      const scale = global.size * (0.7 + energies[i] * 2.8 + offset * 0.4);

      dummyPosition.set(x, y, z);
      dummyScale.set(scale, scale, scale);
      dummyQuaternion.set(0, 0, 0, 1);
      dummyMatrix.compose(dummyPosition, dummyQuaternion, dummyScale);
      mesh.setMatrixAt(i, dummyMatrix);

      const paletteMix = Math.min(1, energies[i] * 1.2 + ringProgress * 0.3);
      mesh.setColorAt(i, samplePalette(palette, paletteMix, workingColor));
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }

    material.emissiveIntensity =
      materialConfig.emissiveIntensity * (0.65 + audio.bands.mid * 0.9 + audio.beat * 0.5);
    material.opacity = materialConfig.opacity;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, global.count]}
      key={`orbits-${global.count}`}
    />
  );
};
