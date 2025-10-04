"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Diamond } from "lucide-react";
import { DragInput } from "@/components/ui/drag-input";
import { currentTimeAtom } from "@/features/audio/state";
import { addKeyframeAtom, updateObjectAtom } from "@/features/scene/state";
import type { Transform } from "@/features/scene/types";

type TransformSectionProps = {
  objectId: string;
  transform: Transform;
};

export function TransformSection({
  objectId,
  transform,
}: TransformSectionProps) {
  const updateObject = useSetAtom(updateObjectAtom);
  const addKeyframe = useSetAtom(addKeyframeAtom);
  const currentTime = useAtomValue(currentTimeAtom);

  const handleTransformChange = (
    axis: "position" | "rotation" | "scale",
    component: "x" | "y" | "z",
    value: number,
  ) => {
    updateObject(objectId, {
      transform: {
        ...transform,
        [axis]: {
          ...transform[axis],
          [component]: value,
        },
      },
    });
  };

  const handleKeyframe = (
    axis: "position" | "rotation" | "scale",
    component: "x" | "y" | "z",
  ) => {
    const value = transform[axis][component];
    addKeyframe(objectId, `transform.${axis}.${component}`, currentTime, value);
  };

  const renderAxis = (
    label: string,
    axis: "position" | "rotation" | "scale",
  ) => (
    <div className="space-y-2">
      <p className="text-xs font-medium text-neutral-400">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {(["x", "y", "z"] as const).map((component) => (
          <div key={component} className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-500 uppercase">
              {component}
            </span>
            <div className="flex items-center gap-1">
              <DragInput
                value={transform[axis][component]}
                onChange={(v) => handleTransformChange(axis, component, v)}
                step={0.1}
                precision={2}
                compact
              />
              <button
                type="button"
                onClick={() => handleKeyframe(axis, component)}
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
  );

  return (
    <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
      <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
        Transform
      </h3>
      {renderAxis("Position", "position")}
      {renderAxis("Rotation", "rotation")}
      {renderAxis("Scale", "scale")}
    </div>
  );
}
