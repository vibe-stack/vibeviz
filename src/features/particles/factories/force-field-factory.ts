import { nanoid } from "nanoid";
import type { ForceFieldObject, ForceFieldType } from "../types";

export function createForceField(
  forceFieldType: ForceFieldType,
): ForceFieldObject {
  return {
    id: nanoid(),
    name: `${forceFieldType.charAt(0).toUpperCase() + forceFieldType.slice(1)}`,
    type: "forceField",
    forceFieldType,
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    visible: true,
    strength: 5,
    radius: 10,
    falloff: 0.5,
  };
}
