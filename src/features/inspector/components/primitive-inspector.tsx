"use client";

import { useSetAtom } from "jotai";
import { DragInput } from "@/components/ui/drag-input";
import { updateObjectAtom } from "@/features/scene/state";
import type { PrimitiveObject } from "@/features/scene/types";
import { MaterialSection } from "./material-section";
import { TransformSection } from "./transform-section";

type PrimitiveInspectorProps = {
  object: PrimitiveObject;
};

export function PrimitiveInspector({ object }: PrimitiveInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);

  const handleCylinderTopRadiusChange = (value: number) => {
    updateObject(object.id, {
      cylinderTopRadius: value,
    } as Partial<PrimitiveObject>);
  };

  const handleCylinderBottomRadiusChange = (value: number) => {
    updateObject(object.id, {
      cylinderBottomRadius: value,
    } as Partial<PrimitiveObject>);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-300 border-b border-neutral-800 pb-2">
          Transform
        </h3>
        <TransformSection objectId={object.id} transform={object.transform} />
      </div>

      {object.primitiveType === "cylinder" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-300 border-b border-neutral-800 pb-2">
            Cylinder Properties
          </h3>
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-400">Top Radius</p>
            <DragInput
              value={object.cylinderTopRadius ?? 0.5}
              onChange={handleCylinderTopRadiusChange}
              min={0}
              max={2}
              step={0.05}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-400">
              Bottom Radius
            </p>
            <DragInput
              value={object.cylinderBottomRadius ?? 0.5}
              onChange={handleCylinderBottomRadiusChange}
              min={0}
              max={2}
              step={0.05}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-300 border-b border-neutral-800 pb-2">
          Material
        </h3>
        <MaterialSection objectId={object.id} material={object.material} />
      </div>
    </div>
  );
}
