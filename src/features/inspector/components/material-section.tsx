"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Diamond } from "lucide-react";
import { DragInput } from "@/components/ui/drag-input";
import { currentTimeAtom } from "@/features/audio/state";
import { addKeyframeAtom, updateObjectAtom } from "@/features/scene/state";
import type { Material } from "@/features/scene/types";

type MaterialSectionProps = {
  objectId: string;
  material: Material;
};

export function MaterialSection({ objectId, material }: MaterialSectionProps) {
  const updateObject = useSetAtom(updateObjectAtom);
  const addKeyframe = useSetAtom(addKeyframeAtom);
  const currentTime = useAtomValue(currentTimeAtom);

  const handleMaterialChange = (key: keyof Material, value: any) => {
    updateObject(objectId, {
      material: {
        ...material,
        [key]: value,
      },
    });
  };

  const handleKeyframe = (key: keyof Material) => {
    addKeyframe(objectId, `material.${key}`, currentTime, material[key]);
  };

  return (
    <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
      <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
        Material
      </h3>

      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400 w-20">Color</span>
        <input
          type="color"
          value={material.color}
          onChange={(e) => handleMaterialChange("color", e.target.value)}
          className="h-6 w-12 rounded cursor-pointer"
        />
        <button
          type="button"
          onClick={() => handleKeyframe("color")}
          className="p-1 hover:bg-neutral-700 rounded transition-colors ml-auto"
          title="Add keyframe"
        >
          <Diamond className="w-3 h-3 text-emerald-400" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400 w-20">Roughness</span>
        <DragInput
          value={material.roughness}
          onChange={(v) => handleMaterialChange("roughness", v)}
          step={0.01}
          precision={2}
          min={0}
          max={1}
          compact
        />
        <button
          type="button"
          onClick={() => handleKeyframe("roughness")}
          className="p-1 hover:bg-neutral-700 rounded transition-colors"
          title="Add keyframe"
        >
          <Diamond className="w-3 h-3 text-emerald-400" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400 w-20">Metalness</span>
        <DragInput
          value={material.metalness}
          onChange={(v) => handleMaterialChange("metalness", v)}
          step={0.01}
          precision={2}
          min={0}
          max={1}
          compact
        />
        <button
          type="button"
          onClick={() => handleKeyframe("metalness")}
          className="p-1 hover:bg-neutral-700 rounded transition-colors"
          title="Add keyframe"
        >
          <Diamond className="w-3 h-3 text-emerald-400" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400 w-20">Emissive</span>
        <input
          type="color"
          value={material.emissiveColor}
          onChange={(e) =>
            handleMaterialChange("emissiveColor", e.target.value)
          }
          className="h-6 w-12 rounded cursor-pointer"
        />
        <button
          type="button"
          onClick={() => handleKeyframe("emissiveColor")}
          className="p-1 hover:bg-neutral-700 rounded transition-colors ml-auto"
          title="Add keyframe"
        >
          <Diamond className="w-3 h-3 text-emerald-400" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400 w-20">Intensity</span>
        <DragInput
          value={material.emissiveIntensity}
          onChange={(v) => handleMaterialChange("emissiveIntensity", v)}
          step={0.1}
          precision={2}
          min={0}
          max={10}
          compact
        />
        <button
          type="button"
          onClick={() => handleKeyframe("emissiveIntensity")}
          className="p-1 hover:bg-neutral-700 rounded transition-colors"
          title="Add keyframe"
        >
          <Diamond className="w-3 h-3 text-emerald-400" />
        </button>
      </div>
    </div>
  );
}
