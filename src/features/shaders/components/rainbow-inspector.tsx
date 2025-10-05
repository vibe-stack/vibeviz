"use client";

import { useState } from "react";
import { useSetAtom } from "jotai";
import { DragInput } from "@/components/ui/drag-input";
import { BlendModeSection } from "@/features/inspector/components";
import { updateObjectAtom } from "@/features/scene/state";
import type { RainbowControls } from "@/features/shaders/types";

type RainbowInspectorProps = {
  objectId: string;
  controls: RainbowControls;
};

export function RainbowInspector({
  objectId,
  controls,
}: RainbowInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);
  const [localColors, setLocalColors] = useState<Record<number, string>>({});

  const updateControl = <K extends keyof RainbowControls>(
    key: K,
    value: RainbowControls[K],
  ) => {
    updateObject(objectId, {
      controls: { ...controls, [key]: value },
    } as any);
  };

  const updatePaletteColor = (index: number, color: string) => {
    const newColors = [...controls.colorPalette.colors];
    newColors[index] = color;
    updateControl("colorPalette", {
      ...controls.colorPalette,
      colors: newColors,
    });
    // Clear local state after update
    setLocalColors((prev) => {
      const newLocal = { ...prev };
      delete newLocal[index];
      return newLocal;
    });
  };

  const addPaletteColor = () => {
    if (controls.colorPalette.colors.length < 7) {
      updateControl("colorPalette", {
        ...controls.colorPalette,
        colors: [...controls.colorPalette.colors, "#ffffff"],
      });
    }
  };

  const removePaletteColor = (index: number) => {
    if (controls.colorPalette.colors.length > 2) {
      const newColors = controls.colorPalette.colors.filter(
        (_, i) => i !== index,
      );
      updateControl("colorPalette", {
        ...controls.colorPalette,
        colors: newColors,
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Pattern
        </h3>
        <div className="space-y-2">
          <div>
            <label
              htmlFor="pattern-type"
              className="text-xs text-neutral-400 block mb-1"
            >
              Pattern Type
            </label>
            <select
              value={controls.patternType}
              onChange={(e) =>
                updateControl(
                  "patternType",
                  e.target.value as RainbowControls["patternType"],
                )
              }
              className="w-full px-2 py-1 text-sm rounded bg-neutral-700 border border-neutral-600 text-neutral-200"
            >
              <option value="classic">Classic Rainbow</option>
              <option value="waves">Waves</option>
              <option value="spiral">Spiral</option>
              <option value="radial">Radial</option>
            </select>
          </div>
          <DragInput
            label="Speed"
            value={controls.speed}
            onChange={(v) => updateControl("speed", v)}
            min={0}
            max={10}
            step={0.1}
            precision={1}
          />
          <DragInput
            label="Scale"
            value={controls.scale}
            onChange={(v) => updateControl("scale", v)}
            min={0.1}
            max={10}
            step={0.1}
            precision={1}
          />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Colors
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400">Custom Palette</span>
            <input
              type="checkbox"
              checked={controls.useCustomPalette}
              onChange={(e) =>
                updateControl("useCustomPalette", e.target.checked)
              }
              className="rounded bg-neutral-700 border-neutral-600"
            />
          </div>

          {controls.useCustomPalette ? (
            <>
              <div className="space-y-1">
                {controls.colorPalette.colors.map((color, index) => (
                  <div
                    key={`${index}-${color}`}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="color"
                      value={localColors[index] ?? color}
                      onChange={(e) => {
                        // Update local state for immediate visual feedback
                        const newColor = e.target.value;
                        setLocalColors((prev) => ({
                          ...prev,
                          [index]: newColor,
                        }));
                      }}
                      onBlur={(e) => {
                        // Update global state when done
                        const finalColor = e.target.value;
                        if (finalColor) {
                          updatePaletteColor(index, finalColor);
                        }
                      }}
                      className="w-8 h-6 rounded bg-neutral-700 border border-neutral-600 cursor-pointer"
                    />
                    <span className="text-xs text-neutral-400 flex-1">
                      Color {index + 1}
                    </span>
                    {controls.colorPalette.colors.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePaletteColor(index)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {controls.colorPalette.colors.length < 7 && (
                <button
                  type="button"
                  onClick={addPaletteColor}
                  className="w-full text-xs text-neutral-400 hover:text-neutral-300 py-1 border border-dashed border-neutral-600 rounded"
                >
                  + Add Color
                </button>
              )}
            </>
          ) : (
            <>
              <DragInput
                label="Saturation"
                value={controls.saturation}
                onChange={(v) => updateControl("saturation", v)}
                min={0}
                max={1}
                step={0.01}
                precision={2}
              />
              <DragInput
                label="Brightness"
                value={controls.brightness}
                onChange={(v) => updateControl("brightness", v)}
                min={0}
                max={1}
                step={0.01}
                precision={2}
              />
            </>
          )}

          <DragInput
            label="Contrast"
            value={controls.contrast}
            onChange={(v) => updateControl("contrast", v)}
            min={0.5}
            max={2}
            step={0.05}
            precision={2}
          />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Wave Effects
        </h3>
        <div className="space-y-2">
          <DragInput
            label="Amplitude"
            value={controls.waveAmplitude}
            onChange={(v) => updateControl("waveAmplitude", v)}
            min={0}
            max={2}
            step={0.05}
            precision={2}
          />
          <DragInput
            label="Frequency"
            value={controls.waveFrequency}
            onChange={(v) => updateControl("waveFrequency", v)}
            min={0.5}
            max={10}
            step={0.1}
            precision={1}
          />
          <DragInput
            label="Turbulence"
            value={controls.turbulence}
            onChange={(v) => updateControl("turbulence", v)}
            min={0}
            max={10}
            step={0.1}
            precision={1}
          />
          <DragInput
            label="Cells"
            value={controls.cells}
            onChange={(v) => updateControl("cells", v)}
            min={0}
            max={10}
            step={0.1}
            precision={1}
          />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Audio Reactive
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Audio Reactive</span>
            <input
              type="checkbox"
              checked={controls.audioReactive}
              onChange={(e) => updateControl("audioReactive", e.target.checked)}
              className="rounded bg-neutral-700 border-neutral-600"
            />
          </div>
          {controls.audioReactive && (
            <>
              <div className="space-y-1 pl-2 border-l-2 border-neutral-700">
                <label className="flex items-center gap-2 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={controls.audioAffectsSpeed}
                    onChange={(e) =>
                      updateControl("audioAffectsSpeed", e.target.checked)
                    }
                    className="rounded bg-neutral-700 border-neutral-600"
                  />
                  <span>Affects Speed</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={controls.audioAffectsAmplitude}
                    onChange={(e) =>
                      updateControl("audioAffectsAmplitude", e.target.checked)
                    }
                    className="rounded bg-neutral-700 border-neutral-600"
                  />
                  <span>Affects Wave Amplitude</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={controls.audioAffectsScale}
                    onChange={(e) =>
                      updateControl("audioAffectsScale", e.target.checked)
                    }
                    className="rounded bg-neutral-700 border-neutral-600"
                  />
                  <span>Affects Pattern Scale</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={controls.audioAffectsHue}
                    onChange={(e) =>
                      updateControl("audioAffectsHue", e.target.checked)
                    }
                    className="rounded bg-neutral-700 border-neutral-600"
                  />
                  <span>Affects Hue Shift</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={controls.audioAffectsBrightness}
                    onChange={(e) =>
                      updateControl("audioAffectsBrightness", e.target.checked)
                    }
                    className="rounded bg-neutral-700 border-neutral-600"
                  />
                  <span>Affects Brightness</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={controls.audioAffectsTurbulence}
                    onChange={(e) =>
                      updateControl("audioAffectsTurbulence", e.target.checked)
                    }
                    className="rounded bg-neutral-700 border-neutral-600"
                  />
                  <span>Affects Turbulence</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={controls.audioAffectsCells}
                    onChange={(e) =>
                      updateControl("audioAffectsCells", e.target.checked)
                    }
                    className="rounded bg-neutral-700 border-neutral-600"
                  />
                  <span>Affects Cells</span>
                </label>
              </div>
              <DragInput
                label="Influence"
                value={controls.audioInfluence}
                onChange={(v) => updateControl("audioInfluence", v)}
                min={0}
                max={2}
                step={0.05}
                precision={2}
              />
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
