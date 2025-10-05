import { nanoid } from "nanoid";
import type {
  CameraObject,
  Material,
  PostprocessorObject,
  PrimitiveObject,
  PrimitiveType,
  ShaderObject,
  Transform,
  WaveformInstancerObject,
  WaveformLinesObject,
} from "./types";

export const defaultTransform = (): Transform => ({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
});

/**
 * Default material properties
 * 
 * Common material presets:
 * - Glass: transmission=1, roughness=0, thickness=0.5, ior=1.5, metalness=0
 * - Frosted Glass: transmission=1, roughness=0.1-0.3, thickness=0.5, ior=1.5
 * - Diamond: transmission=1, roughness=0, ior=2.4, clearcoat=1
 * - Plastic: roughness=0.5, metalness=0, clearcoat=0.5
 * - Metal: metalness=1, roughness=0.2-0.4
 * - Transparent: opacity=0.5, transparent=true
 */
export const defaultMaterial = (): Material => ({
  color: "#a855f7",
  roughness: 0.5,
  metalness: 0.5,
  emissiveColor: "#000000",
  emissiveIntensity: 0,
  opacity: 1,
  transparent: false,
  transmission: 0,
  thickness: 0.5,
  ior: 1.5,
  clearcoat: 0,
  clearcoatRoughness: 0,
  flatShading: false,
});

export const createPrimitive = (
  primitiveType: PrimitiveType,
  name?: string,
): PrimitiveObject => ({
  id: nanoid(),
  name:
    name || `${primitiveType.charAt(0).toUpperCase()}${primitiveType.slice(1)}`,
  type: "primitive",
  primitiveType,
  transform: defaultTransform(),
  material: defaultMaterial(),
  visible: true,
  // Cylinder defaults
  ...(primitiveType === "cylinder" && {
    cylinderTopRadius: 0.5,
    cylinderBottomRadius: 0.5,
  }),
});

export const createShader = (
  shaderType: string,
  name?: string,
): ShaderObject => ({
  id: nanoid(),
  name: name || "Shader",
  type: "shader",
  shaderType,
  transform: defaultTransform(),
  controls: {},
  visible: true,
});

export const createCamera = (name?: string): CameraObject => ({
  id: nanoid(),
  name: name || "Camera",
  type: "camera",
  transform: {
    position: { x: 4, y: 3, z: 5 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  },
  isActive: false,
  fov: 50,
  target: { x: 0, y: 0, z: 0 },
  visible: true,
});

export const createWaveformInstancer = (
  name?: string,
): WaveformInstancerObject => ({
  id: nanoid(),
  name: name || "Waveform Instancer",
  type: "waveformInstancer",
  transform: defaultTransform(),
  targetPrimitiveId: null,
  instanceCount: 48,
  arrangement: "linear",
  spacing: 0.12,
  arcStartDegrees: 0,
  arcEndDegrees: 360,
  baseHeight: 0.2,
  dynamicLength: 5,
  smoothing: 3,
  audioThreshold: 0.0,
  audioGain: 1.0,
  freqRangeStart: 0.0,
  freqRangeEnd: 1.0,
  emissiveBoost: 0.0,
  pivotPoint: "bottom",
  visible: true,
});

export const createWaveformLines = (name?: string): WaveformLinesObject => ({
  id: nanoid(),
  name: name || "Waveform Lines",
  type: "waveformLines",
  transform: defaultTransform(),
  lineAmount: 5,
  lineSegments: 128,
  lineGaps: 0.05,
  lineStartGap: 0.0,
  lineCenterGap: 1.0,
  lineEndGap: 1.0,
  lineStartConvergence: 0.0,
  lineCenterConvergence: 0.0,
  lineEndConvergence: 0.0,
  smoothing: 0.5,
  thickness: 0.01,
  color: "#a855f7",
  emissiveColor: "#a855f7",
  emissiveIntensity: 0.5,
  layout: "linear",
  dynamicHeight: 3.0,
  audioThreshold: 0.0,
  audioGain: 1.0,
  freqRangeStart: 0.0,
  freqRangeEnd: 1.0,
  emissiveBoost: 1.0,
  pivotPoint: "bottom",
  offset: 0.0,
  direction: { x: 0, y: 1, z: 0 }, // Default to Y-up
  visible: true,
});

export const createPostprocessor = (
  effectType: string,
  name?: string,
): PostprocessorObject => ({
  id: nanoid(),
  name: name || "Postprocessor",
  type: "postprocessor",
  effectType,
  enabled: true,
  controls: {},
});
