"use client";

import type { ShaderObject } from "@/features/scene/types";
import { GalaxyTravelInspector } from "@/features/shaders/components/galaxy-travel-inspector";
import { RainbowInspector } from "@/features/shaders/components/rainbow-inspector";
import { StarryNightInspector } from "@/features/shaders/components/starry-night-inspector";
import { SupernovaRemnantInspector } from "@/features/shaders/components/supernova-remnant-inspector";
import type {
  GalaxyTravelControls,
  RainbowControls,
  StarryNightControls,
  SupernovaRemnantControls,
} from "@/features/shaders/types";
import { TransformSection } from "./transform-section";

type ShaderInspectorProps = {
  object: ShaderObject;
};

export function ShaderInspector({ object }: ShaderInspectorProps) {
  return (
    <>
      <TransformSection objectId={object.id} transform={object.transform} />

      {object.shaderType === "starryNight" && (
        <StarryNightInspector
          objectId={object.id}
          controls={object.controls as StarryNightControls}
        />
      )}

      {object.shaderType === "galaxyTravel" && (
        <GalaxyTravelInspector
          objectId={object.id}
          controls={object.controls as GalaxyTravelControls}
        />
      )}

      {object.shaderType === "rainbow" && (
        <RainbowInspector
          objectId={object.id}
          controls={object.controls as unknown as RainbowControls}
        />
      )}

      {object.shaderType === "supernovaRemnant" && (
        <SupernovaRemnantInspector
          objectId={object.id}
          controls={object.controls as SupernovaRemnantControls}
        />
      )}
    </>
  );
}
