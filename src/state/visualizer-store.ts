import { proxy } from "valtio";

export type ShaderPreset = "none" | "aurora" | "pulseGrid" | "fragments";
export type BarScaleMode = "vertical" | "radial";

export interface MaterialSettings {
  color: string;
  metalness: number;
  roughness: number;
}

export interface BarsSettings {
  enabled: boolean;
  radius: number;
  maxBarHeight: number;
  barCount: number;
  scaleMode: BarScaleMode;
  material: MaterialSettings;
}

export interface ParticleSettings {
  enabled: boolean;
  count: number;
  size: number;
  spread: number;
  velocity: number;
  trail: number;
  shape: "sphere" | "cube";
  material: MaterialSettings;
}

interface ShaderSettings {
  intensity: number;
  speed: number;
  contrast: number;
}

interface ShaderPresetSettings {
  aurora: ShaderSettings;
  pulseGrid: ShaderSettings & { warp: number };
  fragments: ShaderSettings & { fragmentation: number };
}

type ShaderSettingsUpdate = ShaderSettings & {
  warp?: number;
  fragmentation?: number;
};

export interface FogSettings {
  enabled: boolean;
  color: string;
  near: number;
  far: number;
}

export interface WorldSettings {
  background: string;
  ambientIntensity: number;
  keyLightIntensity: number;
  fillLightIntensity: number;
  fog: FogSettings;
}

export interface VisualizerStore {
  shader: ShaderPreset;
  bars: BarsSettings;
  particles: ParticleSettings;
  shaderSettings: ShaderPresetSettings;
  world: WorldSettings;
}

const defaultMaterial = (color: string): MaterialSettings => ({
  color,
  metalness: 0.35,
  roughness: 0.4,
});

export const visualizerStore = proxy<VisualizerStore>({
  shader: "none",
  bars: {
    enabled: true,
    radius: 5,
    maxBarHeight: 3,
    barCount: 64,
    scaleMode: "vertical",
    material: defaultMaterial("#3b82f6"),
  },
  particles: {
    enabled: true,
    count: 600,
    size: 0.04,
    spread: 4.5,
    velocity: 1.2,
    trail: 0.6,
    shape: "sphere",
    material: defaultMaterial("#fbbf24"),
  },
  shaderSettings: {
    aurora: {
      intensity: 0.6,
      speed: 0.35,
      contrast: 0.7,
    },
    pulseGrid: {
      intensity: 0.5,
      speed: 0.5,
      contrast: 0.9,
      warp: 1.6,
    },
    fragments: {
      intensity: 0.6,
      speed: 0.65,
      contrast: 1.1,
      fragmentation: 1.4,
    },
  },
  world: {
    background: "#09090b",
    ambientIntensity: 0.35,
    keyLightIntensity: 0.85,
    fillLightIntensity: 0.45,
    fog: {
      enabled: true,
      color: "#0f172a",
      near: 12,
      far: 42,
    },
  },
});

export const visualizerActions = {
  setShader(shader: ShaderPreset) {
    visualizerStore.shader = shader;
  },
  toggleBars(enabled?: boolean) {
    visualizerStore.bars.enabled = enabled ?? !visualizerStore.bars.enabled;
  },
  updateBars(partial: Partial<BarsSettings>) {
    Object.assign(visualizerStore.bars, partial);
  },
  updateBarMaterial(partial: Partial<MaterialSettings>) {
    Object.assign(visualizerStore.bars.material, partial);
  },
  toggleParticles(enabled?: boolean) {
    visualizerStore.particles.enabled =
      enabled ?? !visualizerStore.particles.enabled;
  },
  updateParticles(partial: Partial<ParticleSettings>) {
    Object.assign(visualizerStore.particles, partial);
  },
  updateParticleMaterial(partial: Partial<MaterialSettings>) {
    Object.assign(visualizerStore.particles.material, partial);
  },
  updateShader(preset: keyof ShaderPresetSettings, partial: Partial<ShaderSettingsUpdate>) {
    Object.assign(visualizerStore.shaderSettings[preset], partial);
  },
  updateWorld(partial: Partial<WorldSettings>) {
    Object.assign(visualizerStore.world, partial);
  },
  updateFog(partial: Partial<FogSettings>) {
    Object.assign(visualizerStore.world.fog, partial);
  },
};
