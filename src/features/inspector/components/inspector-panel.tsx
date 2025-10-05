"use client";

import { useAtomValue } from "jotai";
import { selectedObjectsAtom } from "@/features/scene/state";
import {
  AudioParticleInspector,
  CameraInspector,
  DynamicParticleInspector,
  ForceFieldInspector,
  GLBInspector,
  LightInspector,
  PostprocessorInspector,
  PrimitiveInspector,
  ShaderInspector,
  WaveformInstancerInspector,
  WaveformLinesInspector,
} from "./index";

export function InspectorPanel() {
  const selectedObjects = useAtomValue(selectedObjectsAtom);

  if (selectedObjects.length === 0) {
    return (
      <div className="flex flex-col h-full rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
        <div className="px-4 py-3 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-200">Inspector</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-neutral-500 text-center">
            Select an object to inspect
          </p>
        </div>
      </div>
    );
  }

  const object = selectedObjects[0];

  return (
    <div className="flex flex-col h-full rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-200">Inspector</h2>
        <p className="text-xs text-neutral-500 mt-0.5">{object.name}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {object.type === "primitive" && <PrimitiveInspector object={object} />}
        {object.type === "shader" && <ShaderInspector object={object} />}
        {object.type === "camera" && <CameraInspector object={object} />}
        {object.type === "light" && <LightInspector object={object} />}
        {object.type === "waveformInstancer" && (
          <WaveformInstancerInspector object={object} />
        )}
        {object.type === "waveformLines" && (
          <WaveformLinesInspector object={object} />
        )}
        {object.type === "postprocessor" && (
          <PostprocessorInspector object={object} />
        )}
        {object.type === "audioParticle" && (
          <AudioParticleInspector object={object} />
        )}
        {object.type === "dynamicParticle" && (
          <DynamicParticleInspector object={object} />
        )}
        {object.type === "forceField" && (
          <ForceFieldInspector object={object} />
        )}
        {object.type === "glb" && <GLBInspector object={object} />}
      </div>
    </div>
  );
}
