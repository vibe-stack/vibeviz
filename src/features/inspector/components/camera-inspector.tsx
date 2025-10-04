"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Diamond } from "lucide-react";
import { DragInput } from "@/components/ui/drag-input";
import { currentTimeAtom } from "@/features/audio/state";
import { addKeyframeAtom, updateObjectAtom } from "@/features/scene/state";
import type { CameraObject } from "@/features/scene/types";
import { TransformSection } from "./transform-section";

type CameraInspectorProps = {
  object: CameraObject;
};

export function CameraInspector({ object }: CameraInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);
  const addKeyframe = useSetAtom(addKeyframeAtom);
  const currentTime = useAtomValue(currentTimeAtom);

  const handleActiveChange = (value: boolean) => {
    updateObject(object.id, { isActive: value });
  };

  const handleKeyframeActive = () => {
    addKeyframe(object.id, "isActive", currentTime, object.isActive);
  };

  return (
    <>
      <TransformSection objectId={object.id} transform={object.transform} />
      <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Camera
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-20">Active</span>
          <input
            type="checkbox"
            checked={object.isActive}
            onChange={(e) => handleActiveChange(e.target.checked)}
            className="rounded"
          />
          <button
            type="button"
            onClick={handleKeyframeActive}
            className="p-1 hover:bg-neutral-700 rounded transition-colors ml-auto"
            title="Add keyframe"
          >
            <Diamond className="w-3 h-3 text-emerald-400" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-20">FOV</span>
          <DragInput
            value={object.fov}
            onChange={(v) => updateObject(object.id, { fov: v })}
            step={1}
            precision={0}
            min={10}
            max={120}
            compact
          />
        </div>
      </div>
    </>
  );
}
