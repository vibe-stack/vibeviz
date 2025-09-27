import { proxy } from "valtio";

export type VisualizationMode = "circular" | "particles";
export type ShaderPreset = "none" | "aurora" | "pulseGrid";

interface CircularSettings {
  radius: number;
  maxBarHeight: number;
  barCount: number;
}

interface ParticleSettings {
  count: number;
  size: number;
  spread: number;
  velocity: number;
  trail: number;
  shape: "sphere" | "cube";
}

interface ShaderSettings {
  intensity: number;
  speed: number;
  contrast: number;
}

interface ShaderPresetSettings {
  aurora: ShaderSettings;
  pulseGrid: ShaderSettings & { warp: number };
}

export interface VisualizerStore {
  mode: VisualizationMode;
  shader: ShaderPreset;
  circular: CircularSettings;
  particles: ParticleSettings;
  shaderSettings: ShaderPresetSettings;
}

export const visualizerStore = proxy<VisualizerStore>({
  mode: "circular",
  shader: "none",
  circular: {
    radius: 5,
    maxBarHeight: 3,
    barCount: 64,
  },
  particles: {
    count: 600,
    size: 0.04,
    spread: 4.5,
    velocity: 1.2,
    trail: 0.6,
    shape: "sphere",
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
  },
});

export const visualizerActions = {
  setMode(mode: VisualizationMode) {
    visualizerStore.mode = mode;
  },
  setShader(shader: ShaderPreset) {
    visualizerStore.shader = shader;
  },
  updateCircular(partial: Partial<CircularSettings>) {
    Object.assign(visualizerStore.circular, partial);
  },
  updateParticles(partial: Partial<ParticleSettings>) {
    Object.assign(visualizerStore.particles, partial);
  },
  updateShader(preset: keyof ShaderPresetSettings, partial: Partial<ShaderSettings & { warp?: number }>) {
    Object.assign(visualizerStore.shaderSettings[preset], partial);
  },
};
