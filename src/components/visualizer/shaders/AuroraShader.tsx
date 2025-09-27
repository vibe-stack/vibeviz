"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshBasicNodeMaterial, AdditiveBlending } from "three/webgpu";
import {
  uniform,
  vec3,
  mix,
  sin,
  time,
  uv,
  mul,
  clamp,
  pow,
} from "three/tsl";

interface AuroraShaderProps {
  getFrequencyData: () => Uint8Array;
  settings: {
    intensity: number;
    speed: number;
    contrast: number;
  };
}

const LOW_COLOR = vec3(0.066, 0.172, 0.38);
const HIGH_COLOR = vec3(0.384, 0.741, 0.957);

export const AuroraShader = ({
  getFrequencyData,
  settings,
}: AuroraShaderProps) => {
  const intensityUniform = useMemo(() => uniform(0.5), []);
  const speedUniform = useMemo(() => uniform(settings.speed), []);
  const contrastUniform = useMemo(() => uniform(settings.contrast), []);

  const material = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    mat.transparent = true;
    mat.depthWrite = false;
    mat.blending = AdditiveBlending;

    const uvNode = uv();
    const waveTime = time.mul(speedUniform).add(uvNode.x.mul(4.5));
    const verticalSweep = sin(waveTime).mul(0.5).add(0.5);
    const ribbon = sin(waveTime.mul(1.6).add(uvNode.y.mul(7.5))).mul(0.5).add(0.5);
    const glow = clamp(pow(verticalSweep.mul(ribbon), contrastUniform), 0.0, 1.0);
    const colorBlend = mix(LOW_COLOR, HIGH_COLOR, verticalSweep);

    mat.colorNode = colorBlend.mul(mul(glow, intensityUniform).add(0.35));
    mat.opacityNode = clamp(glow.mul(intensityUniform).mul(0.9).add(0.1), 0.0, 1.0);

    return mat;
  }, [contrastUniform, intensityUniform, speedUniform]);

  useFrame(() => {
    const data = getFrequencyData();
    if (data.length === 0) return;

    let sum = 0;
    for (let i = 0; i < data.length; i += 1) {
      sum += data[i];
    }

    const average = sum / (data.length * 255);
    intensityUniform.value = average * settings.intensity * 2.2 + 0.2;
    speedUniform.value = settings.speed;
    contrastUniform.value = settings.contrast;
  });

  return (
    <mesh
      position={[0, 2.4, -6.5]}
      scale={[16, 10, 1]}
      renderOrder={-5}
    >
      <planeGeometry />
      <primitive object={material} attach="material" />
    </mesh>
  );
};
