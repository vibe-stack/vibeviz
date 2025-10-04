import type {
  AudioParticleObject,
  DynamicParticleObject,
  ForceFieldObject,
} from "../particles/types";

export type Vector3 = { x: number; y: number; z: number };
export type Color = string;

export type Transform = {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
};

export type Material = {
  color: Color;
  roughness: number;
  metalness: number;
  emissiveColor: Color;
  emissiveIntensity: number;
};

export type PrimitiveType = "cube" | "pyramid" | "torus" | "cylinder";

export type BaseObject = {
  id: string;
  name: string;
  transform: Transform;
  visible: boolean;
};

export type PrimitiveObject = BaseObject & {
  type: "primitive";
  primitiveType: PrimitiveType;
  material: Material;
  // Cylinder-specific properties
  cylinderTopRadius?: number;
  cylinderBottomRadius?: number;
};

export type ShaderObject = BaseObject & {
  type: "shader";
  shaderType: string;
  controls: Record<string, number | string | boolean>;
};

export type WaveformInstancerObject = BaseObject & {
  type: "waveformInstancer";
  targetPrimitiveId: string | null;
  instanceCount: number;
  arrangement: "linear" | "radial" | "radial-outwards";
  spacing: number;
  // Radial arc settings
  arcStartDegrees?: number;
  arcEndDegrees?: number;
  // Visual customization
  baseHeight: number;
  dynamicLength: number;
  smoothing: number;
  audioThreshold: number;
  audioGain: number;
  freqRangeStart: number;
  freqRangeEnd: number;
  emissiveBoost: number;
  pivotPoint: "bottom" | "center" | "top";
};

export type WaveformLinesObject = BaseObject & {
  type: "waveformLines";
  // Line configuration
  lineAmount: number;
  lineSegments: number;
  lineGaps: number;
  lineStartGap: number;
  lineCenterGap: number;
  lineEndGap: number;
  lineStartConvergence: number;
  lineCenterConvergence: number;
  lineEndConvergence: number;
  smoothing: number;
  thickness: number;
  // Material properties
  color: Color;
  emissiveColor: Color;
  emissiveIntensity: number;
  // Layout
  layout: "linear" | "radial";
  // Audio reactive properties
  dynamicHeight: number;
  audioThreshold: number;
  audioGain: number;
  freqRangeStart: number;
  freqRangeEnd: number;
  emissiveBoost: number;
  pivotPoint: "bottom" | "center" | "top";
  offset: number;
  // Direction vector (normalized 0-1 for each axis)
  direction: Vector3;
};

export type CameraObject = BaseObject & {
  type: "camera";
  isActive: boolean;
  fov: number;
  target: Vector3;
};

export type PostprocessorObject = {
  id: string;
  name: string;
  type: "postprocessor";
  effectType: string;
  enabled: boolean;
  controls: Record<string, number | string | boolean>;
};

export type LightType = "ambient" | "directional" | "point" | "spot" | "env";

export type LightObject = BaseObject & {
  type: "light";
  lightType: LightType;
  color: Color;
  intensity: number;
  // Directional, Point, Spot
  castShadow?: boolean;
  // Point, Spot
  distance?: number;
  decay?: number;
  // Spot
  angle?: number;
  penumbra?: number;
  target?: Vector3;
};

export type GLBObject = BaseObject & {
  type: "glb";
  url: string; // File URL or data URL
  availableAnimations: string[]; // List of animation names in the GLB
  activeAnimation: string | null; // Currently selected animation
};

export type SceneObject =
  | PrimitiveObject
  | ShaderObject
  | WaveformInstancerObject
  | WaveformLinesObject
  | CameraObject
  | PostprocessorObject
  | LightObject
  | AudioParticleObject
  | DynamicParticleObject
  | ForceFieldObject
  | GLBObject;

export type KeyframeValue = number | boolean | string | Vector3 | Color | null;

export type Keyframe = {
  id: string;
  objectId: string;
  property: string;
  time: number;
  value: KeyframeValue;
  ease?: string;
};
