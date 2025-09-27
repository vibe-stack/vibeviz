"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshBasicNodeMaterial, AdditiveBlending } from "three/webgpu";
import {
  uniform,
  vec2,
  vec3,
  float,
  sin,
  time,
  uv,
  abs,
  mix,
  length,
  clamp,
  add,
  mul,
  sub,
} from "three/tsl";

interface PulseGridShaderProps {
  getFrequencyData: () => Uint8Array;
  settings: {
    intensity: number;
    speed: number;
    contrast: number;
    warp: number;
  };
}

const BASE_COLOR = vec3(0.08, 0.09, 0.15);
const ACCENT_COLOR = vec3(0.94, 0.46, 0.27);

export const PulseGridShader = ({
  getFrequencyData,
  settings,
}: PulseGridShaderProps) => {
  const intensityUniform = useMemo(() => uniform(0.4), []);
  const speedUniform = useMemo(() => uniform(settings.speed), []);
  const contrastUniform = useMemo(() => uniform(settings.contrast), []);
  const warpUniform = useMemo(() => uniform(settings.warp), []);

  const material = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    mat.transparent = true;
    mat.depthWrite = false;
    mat.blending = AdditiveBlending;

    const uvNode = uv();
    const centered = sub(uvNode, vec2(0.5));
    const radial = length(centered);
    const animatedTime = time.mul(speedUniform);

    const stripesX = abs(sin(uvNode.x.mul(24.0).add(animatedTime)));
    const stripesY = abs(
      sin(uvNode.y.mul(16.0).sub(animatedTime.mul(warpUniform).mul(0.7))),
    );

    const grid = clamp(add(stripesX, stripesY), 0.0, 2.0).mul(0.5);
    const ripple = abs(
      sin(radial.mul(warpUniform).mul(3.4).sub(animatedTime.mul(1.1))),
    );

    const glow = clamp(
      grid.mul(ripple).mul(contrastUniform).mul(intensityUniform).mul(1.6),
      0.0,
      1.0,
    );

    const colorBlend = mix(BASE_COLOR, ACCENT_COLOR, glow);
    mat.colorNode = colorBlend;
    mat.opacityNode = clamp(glow.mul(0.92).add(0.08), 0.0, 1.0);

    return mat;
  }, [contrastUniform, intensityUniform, speedUniform, warpUniform]);

  useFrame(() => {
    const data = getFrequencyData();
    if (data.length === 0) return;

    const split = Math.floor(data.length * 0.35);
    let low = 0;
    let high = 0;

    for (let i = 0; i < data.length; i += 1) {
      const normalized = data[i] / 255;
      if (i < split) {
        low += normalized;
      } else {
        high += normalized;
      }
    }

    const lowAvg = low / Math.max(1, split);
    const highAvg = high / Math.max(1, data.length - split);

    intensityUniform.value = lowAvg * settings.intensity * 2.1 + 0.18;
    speedUniform.value = settings.speed + highAvg * 0.6;
    contrastUniform.value = settings.contrast + highAvg * 0.4;
    warpUniform.value = settings.warp;
  });

  return (
    <mesh
      position={[0, 1.2, -5.5]}
      scale={[12, 7.5, 1]}
      renderOrder={-4}
    >
      <planeGeometry />
      <primitive object={material} attach="material" />
    </mesh>
  );
};
