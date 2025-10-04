import { atom } from "jotai";
import type { Particle } from "./types";

// Active particles for dynamic particle systems (keyed by particle system ID)
export const activeParticlesAtom = atom<Record<string, Particle[]>>({});

// Particle pools for efficient reuse (keyed by particle system ID)
export const particlePoolsAtom = atom<Record<string, Particle[]>>({});

// Last emission time for each system (keyed by particle system ID)
export const lastEmissionTimeAtom = atom<Record<string, number>>({});
