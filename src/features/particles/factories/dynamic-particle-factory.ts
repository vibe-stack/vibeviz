import { nanoid } from "nanoid";
import type { DynamicParticleObject } from "../types";

export function createDynamicParticle(): DynamicParticleObject {
  return {
    id: nanoid(),
    name: "Dynamic Particles",
    type: "dynamicParticle",
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    visible: true,
    emitterObjectId: null,
    particleObjectId: null,
    emissionRate: 10,
    capacity: 1000,
    spawnMode: "point",
    spawnPositionJitter: { x: 0.1, y: 0.1, z: 0.1 },
    velocity: { x: 0, y: 2, z: 0 },
    velocityJitter: { x: 1, y: 0.5, z: 1 },
    lifetime: 5,
    minScale: 0.5,
    maxScale: 1.5,
    angularVelocity: { x: 0, y: 1, z: 0 },
    gravity: -0.5,
    wind: { x: 0, y: 0, z: 0 },
    seed: Math.floor(Math.random() * 10000),
  };
}
