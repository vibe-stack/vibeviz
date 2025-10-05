"use client";

import { useSetAtom } from "jotai";
import { DragInput } from "@/components/ui/drag-input";
import type { ForceFieldObject } from "@/features/particles/types";
import { updateObjectAtom } from "@/features/scene/state";
import { TransformSection } from "./transform-section";

type ForceFieldInspectorProps = {
  object: ForceFieldObject;
};

export function ForceFieldInspector({ object }: ForceFieldInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);

  return (
    <>
      <TransformSection objectId={object.id} transform={object.transform} />
      <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Force Field
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Type</span>
          <select
            value={object.forceFieldType}
            onChange={(e) =>
              updateObject(object.id, {
                forceFieldType: e.target.value as "attractor" | "repulsor",
              })
            }
            className="flex-1 px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-300"
          >
            <option value="attractor">Attractor</option>
            <option value="repulsor">Repulsor</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Strength</span>
          <DragInput
            value={object.strength}
            onChange={(v) => updateObject(object.id, { strength: v })}
            step={0.5}
            precision={2}
            min={0}
            max={100}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Radius</span>
          <DragInput
            value={object.radius}
            onChange={(v) => updateObject(object.id, { radius: v })}
            step={0.5}
            precision={2}
            min={0.1}
            max={100}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-24">Falloff</span>
          <DragInput
            value={object.falloff}
            onChange={(v) => updateObject(object.id, { falloff: v })}
            step={0.01}
            precision={2}
            min={0}
            max={1}
            compact
          />
        </div>

        <div className="text-xs text-neutral-500 mt-2 p-2 bg-neutral-900/50 rounded">
          <p>
            {object.forceFieldType === "attractor"
              ? "Pulls nearby particles towards the center"
              : "Pushes particles away from the center"}
          </p>
        </div>
      </div>
    </>
  );
}
