export type BlendMode =
  | "none"
  | "normal"
  | "additive"
  | "subtractive"
  | "multiply"
  | "custom";

export type StarryNightControls = {
  // Background gradient
  topColor: string;
  bottomColor: string;
  // Star settings
  starCount: number;
  starColor: string;
  starSize: number;
  starBrightness: number;
  // Shooting star settings
  shootingStarFrequency: number; // 0-1, how often they appear
  shootingStarSpeed: number;
  // Blending
  blendMode: BlendMode;
  opacity: number; // 0-1
};

export type GalaxyTravelControls = {
  // Background
  backgroundColor: string;
  starColor: string;
  // Travel settings
  baseSpeed: number;
  starCount: number;
  starSize: number;
  // Audio reactive
  audioReactive: boolean;
  audioInfluence: number; // How much audio affects speed
  // Audio source
  audioGain: number;
  freqRangeStart: number;
  freqRangeEnd: number;
  // Blending
  blendMode: BlendMode;
  opacity: number; // 0-1
};

export type ColorPalette = {
  colors: string[]; // Array of hex colors
  mode: "gradient" | "steps"; // How to interpolate between colors
};

export type RainbowControls = {
  // Pattern settings
  speed: number; // Animation speed
  scale: number; // Pattern scale/frequency
  patternType: "waves" | "spiral" | "radial" | "classic";
  // Color settings
  saturation: number; // 0-1
  brightness: number; // 0-1
  contrast: number; // 0-2
  // Color palette
  useCustomPalette: boolean;
  colorPalette: ColorPalette;
  // Wave settings (for wave patterns)
  waveAmplitude: number;
  waveFrequency: number;
  // Effect settings
  turbulence: number; // 0-10, adds organic noise/turbulence
  cells: number; // 0-10, adds grid/cellular pattern
  // Audio reactive - individual toggles
  audioReactive: boolean;
  audioInfluence: number;
  audioAffectsSpeed: boolean;
  audioAffectsAmplitude: boolean;
  audioAffectsScale: boolean;
  audioAffectsHue: boolean;
  audioAffectsBrightness: boolean;
  audioAffectsTurbulence: boolean;
  audioAffectsCells: boolean;
  // Blending
  blendMode: BlendMode;
  opacity: number; // 0-1
};

export type SupernovaRemnantControls = {
  // Animation
  speed: number;
  // Filament 1 (blue/purple layer)
  filament1Color: string;
  filament1GlowColor: string;
  filament1Speed: number;
  filament1Intensity: number;
  // Filament 2 (orange/yellow layer)
  filament2Color: string;
  filament2GlowColor: string;
  filament2Speed: number;
  filament2Intensity: number;
  // Core
  coreColor: string;
  coreIntensity: number;
  // Stars
  starsColor: string;
  starsIntensity: number;
  starsDensity: number;
  // Post-processing
  exposure: number;
  gamma: number;
  // Audio reactive
  audioReactive: boolean;
  audioInfluence: number;
  audioAffectsExpansion: boolean;
  audioAffectsIntensity: boolean;
  audioAffectsCore: boolean;
  // Blending
  blendMode: BlendMode;
  opacity: number; // 0-1
};

export type ShaderControls =
  | StarryNightControls
  | GalaxyTravelControls
  | RainbowControls
  | SupernovaRemnantControls;

export type ShaderType =
  | "starryNight"
  | "galaxyTravel"
  | "rainbow"
  | "supernovaRemnant";
