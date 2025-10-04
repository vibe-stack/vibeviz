"use client";

import { useSetAtom } from "jotai";
import { DragInput } from "@/components/ui/drag-input";
import { BlendModeSection } from "@/features/inspector/components";
import { updateObjectAtom } from "@/features/scene/state";
import type { SupernovaRemnantControls } from "@/features/shaders/types";

type SupernovaRemnantInspectorProps = {
  objectId: string;
  controls: SupernovaRemnantControls;
};

export function SupernovaRemnantInspector({
  objectId,
  controls,
}: SupernovaRemnantInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);

  const updateControl = <K extends keyof SupernovaRemnantControls>(
    key: K,
    value: SupernovaRemnantControls[K],
  ) => {
    updateObject(objectId, {
      controls: { ...controls, [key]: value },
    } as any);
  };

  return (
    <div className="space-y-3">
      {/* Credits Section */}
      <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
        <div className="text-xs text-neutral-400 text-center">
          <span className="block mb-1">Created by</span>
          <a
            href="https://x.com/techartist_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            @techartist_
          </a>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Animation
        </h3>
        <DragInput
          label="Speed"
          value={controls.speed}
          onChange={(v) => updateControl("speed", v)}
          min={0}
          max={3}
          step={0.1}
          precision={1}
        />
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Filament Layer 1
        </h3>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-neutral-400 block mb-1">
              Base Color
            </span>
            <input
              type="color"
              value={controls.filament1Color}
              onChange={(e) => updateControl("filament1Color", e.target.value)}
              className="w-full h-8 rounded bg-neutral-700 border border-neutral-600"
            />
          </div>
          <div>
            <span className="text-xs text-neutral-400 block mb-1">
              Glow Color
            </span>
            <input
              type="color"
              value={controls.filament1GlowColor}
              onChange={(e) =>
                updateControl("filament1GlowColor", e.target.value)
              }
              className="w-full h-8 rounded bg-neutral-700 border border-neutral-600"
            />
          </div>
          <DragInput
            label="Speed"
            value={controls.filament1Speed}
            onChange={(v) => updateControl("filament1Speed", v)}
            min={0}
            max={2}
            step={0.05}
            precision={2}
          />
          <DragInput
            label="Intensity"
            value={controls.filament1Intensity}
            onChange={(v) => updateControl("filament1Intensity", v)}
            min={0}
            max={3}
            step={0.1}
            precision={1}
          />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Filament Layer 2
        </h3>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-neutral-400 block mb-1">
              Base Color
            </span>
            <input
              type="color"
              value={controls.filament2Color}
              onChange={(e) => updateControl("filament2Color", e.target.value)}
              className="w-full h-8 rounded bg-neutral-700 border border-neutral-600"
            />
          </div>
          <div>
            <span className="text-xs text-neutral-400 block mb-1">
              Glow Color
            </span>
            <input
              type="color"
              value={controls.filament2GlowColor}
              onChange={(e) =>
                updateControl("filament2GlowColor", e.target.value)
              }
              className="w-full h-8 rounded bg-neutral-700 border border-neutral-600"
            />
          </div>
          <DragInput
            label="Speed"
            value={controls.filament2Speed}
            onChange={(v) => updateControl("filament2Speed", v)}
            min={0}
            max={2}
            step={0.05}
            precision={2}
          />
          <DragInput
            label="Intensity"
            value={controls.filament2Intensity}
            onChange={(v) => updateControl("filament2Intensity", v)}
            min={0}
            max={3}
            step={0.1}
            precision={1}
          />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Core
        </h3>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-neutral-400 block mb-1">Color</span>
            <input
              type="color"
              value={controls.coreColor}
              onChange={(e) => updateControl("coreColor", e.target.value)}
              className="w-full h-8 rounded bg-neutral-700 border border-neutral-600"
            />
          </div>
          <DragInput
            label="Intensity"
            value={controls.coreIntensity}
            onChange={(v) => updateControl("coreIntensity", v)}
            min={0}
            max={3}
            step={0.1}
            precision={1}
          />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Stars
        </h3>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-neutral-400 block mb-1">Color</span>
            <input
              type="color"
              value={controls.starsColor}
              onChange={(e) => updateControl("starsColor", e.target.value)}
              className="w-full h-8 rounded bg-neutral-700 border border-neutral-600"
            />
          </div>
          <DragInput
            label="Intensity"
            value={controls.starsIntensity}
            onChange={(v) => updateControl("starsIntensity", v)}
            min={0}
            max={3}
            step={0.1}
            precision={1}
          />
          <DragInput
            label="Density"
            value={controls.starsDensity}
            onChange={(v) => updateControl("starsDensity", v)}
            min={10}
            max={200}
            step={5}
            precision={0}
          />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Post-Processing
        </h3>
        <div className="space-y-2">
          <DragInput
            label="Exposure"
            value={controls.exposure}
            onChange={(v) => updateControl("exposure", v)}
            min={0.1}
            max={3}
            step={0.1}
            precision={1}
          />
          <DragInput
            label="Gamma"
            value={controls.gamma}
            onChange={(v) => updateControl("gamma", v)}
            min={0.4}
            max={2.2}
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
                    checked={controls.audioAffectsExpansion}
                    onChange={(e) =>
                      updateControl("audioAffectsExpansion", e.target.checked)
                    }
                    className="rounded bg-neutral-700 border-neutral-600"
                  />
                  <span>Affects Expansion</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={controls.audioAffectsIntensity}
                    onChange={(e) =>
                      updateControl("audioAffectsIntensity", e.target.checked)
                    }
                    className="rounded bg-neutral-700 border-neutral-600"
                  />
                  <span>Affects Intensity</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={controls.audioAffectsCore}
                    onChange={(e) =>
                      updateControl("audioAffectsCore", e.target.checked)
                    }
                    className="rounded bg-neutral-700 border-neutral-600"
                  />
                  <span>Affects Core</span>
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
