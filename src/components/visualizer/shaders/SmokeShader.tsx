"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshBasicNodeMaterial, AdditiveBlending, Color } from "three/webgpu";
import {
  uniform,
  vec2,
  vec3,
  float,
  sin,
  time,
  uv,
  abs,
  clamp,
  length,
  mix,
  pow,
} from "three/tsl";

interface SmokeShaderProps {
  getFrequencyData: () => Uint8Array;
  settings: {
    intensity: number;
    speed: number;
    contrast: number;
    color: string;
    scale: number;
  };
}

export const SmokeShader = ({ getFrequencyData, settings }: SmokeShaderProps) => {
  const intensityUniform = useMemo(() => uniform(settings.intensity), []);
  const speedUniform = useMemo(() => uniform(settings.speed), []);
  const contrastUniform = useMemo(() => uniform(settings.contrast), []);
  const energyUniform = useMemo(() => uniform(0), []);
  const colorUniform = useMemo(() => uniform(new Color(settings.color)), []);
  const scaleUniform = useMemo(() => uniform(settings.scale), []);

  useEffect(() => {
    colorUniform.value.set(settings.color);
  }, [colorUniform, settings.color]);

  useEffect(() => {
    scaleUniform.value = settings.scale;
  }, [scaleUniform, settings.scale]);

  const material = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    mat.transparent = true;
    mat.depthWrite = false;
    mat.blending = AdditiveBlending;

    const uvNode = uv();
    const centered = uvNode.mul(2).sub(vec2(1));
    const radial = length(centered);
    const fade = clamp(float(1).sub(radial.mul(1.08)), 0.0, 1.0);

    const baseTime = time.mul(speedUniform.mul(0.08));
    const swirlTime = baseTime.add(energyUniform.mul(0.25));

    const flowSpace = centered.mul(scaleUniform.mul(3.2));
    const flowA = sin(flowSpace.x.add(swirlTime.mul(1.45)));
    const flowB = sin(flowSpace.y.sub(swirlTime.mul(1.1)));
    const flowC = sin(flowSpace.x.add(flowSpace.y).mul(0.85).add(swirlTime.mul(0.9)));

    const turbulence = abs(flowA.mul(0.6).add(flowB.mul(0.4))).add(abs(flowC).mul(0.9));
    const layered = pow(turbulence, intensityUniform.mul(1.7));
    const smoke = clamp(layered.mul(fade), 0.0, 1.0);

    const baseColor = vec3(0.05, 0.06, 0.1);
    const colorBlend = mix(baseColor, colorUniform, smoke.mul(contrastUniform));
    mat.colorNode = colorBlend;
    mat.opacityNode = clamp(smoke.mul(0.88).add(energyUniform.mul(0.32)), 0.0, 1.0);

    return mat;
  }, [colorUniform, contrastUniform, energyUniform, intensityUniform, scaleUniform, speedUniform]);

  useFrame(() => {
    const data = getFrequencyData();
    if (data.length === 0) return;

    let sum = 0;
    let peak = 0;
    for (let i = 0; i < data.length; i += 1) {
      const value = data[i] / 255;
      sum += value;
      if (value > peak) {
        peak = value;
      }
    }

    const average = sum / data.length;

    speedUniform.value = Math.max(0.01, settings.speed * (0.4 + peak * 0.9));
    intensityUniform.value = settings.intensity + average * 0.5;
    contrastUniform.value = settings.contrast + peak * 0.4;
    energyUniform.value = peak;
  });

  return (
    <mesh
      position={[0, 1.6, -6.2]}
      scale={[14 * settings.scale, 9.5 * settings.scale, 1]}
      renderOrder={-2}
    >
      <planeGeometry />
      <primitive object={material} attach="material" />
    </mesh>
  );
};
