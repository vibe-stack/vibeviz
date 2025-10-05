import { nanoid } from "nanoid";
import { defaultTransform } from "@/features/scene/defaults";
import type { ShaderObject } from "@/features/scene/types";
import type {
  GalaxyTravelControls,
  RainbowControls,
  ShaderType,
  StarryNightControls,
  SupernovaRemnantControls,
} from "../types";

const defaultStarryNightControls = (): StarryNightControls => ({
  topColor: "#000033",
  bottomColor: "#000000",
  starCount: 200,
  starColor: "#ffffff",
  starSize: 2.0,
  starBrightness: 0.8,
  shootingStarFrequency: 0.5,
  shootingStarSpeed: 2.0, // Much slower default
  blendMode: "normal",
  opacity: 1.0,
});

const defaultGalaxyTravelControls = (): GalaxyTravelControls => ({
  backgroundColor: "#000000",
  starColor: "#ffffff",
  baseSpeed: 2.0, // Slower default speed
  starCount: 300,
  starSize: 1.5,
  audioReactive: true,
  audioInfluence: 3.0, // Higher influence for more dramatic effect
  audioGain: 1.0,
  freqRangeStart: 0.0,
  freqRangeEnd: 1.0,
  blendMode: "normal",
  opacity: 1.0,
});

const defaultRainbowControls = (): RainbowControls => ({
  speed: 2.0,
  scale: 2.0,
  patternType: "classic",
  saturation: 0.9,
  brightness: 0.6,
  contrast: 1.2,
  waveAmplitude: 0.5,
  waveFrequency: 3.0,
  turbulence: 0.0,
  cells: 0.0,
  audioReactive: true,
  audioInfluence: 1.0,
  audioAffectsSpeed: true,
  audioAffectsAmplitude: false,
  audioAffectsScale: false,
  audioAffectsHue: false,
  audioAffectsBrightness: false,
  audioAffectsTurbulence: false,
  audioAffectsCells: false,
  useCustomPalette: false,
  colorPalette: {
    colors: [
      "#ff0000",
      "#ff7f00",
      "#ffff00",
      "#00ff00",
      "#0000ff",
      "#4b0082",
      "#9400d3",
    ],
    mode: "gradient",
  },
  blendMode: "normal",
  opacity: 1.0,
});

const defaultSupernovaRemnantControls = (): SupernovaRemnantControls => ({
  speed: 1.0,
  filament1Color: "#1a33cc",
  filament1GlowColor: "#ccccff",
  filament1Speed: 0.5,
  filament1Intensity: 1.0,
  filament2Color: "#e68a1a",
  filament2GlowColor: "#ffffcc",
  filament2Speed: 0.8,
  filament2Intensity: 1.0,
  coreColor: "#fff0b3",
  coreIntensity: 1.0,
  starsColor: "#ffffcc",
  starsIntensity: 1.0,
  starsDensity: 50.0,
  exposure: 1.0,
  gamma: 0.8,
  audioReactive: true,
  audioInfluence: 1.0,
  audioAffectsExpansion: true,
  audioAffectsIntensity: false,
  audioAffectsCore: false,
  blendMode: "normal",
  opacity: 1.0,
});

export const createShaderObject = (
  shaderType: ShaderType,
  name?: string,
): ShaderObject => {
  let controls = {};
  let displayName = name || "Shader";

  switch (shaderType) {
    case "starryNight":
      controls = defaultStarryNightControls();
      displayName = name || "Starry Night";
      break;
    case "galaxyTravel":
      controls = defaultGalaxyTravelControls();
      displayName = name || "Galaxy Travel";
      break;
    case "rainbow":
      controls = defaultRainbowControls();
      displayName = name || "Rainbow Shader";
      break;
    case "supernovaRemnant":
      controls = defaultSupernovaRemnantControls();
      displayName = name || "Supernova Remnant";
      break;
  }

  return {
    id: nanoid(),
    name: displayName,
    type: "shader",
    shaderType,
    transform: defaultTransform(),
    controls,
    visible: true,
  };
};
