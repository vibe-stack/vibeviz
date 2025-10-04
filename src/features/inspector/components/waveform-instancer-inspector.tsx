"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { DragInput } from "@/components/ui/drag-input";
import { sceneObjectsAtom, updateObjectAtom } from "@/features/scene/state";
import type { WaveformInstancerObject } from "@/features/scene/types";
import { TransformSection } from "./transform-section";

type WaveformInstancerInspectorProps = {
  object: WaveformInstancerObject;
};

export function WaveformInstancerInspector({
  object,
}: WaveformInstancerInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);
  const allObjects = useAtomValue(sceneObjectsAtom);

  const primitives = allObjects.filter((obj) => obj.type === "primitive");

  return (
    <>
      <TransformSection objectId={object.id} transform={object.transform} />
      <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Waveform Instancer
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
          <span className="text-xs text-neutral-400 w-24">Arrangement</span>
          <select
            value={object.arrangement}
            onChange={(e) =>
              updateObject(object.id, {
                arrangement: e.target.value as
                  | "linear"
                  | "radial"
                  | "radial-outwards",
              })
            }
            className="flex-1 px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-300"
          >
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
            <option value="radial-outwards">Radial Outwards</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Count</span>
          <DragInput
            value={object.instanceCount}
            onChange={(v) =>
              updateObject(object.id, { instanceCount: Math.round(v) })
            }
            step={1}
            precision={0}
            min={1}
            max={256}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Spacing</span>
          <DragInput
            value={object.spacing}
            onChange={(v) => updateObject(object.id, { spacing: v })}
            step={0.01}
            precision={2}
            min={0.01}
            max={40}
            compact
          />
        </div>

        {(object.arrangement === "radial" ||
          object.arrangement === "radial-outwards") && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 w-24">
                Arc Start (°)
              </span>
              <DragInput
                value={object.arcStartDegrees ?? 0}
                onChange={(v) =>
                  updateObject(object.id, { arcStartDegrees: v })
                }
                step={1}
                precision={0}
                min={-360}
                max={720}
                compact
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 w-24">Arc End (°)</span>
              <DragInput
                value={object.arcEndDegrees ?? 360}
                onChange={(v) => updateObject(object.id, { arcEndDegrees: v })}
                step={1}
                precision={0}
                min={-360}
                max={720}
                compact
              />
            </div>
          </>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Base Height</span>
          <DragInput
            value={object.baseHeight}
            onChange={(v) => updateObject(object.id, { baseHeight: v })}
            step={0.01}
            precision={2}
            min={0.01}
            max={10}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Dynamic Length</span>
          <DragInput
            value={object.dynamicLength}
            onChange={(v) => updateObject(object.id, { dynamicLength: v })}
            step={0.1}
            precision={1}
            min={0}
            max={20}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Smoothing</span>
          <DragInput
            value={object.smoothing}
            onChange={(v) => updateObject(object.id, { smoothing: v })}
            step={0.1}
            precision={1}
            min={0}
            max={10}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Audio Threshold</span>
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
          <span className="text-xs text-neutral-400 w-24">Audio Gain</span>
          <DragInput
            value={object.audioGain}
            onChange={(v) => updateObject(object.id, { audioGain: v })}
            step={0.1}
            precision={1}
            min={0}
            max={10}
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
          <span className="text-xs text-neutral-400 w-24">Emissive Boost</span>
          <DragInput
            value={object.emissiveBoost}
            onChange={(v) => updateObject(object.id, { emissiveBoost: v })}
            step={0.1}
            precision={1}
            min={0}
            max={5}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Pivot Point</span>
          <select
            value={object.pivotPoint}
            onChange={(e) =>
              updateObject(object.id, {
                pivotPoint: e.target.value as "bottom" | "center" | "top",
              })
            }
            className="flex-1 px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-300"
          >
            <option value="bottom">Bottom</option>
            <option value="center">Center</option>
            <option value="top">Top</option>
          </select>
        </div>
      </div>
    </>
  );
}
