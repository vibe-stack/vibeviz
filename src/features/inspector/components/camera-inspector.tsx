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

  const handleTargetChange = (component: "x" | "y" | "z", value: number) => {
    updateObject(object.id, {
      target: {
        ...object.target,
        [component]: value,
      },
    });
  };

  const handleKeyframeTarget = (component: "x" | "y" | "z") => {
    const value = object.target[component];
    addKeyframe(object.id, `target.${component}`, currentTime, value);
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

        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-400">Look At Target</p>
          <div className="grid grid-cols-3 gap-2">
            {(["x", "y", "z"] as const).map((component) => (
              <div key={component} className="flex flex-col gap-1">
                <span className="text-[10px] text-neutral-500 uppercase">
                  {component}
                </span>
                <div className="flex items-center gap-1">
                  <DragInput
                    value={object.target[component]}
                    onChange={(v) => handleTargetChange(component, v)}
                    step={0.1}
                    precision={2}
                    compact
                  />
                  <button
                    type="button"
                    onClick={() => handleKeyframeTarget(component)}
                    className="p-1 hover:bg-neutral-700 rounded transition-colors flex-shrink-0"
                    title="Add keyframe"
                  >
                    <Diamond className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
