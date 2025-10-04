"use client";

import { useAtomValue } from "jotai";
import { selectedObjectIdsAtom } from "@/features/scene/state";
import type { SceneObject } from "@/features/scene/types";
import {
  CameraRenderer,
  LightRenderer,
  PrimitiveRenderer,
  ShaderRenderer,
  WaveformInstancerRenderer,
  WaveformLinesRenderer,
  GLBRenderer,
} from "./index";
import {
  AudioParticleRenderer,
  DynamicParticleRenderer,
  ForceFieldRenderer,
} from "@/features/particles/components";

type SceneRendererProps = {
  objects: SceneObject[];
};

export function SceneRenderer({ objects }: SceneRendererProps) {
  const selectedIds = useAtomValue(selectedObjectIdsAtom);
  return (
    <>
      {objects.map((obj) => {
        if (obj.type === "postprocessor") return null;
        if (!obj.visible) return null;

        const isSelected = selectedIds.includes(obj.id);

        switch (obj.type) {
          case "primitive":
            return (
              <PrimitiveRenderer
                key={obj.id}
                object={obj}
                isSelected={isSelected}
              />
            );
          case "shader":
            return (
              <ShaderRenderer
                key={obj.id}
                object={obj}
                isSelected={isSelected}
              />
            );
          case "waveformInstancer":
            return (
              <WaveformInstancerRenderer
                key={obj.id}
                object={obj}
                isSelected={isSelected}
              />
            );
          case "waveformLines":
            return (
              <WaveformLinesRenderer
                key={obj.id}
                object={obj}
                isSelected={isSelected}
              />
            );
          case "camera":
            return <CameraRenderer key={obj.id} object={obj} />;
          case "light":
            return (
              <LightRenderer
                key={obj.id}
                object={obj}
                isSelected={isSelected}
              />
            );
          case "audioParticle":
            return (
              <AudioParticleRenderer
                key={obj.id}
                object={obj}
                isSelected={isSelected}
              />
            );
          case "dynamicParticle":
            return (
              <DynamicParticleRenderer
                key={obj.id}
                object={obj}
                isSelected={isSelected}
              />
            );
          case "forceField":
            return (
              <ForceFieldRenderer
                key={obj.id}
                object={obj}
                isSelected={isSelected}
              />
            );
          case "glb":
            return (
              <GLBRenderer
                key={obj.id}
                object={obj}
                isSelected={isSelected}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
