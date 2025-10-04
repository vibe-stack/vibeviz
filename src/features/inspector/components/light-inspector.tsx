"use client";

import type { LightObject } from "@/features/scene/types";
import { LightSection } from "./light-section";
import { TransformSection } from "./transform-section";

type LightInspectorProps = {
  object: LightObject;
};

export function LightInspector({ object }: LightInspectorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-300 border-b border-neutral-800 pb-2">
          Transform
        </h3>
        <TransformSection objectId={object.id} transform={object.transform} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-300 border-b border-neutral-800 pb-2">
          Light Properties
        </h3>
        <LightSection objectId={object.id} light={object} />
      </div>
    </div>
  );
}
