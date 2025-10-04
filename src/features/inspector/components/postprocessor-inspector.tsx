"use client";

import { useSetAtom } from "jotai";
import { DragInput } from "@/components/ui/drag-input";
import { updateObjectAtom } from "@/features/scene/state";
import type { PostprocessorObject } from "@/features/scene/types";

type PostprocessorInspectorProps = {
  object: PostprocessorObject;
};

export function PostprocessorInspector({
  object,
}: PostprocessorInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);

  const handleControlChange = (
    key: string,
    value: number | string | boolean,
  ) => {
    updateObject(object.id, {
      controls: {
        ...object.controls,
        [key]: value,
      },
    });
  };

  const handleEnabledChange = (enabled: boolean) => {
    updateObject(object.id, { enabled });
  };

  return (
    <div className="space-y-4">
      {/* Effect Type */}
      <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Effect
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Type</span>
            <span className="text-xs text-neutral-200 capitalize">
              {object.effectType}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Enabled</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={object.enabled}
                onChange={(e) => handleEnabledChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Bloom Controls */}
      {object.effectType === "bloom" && (
        <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
          <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Bloom Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="threshold"
                className="text-xs text-neutral-400 block mb-1"
              >
                Threshold
              </label>
              <DragInput
                id="threshold"
                value={(object.controls.threshold as number) ?? 0.85}
                onChange={(value) => handleControlChange("threshold", value)}
                min={0}
                max={1}
                step={0.01}
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Brightness threshold for bloom
              </p>
            </div>
            <div>
              <label
                htmlFor="strength"
                className="text-xs text-neutral-400 block mb-1"
              >
                Strength
              </label>
              <DragInput
                id="strength"
                value={(object.controls.strength as number) ?? 0.5}
                onChange={(value) => handleControlChange("strength", value)}
                min={0}
                max={3}
                step={0.01}
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Intensity of the bloom effect
              </p>
            </div>
            <div>
              <label
                htmlFor="radius"
                className="text-xs text-neutral-400 block mb-1"
              >
                Radius
              </label>
              <DragInput
                id="radius"
                value={(object.controls.radius as number) ?? 0.5}
                onChange={(value) => handleControlChange("radius", value)}
                min={0}
                max={1}
                step={0.01}
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Blur radius (0-1 range)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dot Screen Controls */}
      {object.effectType === "dotScreen" && (
        <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
          <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Dot Screen Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="scale"
                className="text-xs text-neutral-400 block mb-1"
              >
                Scale
              </label>
              <DragInput
                id="scale"
                value={(object.controls.scale as number) ?? 0.3}
                onChange={(value) => handleControlChange("scale", value)}
                min={0}
                max={1}
                step={0.01}
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Dot pattern scale
              </p>
            </div>
            <div>
              <label
                htmlFor="rotation"
                className="text-xs text-neutral-400 block mb-1"
              >
                Angle
              </label>
              <DragInput
                id="rotation"
                value={(object.controls.angle as number) ?? 1.57}
                onChange={(value) => handleControlChange("angle", value)}
                min={0}
                max={6.28}
                step={0.01}
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Rotation angle in radians
              </p>
            </div>
            <div>
              <label
                htmlFor="colorpicker-dot"
                className="text-xs text-neutral-400 block mb-1"
              >
                Dot Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="colorpicker-dot"
                  type="color"
                  value={(object.controls.dotColor as string) ?? "#000000"}
                  onChange={(e) =>
                    handleControlChange("dotColor", e.target.value)
                  }
                  className="w-12 h-8 rounded border border-neutral-600 bg-neutral-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={(object.controls.dotColor as string) ?? "#000000"}
                  onChange={(e) =>
                    handleControlChange("dotColor", e.target.value)
                  }
                  className="flex-1 px-2 py-1 text-xs rounded border border-neutral-600 bg-neutral-700 text-neutral-200"
                  placeholder="#000000"
                />
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                Color of the dots
              </p>
            </div>
            <div>
              <label
                htmlFor="background-color"
                className="text-xs text-neutral-400 block mb-1"
              >
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="background-color"
                  type="color"
                  value={
                    (object.controls.backgroundColor as string) ?? "#ffffff"
                  }
                  onChange={(e) =>
                    handleControlChange("backgroundColor", e.target.value)
                  }
                  className="w-12 h-8 rounded border border-neutral-600 bg-neutral-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={
                    (object.controls.backgroundColor as string) ?? "#ffffff"
                  }
                  onChange={(e) =>
                    handleControlChange("backgroundColor", e.target.value)
                  }
                  className="flex-1 px-2 py-1 text-xs rounded border border-neutral-600 bg-neutral-700 text-neutral-200"
                  placeholder="#ffffff"
                />
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                Background color between dots
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chromatic Aberration Controls */}
      {object.effectType === "chromaticAberration" && (
        <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
          <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Chromatic Aberration Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="strength"
                className="text-xs text-neutral-400 block mb-1"
              >
                Strength
              </label>
              <DragInput
                id="strength"
                value={(object.controls.strength as number) ?? 1.5}
                onChange={(value) => handleControlChange("strength", value)}
                min={0}
                max={3}
                step={0.01}
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Intensity of color separation
              </p>
            </div>
            <div>
              <label
                htmlFor="center-x"
                className="text-xs text-neutral-400 block mb-1"
              >
                Center X
              </label>
              <DragInput
                id="center-x"
                value={(object.controls.centerX as number) ?? 0.5}
                onChange={(value) => handleControlChange("centerX", value)}
                min={-1}
                max={1}
                step={0.01}
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Horizontal center point
              </p>
            </div>
            <div>
              <label
                htmlFor="center-y"
                className="text-xs text-neutral-400 block mb-1"
              >
                Center Y
              </label>
              <DragInput
                id="center-y"
                value={(object.controls.centerY as number) ?? 0.5}
                onChange={(value) => handleControlChange("centerY", value)}
                min={-1}
                max={1}
                step={0.01}
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Vertical center point
              </p>
            </div>
            <div>
              <label
                htmlFor="scale"
                className="text-xs text-neutral-400 block mb-1"
              >
                Scale
              </label>
              <DragInput
                id="scale"
                value={(object.controls.scale as number) ?? 1.2}
                onChange={(value) => handleControlChange("scale", value)}
                min={0.5}
                max={2}
                step={0.01}
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Scale of the aberration effect
              </p>
            </div>
          </div>
        </div>
      )}

      {/* After Image Controls */}
      {object.effectType === "afterImage" && (
        <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
          <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            After Image Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="damp"
                className="text-xs text-neutral-400 block mb-1"
              >
                Damp
              </label>
              <DragInput
                id="damp"
                value={(object.controls.damp as number) ?? 0.8}
                onChange={(value) => handleControlChange("damp", value)}
                min={0.25}
                max={1}
                step={0.01}
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Damping factor - higher values create longer trails
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
