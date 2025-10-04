"use client";

import { useSetAtom } from "jotai";
import { BlendModeSection } from "@/features/inspector/components";
import { updateObjectAtom } from "@/features/scene/state";
import type { GalaxyTravelControls } from "@/features/shaders/types";

type GalaxyTravelInspectorProps = {
  objectId: string;
  controls: GalaxyTravelControls;
};

export function GalaxyTravelInspector({
  objectId,
  controls,
}: GalaxyTravelInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);

  const updateControl = <K extends keyof GalaxyTravelControls>(
    key: K,
    value: GalaxyTravelControls[K],
  ) => {
    updateObject(objectId, {
      controls: { ...controls, [key]: value },
    });
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Background
        </h3>
        <div className="space-y-2">
          <div>
            <label
              htmlFor="background-color"
              className="text-xs text-neutral-400 block mb-1"
            >
              Background Color
            </label>
            <input
              type="color"
              value={controls.backgroundColor}
              onChange={(e) => updateControl("backgroundColor", e.target.value)}
              className="w-full h-8 rounded bg-neutral-700 border border-neutral-600"
            />
          </div>
          <div>
            <label
              htmlFor="star-color"
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
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Stars
        </h3>
        <div className="space-y-2">
          <div>
            <label
              htmlFor="star-count"
              className="text-xs text-neutral-400 flex justify-between mb-1"
            >
              <span>Star Count</span>
              <span className="text-neutral-500">{controls.starCount}</span>
            </label>
            <input
              type="range"
              min="100"
              max="600"
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
              htmlFor="star-size"
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
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Travel
        </h3>
        <div className="space-y-2">
          <div>
            <label
              htmlFor="base-speed"
              className="text-xs text-neutral-400 flex justify-between mb-1"
            >
              <span>Base Speed</span>
              <span className="text-neutral-500">
                {controls.baseSpeed.toFixed(2)}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={controls.baseSpeed}
              onChange={(e) =>
                updateControl("baseSpeed", Number(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Audio Reactive
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="audio-reactive"
              className="text-xs text-neutral-400"
            >
              Enabled
            </label>
            <input
              type="checkbox"
              checked={controls.audioReactive}
              onChange={(e) => updateControl("audioReactive", e.target.checked)}
              className="w-4 h-4 rounded bg-neutral-700 border-neutral-600"
            />
          </div>
          {controls.audioReactive && (
            <>
              <div>
                <label
                  htmlFor="audio-influence"
                  className="text-xs text-neutral-400 flex justify-between mb-1"
                >
                  <span>Audio Influence</span>
                  <span className="text-neutral-500">
                    {controls.audioInfluence.toFixed(2)}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={controls.audioInfluence}
                  onChange={(e) =>
                    updateControl("audioInfluence", Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="audio-gain"
                  className="text-xs text-neutral-400 flex justify-between mb-1"
                >
                  <span>Audio Gain</span>
                  <span className="text-neutral-500">
                    {controls.audioGain.toFixed(2)}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={controls.audioGain}
                  onChange={(e) =>
                    updateControl("audioGain", Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="freq-range-start"
                  className="text-xs text-neutral-400 flex justify-between mb-1"
                >
                  <span>Freq Range Start</span>
                  <span className="text-neutral-500">
                    {controls.freqRangeStart.toFixed(2)}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={controls.freqRangeStart}
                  onChange={(e) =>
                    updateControl("freqRangeStart", Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="freq-range-end"
                  className="text-xs text-neutral-400 flex justify-between mb-1"
                >
                  <span>Freq Range End</span>
                  <span className="text-neutral-500">
                    {controls.freqRangeEnd.toFixed(2)}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={controls.freqRangeEnd}
                  onChange={(e) =>
                    updateControl("freqRangeEnd", Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </>
          )}
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
