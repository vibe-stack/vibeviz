"use client";

import { useEffect, useMemo } from "react";
import type { ComponentType } from "react";
import {
  AddEquation,
  AdditiveBlending,
  BoxGeometry,
  CustomBlending,
  MeshPhysicalMaterial,
  NormalBlending,
  OneFactor,
  OneMinusDstColorFactor,
  SphereGeometry,
  type BufferGeometry,
} from "three/webgpu";
import { usePlaybackTimeRef } from "@/context/playback-time-context";
import {
  type ParticleSettings,
  type ParticlePresetSettings,
  type ParticleGlobalSettings,
  type ParticleMode,
} from "@/state/visualizer-store";
import { useAudioAnalysis } from "./hooks/useAudioAnalysis";
import {
  createPaletteColors,
  type PaletteColors,
} from "./utils/colors";
import { VortexParticles } from "./modes/VortexParticles";
import { BurstParticles } from "./modes/BurstParticles";
import { OrbitParticles } from "./modes/OrbitParticles";
import { RibbonParticles } from "./modes/RibbonParticles";
import { NebulaParticles } from "./modes/NebulaParticles";

const MODE_COMPONENTS = {
  vortex: VortexParticles,
  bursts: BurstParticles,
  orbits: OrbitParticles,
  ribbons: RibbonParticles,
  nebula: NebulaParticles,
} as unknown as Record<
  ParticleMode,
  ComponentType<ParticleModeComponentProps<ParticlePresetSettings[ParticleMode]>>
>;

const geometryForShape = (shape: ParticleGlobalSettings["shape"]) => {
  if (shape === "cube") {
    return new BoxGeometry(1, 1, 1, 1, 1, 1);
  }
  return new SphereGeometry(0.75, 24, 24);
};

const createMaterial = () => {
  const material = new MeshPhysicalMaterial();
  material.transparent = true;
  material.depthWrite = false;
  return material;
};

const applyBlendMode = (
  material: MeshPhysicalMaterial,
  mode: ParticleSettings["material"]["blend"],
) => {
  switch (mode) {
    case "additive": {
      material.blending = AdditiveBlending;
      material.depthWrite = false;
      break;
    }
    case "screen": {
      material.blending = CustomBlending;
      material.blendSrc = OneMinusDstColorFactor;
      material.blendDst = OneFactor;
      material.blendEquation = AddEquation;
      material.depthWrite = false;
      break;
    }
    default: {
      material.blending = NormalBlending;
      material.depthWrite = material.opacity >= 1;
    }
  }
};

export interface ParticleModeComponentProps<TParams> {
  getFrequencyData: () => Uint8Array;
  global: ParticleGlobalSettings;
  material: MeshPhysicalMaterial;
  geometry: BufferGeometry;
  palette: PaletteColors;
  params: TParams;
  getAudioAnalysis: ReturnType<typeof useAudioAnalysis>;
  playbackTimeRef: ReturnType<typeof usePlaybackTimeRef>;
  materialConfig: ParticleSettings["material"];
}

interface ParticleSystemProps {
  getFrequencyData: () => Uint8Array;
  settings: ParticleSettings;
}

export const ParticleSystem = ({ getFrequencyData, settings }: ParticleSystemProps) => {
  if (!settings.enabled) {
    return null;
  }

  const playbackTimeRef = usePlaybackTimeRef();

  const geometry = useMemo(
    () => geometryForShape(settings.global.shape),
    [settings.global.shape],
  );

  const material = useMemo(() => createMaterial(), []);

  const palette = useMemo(
    () => createPaletteColors(settings.palette),
    [settings.palette.base, settings.palette.mid, settings.palette.highlight],
  );

  const getAudioAnalysis = useAudioAnalysis(getFrequencyData);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    material.color.set(settings.material.color);
    material.metalness = settings.material.metalness;
    material.roughness = settings.material.roughness;
    material.opacity = settings.material.opacity;
    material.sheen = Math.min(1, settings.material.fresnel);
    material.sheenColor.set(settings.material.color);
    material.emissive.set(settings.material.color);
    material.emissiveIntensity = settings.material.emissiveIntensity;
    material.needsUpdate = true;
    applyBlendMode(material, settings.material.blend);
  }, [
    material,
    settings.material.color,
    settings.material.metalness,
    settings.material.roughness,
    settings.material.opacity,
    settings.material.fresnel,
    settings.material.emissiveIntensity,
    settings.material.blend,
  ]);

  const ModeComponent = MODE_COMPONENTS[settings.mode];
  const params = settings.presets[settings.mode];

  return (
    <ModeComponent
      key={settings.mode}
      geometry={geometry}
      material={material}
      global={settings.global}
      palette={palette}
      params={params}
      getAudioAnalysis={getAudioAnalysis}
      getFrequencyData={getFrequencyData}
      playbackTimeRef={playbackTimeRef}
      materialConfig={settings.material}
    />
  );
};
