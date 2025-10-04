"use client";

import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import type { Mesh } from "three";
import * as THREE from "three";
import { isPlayingAtom } from "@/features/audio/state";
import { isExportingAtom } from "@/features/export/state";
import type { ShaderObject } from "@/features/scene/types";
import { useShaderAudioAnalyzer } from "@/features/shaders/hooks/use-shader-audio-analyzer";
import { createGalaxyTravelMaterial } from "@/features/shaders/materials/galaxy-travel-material";
import { createRainbowMaterial } from "@/features/shaders/materials/rainbow-material";
import { createStarryNightMaterial } from "@/features/shaders/materials/starry-night-material";
import { createSupernovaRemnantMaterial } from "@/features/shaders/materials/supernova-remnant-material";
import type {
  BlendMode,
  GalaxyTravelControls,
  RainbowControls,
  StarryNightControls,
  SupernovaRemnantControls,
} from "@/features/shaders/types";

type ShaderRendererProps = {
  object: ShaderObject;
  isSelected: boolean;
};

// Helper function to convert blend mode string to THREE.js constant
const getBlendMode = (mode: BlendMode): THREE.Blending => {
  switch (mode) {
    case "none":
      return THREE.NoBlending;
    case "additive":
      return THREE.AdditiveBlending;
    case "subtractive":
      return THREE.SubtractiveBlending;
    case "multiply":
      return THREE.MultiplyBlending;
    case "custom":
      return THREE.CustomBlending;
    default:
      return THREE.NormalBlending;
  }
};

export function ShaderRenderer({ object }: ShaderRendererProps) {
  const meshRef = useRef<Mesh>(null);
  const isPlaying = useAtomValue(isPlayingAtom);
  const isExporting = useAtomValue(isExportingAtom);
  const { getAudioLevel } = useShaderAudioAnalyzer();

  // biome-ignore lint/correctness/useExhaustiveDependencies(object.controls): suppress dependency analysis warning
  const shaderMaterial = useMemo(() => {
    switch (object.shaderType) {
      case "rainbow":
        return createRainbowMaterial(
          object.controls as unknown as RainbowControls,
        );
      case "starryNight":
        return createStarryNightMaterial(
          object.controls as StarryNightControls,
        );
      case "galaxyTravel":
        return createGalaxyTravelMaterial(
          object.controls as GalaxyTravelControls,
        );
      case "supernovaRemnant":
        return createSupernovaRemnantMaterial(
          object.controls as SupernovaRemnantControls,
        );
      default:
        return null;
    }
  }, [object.shaderType]);

  // Update shader controls when object controls change
  useEffect(() => {
    if (!shaderMaterial || !("updateControls" in shaderMaterial)) return;

    switch (object.shaderType) {
      case "rainbow":
        shaderMaterial.updateControls(
          object.controls as unknown as RainbowControls,
        );
        break;
      case "starryNight":
        shaderMaterial.updateControls(object.controls as StarryNightControls);
        break;
      case "galaxyTravel":
        shaderMaterial.updateControls(object.controls as GalaxyTravelControls);
        break;
      case "supernovaRemnant":
        shaderMaterial.updateControls(
          object.controls as SupernovaRemnantControls,
        );
        break;
    }
  }, [object.controls, object.shaderType, shaderMaterial]);

  // Update blend mode
  useEffect(() => {
    if (!shaderMaterial) return;

    const controls = object.controls as
      | RainbowControls
      | StarryNightControls
      | GalaxyTravelControls
      | SupernovaRemnantControls;

    const blendMode = getBlendMode(controls.blendMode);
    shaderMaterial.material.blending = blendMode;

    // Enable transparency for non-normal blend modes or when opacity < 1
    const needsTransparency =
      controls.blendMode !== "normal" || controls.opacity < 1;
    shaderMaterial.material.transparent = needsTransparency;
    shaderMaterial.material.depthWrite =
      controls.blendMode === "normal" && controls.opacity >= 1;

    // Set opacity
    shaderMaterial.material.transparent =
      controls.opacity < 1 || needsTransparency;
    shaderMaterial.material.opacity = controls.opacity;

    // MultiplyBlending requires premultipliedAlpha = true in WebGPU
    if (controls.blendMode === "multiply") {
      shaderMaterial.material.premultipliedAlpha = true;
    } else if (controls.blendMode === "subtractive") {
      shaderMaterial.material.premultipliedAlpha = true; // Adjust as needed
    } else {
      shaderMaterial.material.premultipliedAlpha = true;
    }

    shaderMaterial.material.needsUpdate = true;
  }, [object.controls, shaderMaterial]);

  // Update transform
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(
        object.transform.position.x,
        object.transform.position.y,
        object.transform.position.z,
      );
      meshRef.current.rotation.set(
        object.transform.rotation.x,
        object.transform.rotation.y,
        object.transform.rotation.z,
      );
      meshRef.current.scale.set(
        object.transform.scale.x,
        object.transform.scale.y,
        object.transform.scale.z,
      );
    }
  }, [object.transform]);

  // Update shader uniforms based on playback
  useFrame(() => {
    if (!shaderMaterial || (!isPlaying && !isExporting)) return;

    // Update audio-reactive shaders
    if (
      object.shaderType === "rainbow" &&
      "audioLevel" in shaderMaterial.uniforms
    ) {
      const audioLevel = getAudioLevel();
      shaderMaterial.uniforms.audioLevel.value = audioLevel;
    } else if (
      object.shaderType === "galaxyTravel" &&
      "audioLevel" in shaderMaterial.uniforms
    ) {
      const controls = object.controls as GalaxyTravelControls;
      if (controls.audioReactive) {
        const audioLevel =
          getAudioLevel(controls.freqRangeStart, controls.freqRangeEnd) *
          controls.audioGain;
        shaderMaterial.uniforms.audioLevel.value = audioLevel;
      }
    } else if (
      object.shaderType === "supernovaRemnant" &&
      "audioLevel" in shaderMaterial.uniforms
    ) {
      const controls = object.controls as SupernovaRemnantControls;
      if (controls.audioReactive) {
        const audioLevel = getAudioLevel();
        shaderMaterial.uniforms.audioLevel.value = audioLevel;
      }
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      if (shaderMaterial) {
        shaderMaterial.material.dispose();
      }
    };
  }, [shaderMaterial]);

  if (!shaderMaterial) return null;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <primitive attach="material" object={shaderMaterial.material} />
    </mesh>
  );
}
