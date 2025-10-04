"use client";

import { DragInput } from "@/components/ui/drag-input";
import type { BlendMode } from "@/features/shaders/types";

type BlendModeSectionProps = {
  blendMode: BlendMode;
  opacity: number;
  onChange: (blendMode: BlendMode) => void;
  onOpacityChange: (opacity: number) => void;
};

export function BlendModeSection({
  blendMode,
  opacity,
  onChange,
  onOpacityChange,
}: BlendModeSectionProps) {
  return (
    <div className="p-3 rounded-lg bg-neutral-800/30">
      <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
        Blending
      </h3>
      <div className="space-y-2">
        <div>
          <label
            htmlFor="blend-mode"
            className="text-xs text-neutral-400 block mb-1"
          >
            Blend Mode
          </label>
          <select
            id="blend-mode"
            value={blendMode}
            onChange={(e) => onChange(e.target.value as BlendMode)}
            className="w-full px-2 py-1 text-sm rounded bg-neutral-700 border border-neutral-600 text-neutral-200"
          >
            <option value="none">None (No Blending)</option>
            <option value="normal">Normal</option>
            <option value="additive">Additive (Screen/Brighten)</option>
            <option value="multiply">Multiply (Darken)</option>
            <option value="subtractive">Subtractive</option>
            <option value="custom">Custom</option>
          </select>
          <p className="text-xs text-neutral-500 mt-1">
            {blendMode === "none" &&
              "Disable blending - shader is fully opaque"}
            {blendMode === "normal" &&
              "Standard alpha blending with depth testing"}
            {blendMode === "additive" &&
              "Adds colors together - perfect for glowing/light effects"}
            {blendMode === "multiply" &&
              "Multiplies colors - creates darkening/shadow effect"}
            {blendMode === "subtractive" &&
              "Subtracts colors - creates inverse/negative effect"}
            {blendMode === "custom" && "Custom blending - advanced usage"}
          </p>
        </div>

        <DragInput
          label="Opacity"
          value={opacity}
          onChange={onOpacityChange}
          min={0}
          max={1}
          step={0.01}
          precision={2}
        />
      </div>
    </div>
  );
}
