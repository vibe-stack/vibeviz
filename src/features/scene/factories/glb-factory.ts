import { nanoid } from "nanoid";
import { defaultTransform } from "../defaults";
import type { GLBObject } from "../types";

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
