"use client";

import { useSetAtom } from "jotai";
import { BlendModeSection } from "@/features/inspector/components";
import { updateObjectAtom } from "@/features/scene/state";
import type { StarryNightControls } from "@/features/shaders/types";

type StarryNightInspectorProps = {
  objectId: string;
  controls: StarryNightControls;
};

export function StarryNightInspector({
  objectId,
  controls,
}: StarryNightInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);

  const updateControl = <K extends keyof StarryNightControls>(
    key: K,
    value: StarryNightControls[K],
  ) => {
    updateObject(objectId, {
      controls: { ...controls, [key]: value },
    });
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Background Gradient
        </h3>
        <div className="space-y-2">
          <div>
            <label
              htmlFor={`top-color`}
              className="text-xs text-neutral-400 block mb-1"
            >
              Top Color
            </label>
            <input
              type="color"
              value={controls.topColor}
              onChange={(e) => updateControl("topColor", e.target.value)}
              className="w-full h-8 rounded bg-neutral-700 border border-neutral-600"
            />
          </div>
          <div>
            <label
              htmlFor={`bottom-color`}
              className="text-xs text-neutral-400 block mb-1"
            >
              Bottom Color
            </label>
            <input
              type="color"
              value={controls.bottomColor}
              onChange={(e) => updateControl("bottomColor", e.target.value)}
              className="w-full h-8 rounded bg-neutral-700 border border-neutral-600"
            />
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Stars
        </h3>
        <div className="space-y-2">
          <div>
            <label
              htmlFor={`star-color`}
              className="text-xs text-neutral-400 block mb-1"
            >
              Star Color
            </label>
            <input
              type="color"
              value={controls.starColor}
              onChange={(e) => updateControl("starColor", e.target.value)}
              className="w-full h-8 rounded bg-neutral-700 border border-neutral-600"
            />
          </div>
          <div>
            <label
              htmlFor={`star-count`}
              className="text-xs text-neutral-400 flex justify-between mb-1"
            >
              <span>Star Count</span>
              <span className="text-neutral-500">{controls.starCount}</span>
            </label>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={controls.starCount}
              onChange={(e) =>
                updateControl("starCount", Number(e.target.value))
              }
              className="w-full"
            />
          </div>
          <div>
            <label
              htmlFor={`star-size`}
              className="text-xs text-neutral-400 flex justify-between mb-1"
            >
              <span>Star Size</span>
              <span className="text-neutral-500">
                {controls.starSize.toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={controls.starSize}
              onChange={(e) =>
                updateControl("starSize", Number(e.target.value))
              }
              className="w-full"
            />
          </div>
          <div>
            <label
              htmlFor={`star-brightness`}
              className="text-xs text-neutral-400 flex justify-between mb-1"
            >
              <span>Brightness</span>
              <span className="text-neutral-500">
                {controls.starBrightness.toFixed(2)}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={controls.starBrightness}
              onChange={(e) =>
                updateControl("starBrightness", Number(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Shooting Stars
        </h3>
        <div className="space-y-2">
          <div>
            <label
              htmlFor={`shooting-star-frequency`}
              className="text-xs text-neutral-400 flex justify-between mb-1"
            >
              <span>Frequency</span>
              <span className="text-neutral-500">
                {controls.shootingStarFrequency.toFixed(2)}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={controls.shootingStarFrequency}
              onChange={(e) =>
                updateControl("shootingStarFrequency", Number(e.target.value))
              }
              className="w-full"
            />
          </div>
          <div>
            <label
              htmlFor={`shooting-star-speed`}
              className="text-xs text-neutral-400 flex justify-between mb-1"
            >
              <span>Speed</span>
              <span className="text-neutral-500">
                {controls.shootingStarSpeed.toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={controls.shootingStarSpeed}
              onChange={(e) =>
                updateControl("shootingStarSpeed", Number(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      <BlendModeSection
        blendMode={controls.blendMode}
        opacity={controls.opacity}
        onChange={(blendMode) => updateControl("blendMode", blendMode)}
        onOpacityChange={(opacity) => updateControl("opacity", opacity)}
      />
    </div>
  );
}
