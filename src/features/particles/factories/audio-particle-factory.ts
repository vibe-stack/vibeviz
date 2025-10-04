import { nanoid } from "nanoid";
import type { AudioParticleObject } from "../types";

export function createAudioParticle(): AudioParticleObject {
  return {
    id: nanoid(),
    name: "Audio Particles",
    type: "audioParticle",
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    visible: true,
    targetPrimitiveId: null,
    particleCount: 100,
    pathType: "orbit",
    pathScale: 5,
    pathSpeed: 1,
    audioReactivity: 1,
    audioGain: 1,
    audioThreshold: 0,
    freqRangeStart: 0,
    freqRangeEnd: 1,
    smoothing: 0.8,
    baseSize: 0.1,
    dynamicSize: 0.5,
    emissiveBoost: 2,
    colorVariation: 0.2,
  };
}
