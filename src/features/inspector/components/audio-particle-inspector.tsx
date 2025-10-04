"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { DragInput } from "@/components/ui/drag-input";
import { sceneObjectsAtom, updateObjectAtom } from "@/features/scene/state";
import type { AudioParticleObject } from "@/features/particles/types";
import { TransformSection } from "./transform-section";

type AudioParticleInspectorProps = {
  object: AudioParticleObject;
};

export function AudioParticleInspector({
  object,
}: AudioParticleInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);
  const allObjects = useAtomValue(sceneObjectsAtom);

  const primitives = allObjects.filter((obj) => obj.type === "primitive");

  return (
    <>
      <TransformSection objectId={object.id} transform={object.transform} />
      <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Audio Particles
        </h3>

        <div className="space-y-2">
          <span className="text-xs text-neutral-400">Target Primitive</span>
          <select
            value={object.targetPrimitiveId || ""}
            onChange={(e) =>
              updateObject(object.id, {
                targetPrimitiveId: e.target.value || null,
              })
            }
            className="w-full px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-300"
          >
            <option value="">None</option>
            {primitives.map((prim) => (
              <option key={prim.id} value={prim.id}>
                {prim.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Path Type</span>
          <select
            value={object.pathType}
            onChange={(e) =>
              updateObject(object.id, {
                pathType: e.target.value as "orbit" | "wave" | "spiral" | "linear",
              })
            }
            className="flex-1 px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-300"
          >
            <option value="orbit">Orbit</option>
            <option value="wave">Wave</option>
            <option value="spiral">Spiral</option>
            <option value="linear">Linear</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Count</span>
          <DragInput
            value={object.particleCount}
            onChange={(v) =>
              updateObject(object.id, { particleCount: Math.round(v) })
            }
            step={1}
            precision={0}
            min={1}
            max={500}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Path Scale</span>
          <DragInput
            value={object.pathScale}
            onChange={(v) => updateObject(object.id, { pathScale: v })}
            step={0.1}
            precision={2}
            min={0.1}
            max={50}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Path Speed</span>
          <DragInput
            value={object.pathSpeed}
            onChange={(v) => updateObject(object.id, { pathSpeed: v })}
            step={0.05}
            precision={2}
            min={0}
            max={10}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Base Size</span>
          <DragInput
            value={object.baseSize}
            onChange={(v) => updateObject(object.id, { baseSize: v })}
            step={0.01}
            precision={2}
            min={0.01}
            max={5}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Dynamic Size</span>
          <DragInput
            value={object.dynamicSize}
            onChange={(v) => updateObject(object.id, { dynamicSize: v })}
            step={0.1}
            precision={2}
            min={0}
            max={10}
            compact
          />
        </div>

        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pt-2">
          Audio Reactive
        </h4>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Reactivity</span>
          <DragInput
            value={object.audioReactivity}
            onChange={(v) => updateObject(object.id, { audioReactivity: v })}
            step={0.1}
            precision={2}
            min={0}
            max={5}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Gain</span>
          <DragInput
            value={object.audioGain}
            onChange={(v) => updateObject(object.id, { audioGain: v })}
            step={0.1}
            precision={2}
            min={0}
            max={10}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Threshold</span>
          <DragInput
            value={object.audioThreshold}
            onChange={(v) => updateObject(object.id, { audioThreshold: v })}
            step={0.01}
            precision={2}
            min={0}
            max={1}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Freq Start</span>
          <DragInput
            value={object.freqRangeStart}
            onChange={(v) => updateObject(object.id, { freqRangeStart: v })}
            step={0.01}
            precision={2}
            min={0}
            max={1}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Freq End</span>
          <DragInput
            value={object.freqRangeEnd}
            onChange={(v) => updateObject(object.id, { freqRangeEnd: v })}
            step={0.01}
            precision={2}
            min={0}
            max={1}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Smoothing</span>
          <DragInput
            value={object.smoothing}
            onChange={(v) => updateObject(object.id, { smoothing: v })}
            step={0.01}
            precision={2}
            min={0}
            max={1}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Emissive Boost</span>
          <DragInput
            value={object.emissiveBoost}
            onChange={(v) => updateObject(object.id, { emissiveBoost: v })}
            step={0.1}
            precision={2}
            min={0}
            max={10}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Color Variation</span>
          <DragInput
            value={object.colorVariation}
            onChange={(v) => updateObject(object.id, { colorVariation: v })}
            step={0.01}
            precision={2}
            min={0}
            max={1}
            compact
          />
        </div>
      </div>
    </>
  );
}
