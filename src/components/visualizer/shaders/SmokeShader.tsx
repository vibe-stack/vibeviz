"use client";

import { useEffect, useMemo, useRef } from "react";
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

  const smoothedPeakRef = useRef(0);
  const smoothedAverageRef = useRef(0);

  useEffect(() => {
    intensityUniform.value = settings.intensity;
  }, [intensityUniform, settings.intensity]);

  useEffect(() => {
    speedUniform.value = settings.speed;
  }, [settings.speed, speedUniform]);

  useEffect(() => {
    contrastUniform.value = settings.contrast;
  }, [contrastUniform, settings.contrast]);

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
    const stretched = centered.mul(vec2(1, 0.82));
    const radial = length(stretched);
    const radialFade = clamp(float(1).sub(pow(radial.mul(1.12), float(1.05))), 0.0, 1.0);
    const verticalFade = clamp(float(1).sub(abs(stretched.y).mul(1.25)), 0.0, 1.0);
    const edgeFade = radialFade.mul(verticalFade);

    const timePrimary = time.mul(speedUniform.mul(0.022)).add(energyUniform.mul(0.12));
    const timeSecondary = time.mul(speedUniform.mul(0.011));

    const swirlBase = radial.mul(2.4).add(timePrimary.mul(0.42));
    const swirlSin = sin(swirlBase);
    const swirlCos = sin(swirlBase.add(float(1.57079632679)));
    const rotated = vec2(
      stretched.x.mul(swirlCos).sub(stretched.y.mul(swirlSin)),
      stretched.x.mul(swirlSin).add(stretched.y.mul(swirlCos))
    );

    const drift = vec2(
      sin(timeSecondary.mul(0.7)).mul(0.22),
      sin(timeSecondary.mul(0.49).add(float(2.1))).mul(0.18)
    );

    const flowSpace = rotated.add(drift).mul(scaleUniform.mul(2.2));
    const warpX = sin(flowSpace.y.mul(1.7).add(timePrimary.mul(0.6))).mul(0.45);
    const warpY = sin(flowSpace.x.mul(1.35).sub(timePrimary.mul(0.48))).mul(0.38);
    const domainWarp = vec2(warpX, warpY);
    const warped = flowSpace.add(domainWarp.mul(0.6));

    const layer1 = sin(warped.x.add(timePrimary.mul(0.52))).mul(0.55);
    const layer2 = sin(warped.y.sub(timePrimary.mul(0.37))).mul(0.5);
    const layer3 = sin(warped.x.add(warped.y).mul(0.85).add(timeSecondary.mul(1.1))).mul(0.4);
    const layer4 = sin(length(warped).mul(1.7).sub(timePrimary.mul(0.29))).mul(0.35);
    const detail = sin(warped.x.mul(2.6).add(warped.y.mul(1.4)).add(timeSecondary.mul(0.9))).mul(0.22);

    const turbulence = abs(layer1)
      .add(abs(layer2).mul(0.85))
      .add(abs(layer3).mul(0.75))
      .add(abs(layer4).mul(0.65))
      .add(abs(detail).mul(0.55));

    const wisps = pow(turbulence.mul(0.78).add(0.18), intensityUniform.mul(1.1).add(float(0.15)));
    const smokeBody = clamp(wisps.mul(edgeFade), 0.0, 1.0);
    const filament = clamp(pow(wisps, float(1.8)).mul(0.85), 0.0, 1.0);

    const bodyStrength = clamp(smokeBody.mul(contrastUniform.mul(0.6).add(0.4)), 0.0, 1.0);
    const highlightMask = clamp(filament.mul(contrastUniform.mul(0.35).add(0.2)).add(energyUniform.mul(0.18)), 0.0, 1.0);

    const baseColor = vec3(0.07, 0.08, 0.1);
    const midTone = vec3(0.16, 0.17, 0.19);
    const highlightBase = mix(midTone.add(vec3(0.05, 0.05, 0.05)), colorUniform, clamp(highlightMask.mul(0.7), 0.0, 1.0));
    const tinted = mix(baseColor, midTone, clamp(bodyStrength.mul(1.1), 0.0, 1.0));
    const colorBlend = mix(tinted, highlightBase, highlightMask);

    mat.colorNode = colorBlend;
    mat.opacityNode = clamp(smokeBody.mul(0.52).add(filament.mul(0.3)).add(energyUniform.mul(0.14)), 0.0, 1.0);

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

    const smoothing = 0.12;
    smoothedPeakRef.current += (peak - smoothedPeakRef.current) * smoothing;
    smoothedAverageRef.current += (average - smoothedAverageRef.current) * smoothing;

    const peakEnergy = smoothedPeakRef.current;
    const averageEnergy = smoothedAverageRef.current;

    const targetSpeed = Math.max(0.015, settings.speed * (0.22 + averageEnergy * 0.25 + peakEnergy * 0.25));
    speedUniform.value = speedUniform.value * 0.9 + targetSpeed * 0.1;

    const targetIntensity = settings.intensity + averageEnergy * 0.25 + peakEnergy * 0.15;
    intensityUniform.value = intensityUniform.value * 0.88 + targetIntensity * 0.12;

    const targetContrast = settings.contrast + peakEnergy * 0.16 + averageEnergy * 0.08;
    contrastUniform.value = contrastUniform.value * 0.88 + targetContrast * 0.12;

    const targetEnergy = peakEnergy * 0.6 + averageEnergy * 0.4;
    energyUniform.value = energyUniform.value * 0.8 + targetEnergy * 0.2;
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
