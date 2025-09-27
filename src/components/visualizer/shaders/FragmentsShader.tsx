"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshBasicNodeMaterial, AdditiveBlending } from "three/webgpu";
import {
  uniform,
  vec2,
  vec3,
  vec4,
  float,
  sin,
  cos,
  time,
  uv,
  length,
  abs,
  dot,
  normalize,
  round,
  add,
  clamp,
  mix,
  pow,
  min,
  max,
} from "three/tsl";

interface FragmentsShaderProps {
  getFrequencyData: () => Uint8Array;
  settings: {
    intensity: number;
    speed: number;
    contrast: number;
    fragmentation: number;
  };
}

const PI = float(3.14159265);
const PI2 = PI.mul(2);

const BASE_COLOR = vec3(0.08, 0.08, 0.14);
const MID_COLOR = vec3(0.52, 0.27, 0.71);
const HIGHLIGHT_COLOR = vec3(0.24, 0.76, 0.95);

export const FragmentsShader = ({
  getFrequencyData,
  settings,
}: FragmentsShaderProps) => {
  const intensityUniform = useMemo(() => uniform(0.5), []);
  const speedUniform = useMemo(() => uniform(settings.speed), []);
  const contrastUniform = useMemo(() => uniform(settings.contrast), []);
  const fragmentationUniform = useMemo(
    () => uniform(settings.fragmentation),
    [],
  );
  const audioPulseUniform = useMemo(() => uniform(0), []);

  const material = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    mat.transparent = true;
    mat.depthWrite = false;
    mat.blending = AdditiveBlending;

    const uvNode = uv();
    const resolution = vec2(1920, 1080);
    const FC = uvNode.mul(resolution);
    
    // Slow down time significantly
    const t = time.mul(speedUniform.mul(0.02)).add(audioPulseUniform.mul(0.1));
    
    // Simplified version of the fragments shader
    let accumulator = vec4(0, 0, 0, 0);
    
    // Main loop - simplified to avoid complex type issues
    for (let i = 0; i < 15; i++) {
      const iFloat = float(i);
      
      // Create varying patterns based on UV and time
      const centered = uvNode.mul(2).sub(1);
      const dist = length(centered);
      
      // Create fragments effect
      const wave1 = sin(dist.mul(fragmentationUniform.mul(5)).add(t.mul(0.5)).add(iFloat.mul(0.2)));
      const wave2 = sin(centered.x.mul(8).add(t.mul(0.3)).add(iFloat.mul(0.15)));
      const wave3 = sin(centered.y.mul(6).sub(t.mul(0.4)).add(iFloat.mul(0.1)));
      
      // Combine waves to create fragment-like effect
      const fragment = abs(wave1.mul(wave2)).add(abs(wave3).mul(0.5));
      
      // Color variation per iteration
      const colorShift = vec4(
        fragment.mul(sin(iFloat.mul(0.1).add(6))),
        fragment.mul(sin(iFloat.mul(0.1).add(1))), 
        fragment.mul(sin(iFloat.mul(0.1).add(2))),
        fragment
      );
      
      // Accumulate with falloff
      const falloff = float(1).div(iFloat.add(1));
      accumulator = accumulator.add(colorShift.mul(falloff));
    }
    
    // Apply tone mapping (approximation of tanh using clamp and scaling)
    const normalized = accumulator.div(50);
    const toneMapped = clamp(normalized.mul(2).sub(normalized.mul(normalized)), -1, 1);
    
    // Final color with settings
    const finalColor = toneMapped.mul(intensityUniform).mul(contrastUniform);
    
    // Ensure positive values and create final RGB
    const positiveColor = abs(finalColor);
    const colorResult = vec3(positiveColor.x, positiveColor.y, positiveColor.z);
    
    mat.colorNode = colorResult;
    mat.opacityNode = clamp(length(colorResult), 0, 1);

    return mat;
  }, [audioPulseUniform, contrastUniform, fragmentationUniform, intensityUniform, speedUniform]);

  useFrame(() => {
    const data = getFrequencyData();
    if (data.length === 0) return;

    let low = 0;
    let mid = 0;
    let high = 0;

    const third = Math.max(1, Math.floor(data.length / 3));

    for (let i = 0; i < data.length; i += 1) {
      const value = data[i] / 255;
      if (i < third) {
        low += value;
      } else if (i < third * 2) {
        mid += value;
      } else {
        high += value;
      }
    }

    const lowAvg = low / third;
    const midAvg = mid / third;
    const highAvg = high / Math.max(1, data.length - third * 2);

    audioPulseUniform.value = lowAvg;
    intensityUniform.value = settings.intensity + lowAvg * 0.5;
    speedUniform.value = settings.speed + midAvg * 0.2; // Much slower multiplier
    contrastUniform.value = settings.contrast + highAvg * 0.3;
    fragmentationUniform.value = settings.fragmentation + midAvg * 0.1;
  });

  return (
    <mesh
      position={[0, 1.8, -6]}
      scale={[14, 8.5, 1]}
      renderOrder={-3}
    >
      <planeGeometry />
      <primitive object={material} attach="material" />
    </mesh>
  );
};
