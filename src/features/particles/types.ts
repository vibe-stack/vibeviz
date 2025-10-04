import type { BaseObject, Vector3 } from "../scene/types";

// Audio Particles - predetermined paths that react to audio
export type AudioParticleObject = BaseObject & {
  type: "audioParticle";
  targetPrimitiveId: string | null;
  particleCount: number;
  // Path configuration
  pathType: "orbit" | "wave" | "spiral" | "linear";
  pathScale: number;
  pathSpeed: number;
  // Audio reactive properties
  audioReactivity: number;
  audioGain: number;
  audioThreshold: number;
  freqRangeStart: number;
  freqRangeEnd: number;
  smoothing: number;
  // Visual properties
  baseSize: number;
  dynamicSize: number; // Additional size from audio
  emissiveBoost: number;
  colorVariation: number;
};

// Dynamic Particle System
export type DynamicParticleObject = BaseObject & {
  type: "dynamicParticle";
  emitterObjectId: string | null; // Reference to another scene object
  particleObjectId: string | null; // Primitive to use as particle
  emissionRate: number; // Particles per second
  capacity: number; // Max active particles
  spawnMode: "point" | "volume";
  spawnPositionJitter: Vector3;
  velocity: Vector3;
  velocityJitter: Vector3;
  lifetime: number; // Seconds
  minScale: number;
  maxScale: number;
  angularVelocity: Vector3;
  gravity: number;
  wind: Vector3;
  seed: number;
};

// Force Field types
export type ForceFieldType = "attractor" | "repulsor";

export type ForceFieldObject = BaseObject & {
  type: "forceField";
  forceFieldType: ForceFieldType;
  strength: number;
  radius: number;
  falloff: number; // How quickly force decreases with distance (0-1)
};

export type ParticleObject =
  | AudioParticleObject
  | DynamicParticleObject
  | ForceFieldObject;

// Internal particle state for dynamic particles
export type Particle = {
  id: string;
  position: Vector3;
  velocity: Vector3;
  rotation: Vector3;
  angularVelocity: Vector3;
  scale: number;
  lifetime: number;
  age: number;
  active: boolean;
};
