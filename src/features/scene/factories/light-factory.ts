import { nanoid } from "nanoid";
import type { LightObject, LightType } from "../types";

export function createLight(lightType: LightType): LightObject {
  const baseLight: LightObject = {
    id: nanoid(),
    name: `${lightType.charAt(0).toUpperCase() + lightType.slice(1)} Light`,
    type: "light",
    lightType,
    transform: {
      position: { x: 0, y: 5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    visible: true,
    color: "#ffffff",
    intensity: 1,
  };

  // Add type-specific defaults
  switch (lightType) {
    case "ambient":
      baseLight.intensity = 0.5;
      break;
    case "directional":
      baseLight.castShadow = true;
      baseLight.intensity = 1;
      break;
    case "point":
      baseLight.distance = 10;
      baseLight.decay = 2;
      baseLight.castShadow = true;
      break;
    case "spot":
      baseLight.distance = 10;
      baseLight.decay = 2;
      baseLight.angle = Math.PI / 6;
      baseLight.penumbra = 0.1;
      baseLight.castShadow = true;
      baseLight.target = { x: 0, y: 0, z: 0 };
      break;
    case "env":
      baseLight.intensity = 0.8;
      break;
  }

  return baseLight;
}
