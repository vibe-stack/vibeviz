import { nanoid } from "nanoid";
import type { GLBObject } from "../types";
import { defaultTransform } from "../defaults";

export function createGLB(name?: string): GLBObject {
  return {
    id: nanoid(),
    name: name || "GLB Model",
    type: "glb",
    transform: defaultTransform(),
    visible: true,
    url: "",
    availableAnimations: [],
    activeAnimation: null,
  };
}
