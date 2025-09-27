import { proxy } from "valtio";

export type ShaderPreset =
  | "none"
  | "aurora"
  | "pulseGrid"
  | "fragments"
  | "smoke";
export type BarScaleMode = "vertical" | "radial";
export type ParticleMode =
  | "vortex"
  | "bursts"
  | "orbits"
  | "ribbons"
  | "nebula";
export type ParticleBlendMode = "normal" | "additive" | "screen";
export type ShapeType =
  | "cube"
  | "sphere"
  | "heart"
  | "star"
  | "torus"
  | "arrow"
  | "pyramid"
  | "tetrahedron";

export type ShapeRotationMode =
  | "slowDownOnBeat"
  | "speedUpOnBeat"
  | "reverseOnBeat"
  | "temporaryReverseOnBeat";

export type ShapeScaleMode =
  | "slowDownOnBeat"
  | "speedUpOnBeat"
  | "reverseOnBeat"
  | "temporaryReverseOnBeat"
  | "heartbeat";

export interface MaterialSettings {
  color: string;
  metalness: number;
  roughness: number;
}

export interface Vector3Config {
  x: number;
  y: number;
  z: number;
}

export interface ShapeMaterialSettings extends MaterialSettings {
  emissive: string;
  emissiveIntensity: number;
}

export interface ShapeRotationSettings {
  enabled: boolean;
  speed: number;
  axis: Vector3Config;
  mode: ShapeRotationMode;
}

export interface ShapeScaleSettings {
  enabled: boolean;
  speed: number;
  min: number;
  max: number;
  mode: ShapeScaleMode;
}

export interface ShapesSettings {
  enabled: boolean;
  type: ShapeType;
  baseScale: number;
  baseRotation: Vector3Config;
  material: ShapeMaterialSettings;
  animation: {
    rotate: ShapeRotationSettings;
    scale: ShapeScaleSettings;
  };
}

export interface BarsSettings {
  enabled: boolean;
  radius: number;
  maxBarHeight: number;
  barCount: number;
  scaleMode: BarScaleMode;
  material: MaterialSettings;
}

export interface ParticlePalette {
  base: string;
  mid: string;
  highlight: string;
}

export interface ParticleGlobalSettings {
  count: number;
  size: number;
  spawnRadius: number;
  spawnJitter: number;
  speed: number;
  drag: number;
  trail: number;
  depthFade: number;
  shape: "sphere" | "cube";
}

export interface ParticleMaterialSettings extends MaterialSettings {
  blend: ParticleBlendMode;
  opacity: number;
  emissiveIntensity: number;
  fresnel: number;
}

export interface VortexSettings {
  swirlStrength: number;
  axialPull: number;
  beatPulse: number;
  noiseStrength: number;
  verticalDrift: number;
}

export interface BurstSettings {
  emissionRate: number;
  burstStrength: number;
  burstSpread: number;
  gravity: number;
  decay: number;
}

export interface OrbitSettings {
  ringCount: number;
  radius: number;
  twist: number;
  wobble: number;
  tempoFollow: number;
}

export interface RibbonSettings {
  bandCount: number;
  trailLength: number;
  waveAmplitude: number;
  waveFrequency: number;
  noiseStrength: number;
}

export interface NebulaSettings {
  noiseScale: number;
  driftSpeed: number;
  curlStrength: number;
  shimmer: number;
  fade: number;
}

export interface ParticlePresetSettings {
  vortex: VortexSettings;
  bursts: BurstSettings;
  orbits: OrbitSettings;
  ribbons: RibbonSettings;
  nebula: NebulaSettings;
}

export interface ParticleSettings {
  enabled: boolean;
  mode: ParticleMode;
  global: ParticleGlobalSettings;
  material: ParticleMaterialSettings;
  palette: ParticlePalette;
  presets: ParticlePresetSettings;
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
  smoke: ShaderSettings & { color: string; scale: number };
}

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
  shapes: ShapesSettings;
  shaderSettings: ShaderPresetSettings;
  world: WorldSettings;
}

const defaultMaterial = (color: string): MaterialSettings => ({
  color,
  metalness: 0.35,
  roughness: 0.4,
});

const defaultParticleMaterial = (color: string): ParticleMaterialSettings => ({
  color,
  metalness: 0.25,
  roughness: 0.4,
  blend: "additive",
  opacity: 0.85,
  emissiveIntensity: 1.45,
  fresnel: 1.2,
});

const defaultShapeMaterial = (color: string): ShapeMaterialSettings => ({
  color,
  metalness: 0.55,
  roughness: 0.35,
  emissive: color,
  emissiveIntensity: 0.8,
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
    mode: "vortex",
    global: {
      count: 900,
      size: 0.035,
      spawnRadius: 4.6,
      spawnJitter: 0.65,
      speed: 1.1,
      drag: 0.18,
      trail: 0.62,
      depthFade: 0.42,
      shape: "sphere",
    },
    material: defaultParticleMaterial("#fbbf24"),
    palette: {
      base: "#fbbf24",
      mid: "#22d3ee",
      highlight: "#f4f4f5",
    },
    presets: {
      vortex: {
        swirlStrength: 0.78,
        axialPull: 0.32,
        beatPulse: 0.7,
        noiseStrength: 0.28,
        verticalDrift: 0.18,
      },
      bursts: {
        emissionRate: 120,
        burstStrength: 1.6,
        burstSpread: 0.55,
        gravity: 0.45,
        decay: 0.64,
      },
      orbits: {
        ringCount: 6,
        radius: 5.2,
        twist: 0.45,
        wobble: 0.35,
        tempoFollow: 0.6,
      },
      ribbons: {
        bandCount: 4,
        trailLength: 18,
        waveAmplitude: 0.8,
        waveFrequency: 0.85,
        noiseStrength: 0.35,
      },
      nebula: {
        noiseScale: 0.78,
        driftSpeed: 0.32,
        curlStrength: 0.65,
        shimmer: 0.6,
        fade: 0.52,
      },
    },
  },
  shapes: {
    enabled: true,
    type: "sphere",
    baseScale: 1.4,
    baseRotation: { x: 0, y: 0, z: 0 },
    material: defaultShapeMaterial("#22d3ee"),
    animation: {
      rotate: {
        enabled: true,
        speed: 0.8,
        axis: { x: 0, y: 1, z: 0 },
        mode: "speedUpOnBeat",
      },
      scale: {
        enabled: true,
        speed: 1.1,
        min: 0.8,
        max: 1.25,
        mode: "heartbeat",
      },
    },
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
    smoke: {
      intensity: 0.55,
      speed: 0.45,
      contrast: 1.1,
      color: "#38bdf8",
      scale: 1,
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
  setParticleMode(mode: ParticleMode) {
    visualizerStore.particles.mode = mode;
  },
  updateParticleGlobal(partial: Partial<ParticleGlobalSettings>) {
    Object.assign(visualizerStore.particles.global, partial);
  },
  updateParticleMaterial(partial: Partial<ParticleMaterialSettings>) {
    Object.assign(visualizerStore.particles.material, partial);
  },
  updateParticlePalette(partial: Partial<ParticlePalette>) {
    Object.assign(visualizerStore.particles.palette, partial);
  },
  updateParticlePreset<K extends ParticleMode>(
    preset: K,
    partial: Partial<ParticlePresetSettings[K]>,
  ) {
    Object.assign(visualizerStore.particles.presets[preset], partial);
  },
  toggleShapes(enabled?: boolean) {
    visualizerStore.shapes.enabled = enabled ?? !visualizerStore.shapes.enabled;
  },
  updateShapes(partial: Partial<ShapesSettings>) {
    Object.assign(visualizerStore.shapes, partial);
  },
  updateShapeMaterial(partial: Partial<ShapeMaterialSettings>) {
    Object.assign(visualizerStore.shapes.material, partial);
  },
  updateShapeBaseRotation(partial: Partial<Vector3Config>) {
    Object.assign(visualizerStore.shapes.baseRotation, partial);
  },
  updateShapeRotation(partial: Partial<ShapeRotationSettings>) {
    Object.assign(visualizerStore.shapes.animation.rotate, partial);
  },
  updateShapeRotationAxis(partial: Partial<Vector3Config>) {
    Object.assign(visualizerStore.shapes.animation.rotate.axis, partial);
  },
  updateShapeScale(partial: Partial<ShapeScaleSettings>) {
    Object.assign(visualizerStore.shapes.animation.scale, partial);
  },
  updateShader<K extends keyof ShaderPresetSettings>(
    preset: K,
    partial: Partial<ShaderPresetSettings[K]>,
  ) {
    Object.assign(visualizerStore.shaderSettings[preset], partial);
  },
  updateWorld(partial: Partial<WorldSettings>) {
    Object.assign(visualizerStore.world, partial);
  },
  updateFog(partial: Partial<FogSettings>) {
    Object.assign(visualizerStore.world.fog, partial);
  },
};
