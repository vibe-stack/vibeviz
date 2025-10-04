import { nanoid } from "nanoid";
import type { PostprocessorObject } from "../types";

export const createBloom = (name?: string): PostprocessorObject => ({
  id: nanoid(),
  name: name || "Bloom",
  type: "postprocessor",
  effectType: "bloom",
  enabled: true,
  controls: {
    threshold: 0.85,
    strength: 0.5,
    radius: 0.5,
  },
});

export const createDotScreen = (name?: string): PostprocessorObject => ({
  id: nanoid(),
  name: name || "Dot Screen",
  type: "postprocessor",
  effectType: "dotScreen",
  enabled: true,
  controls: {
    scale: 0.3,
    angle: 1.57,
    dotColor: "#000000",
    backgroundColor: "#ffffff",
  },
});

export const createChromaticAberration = (
  name?: string,
): PostprocessorObject => ({
  id: nanoid(),
  name: name || "Chromatic Aberration",
  type: "postprocessor",
  effectType: "chromaticAberration",
  enabled: true,
  controls: {
    strength: 1.5,
    centerX: 0.5,
    centerY: 0.5,
    scale: 1.2,
  },
});

export const createAfterImage = (name?: string): PostprocessorObject => ({
  id: nanoid(),
  name: name || "After Image",
  type: "postprocessor",
  effectType: "afterImage",
  enabled: true,
  controls: {
    damp: 0.8,
  },
});

export const createPostprocessorByType = (
  effectType: string,
  name?: string,
): PostprocessorObject => {
  switch (effectType) {
    case "bloom":
      return createBloom(name);
    case "dotScreen":
      return createDotScreen(name);
    case "chromaticAberration":
      return createChromaticAberration(name);
    case "afterImage":
      return createAfterImage(name);
    default:
      return {
        id: nanoid(),
        name: name || "Postprocessor",
        type: "postprocessor",
        effectType,
        enabled: true,
        controls: {},
      };
  }
};
