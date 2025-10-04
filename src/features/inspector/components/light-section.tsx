"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Diamond } from "lucide-react";
import { DragInput } from "@/components/ui/drag-input";
import { currentTimeAtom } from "@/features/audio/state";
import { addKeyframeAtom, updateObjectAtom } from "@/features/scene/state";
import type { LightObject } from "@/features/scene/types";

type LightSectionProps = {
  objectId: string;
  light: LightObject;
};

export function LightSection({ objectId, light }: LightSectionProps) {
  const updateObject = useSetAtom(updateObjectAtom);
  const addKeyframe = useSetAtom(addKeyframeAtom);
  const currentTime = useAtomValue(currentTimeAtom);

  const handleColorChange = (color: string) => {
    updateObject(objectId, { color } as Partial<LightObject>);
  };

  const handleIntensityChange = (intensity: number) => {
    updateObject(objectId, { intensity } as Partial<LightObject>);
  };

  const handleDistanceChange = (distance: number) => {
    updateObject(objectId, { distance } as Partial<LightObject>);
  };

  const handleDecayChange = (decay: number) => {
    updateObject(objectId, { decay } as Partial<LightObject>);
  };

  const handleAngleChange = (angle: number) => {
    updateObject(objectId, { angle } as Partial<LightObject>);
  };

  const handlePenumbraChange = (penumbra: number) => {
    updateObject(objectId, { penumbra } as Partial<LightObject>);
  };

  const handleCastShadowChange = (castShadow: boolean) => {
    updateObject(objectId, { castShadow } as Partial<LightObject>);
  };

  const handleTargetChange = (component: "x" | "y" | "z", value: number) => {
    updateObject(objectId, {
      target: {
        ...(light.target || { x: 0, y: 0, z: 0 }),
        [component]: value,
      },
    } as Partial<LightObject>);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-neutral-400">Light Type</p>
        <p className="text-sm text-neutral-200 capitalize">{light.lightType}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-neutral-400">Color</p>
          <button
            type="button"
            onClick={() =>
              addKeyframe(objectId, "color", currentTime, light.color)
            }
            className="p-1 rounded hover:bg-neutral-800 transition-colors"
            title="Add keyframe"
          >
            <Diamond className="w-3 h-3 text-emerald-400" />
          </button>
        </div>
        <input
          type="color"
          value={light.color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-full h-8 rounded cursor-pointer bg-neutral-800 border border-neutral-700"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-neutral-400">Intensity</p>
          <button
            type="button"
            onClick={() =>
              addKeyframe(objectId, "intensity", currentTime, light.intensity)
            }
            className="p-1 rounded hover:bg-neutral-800 transition-colors"
            title="Add keyframe"
          >
            <Diamond className="w-3 h-3 text-emerald-400" />
          </button>
        </div>
        <DragInput
          value={light.intensity}
          onChange={handleIntensityChange}
          min={0}
          max={10}
          step={0.1}
        />
      </div>

      {/* Point and Spot lights */}
      {(light.lightType === "point" || light.lightType === "spot") && (
        <>
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-400">Distance</p>
            <DragInput
              value={light.distance || 10}
              onChange={handleDistanceChange}
              min={0}
              max={100}
              step={0.5}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-400">Decay</p>
            <DragInput
              value={light.decay || 2}
              onChange={handleDecayChange}
              min={0}
              max={5}
              step={0.1}
            />
          </div>
        </>
      )}

      {/* Spot light specific */}
      {light.lightType === "spot" && (
        <>
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-400">
              Angle (radians)
            </p>
            <DragInput
              value={light.angle || Math.PI / 6}
              onChange={handleAngleChange}
              min={0}
              max={Math.PI / 2}
              step={0.01}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-400">Penumbra</p>
            <DragInput
              value={light.penumbra || 0.1}
              onChange={handlePenumbraChange}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-400">Target</p>
            <div className="grid grid-cols-3 gap-2">
              {(["x", "y", "z"] as const).map((component) => (
                <div key={component} className="flex flex-col gap-1">
                  <label
                    htmlFor={`target-${component}`}
                    className="text-[10px] text-neutral-500 uppercase"
                  >
                    {component}
                  </label>
                  <DragInput
                    value={light.target?.[component] || 0}
                    onChange={(val) => handleTargetChange(component, val)}
                    step={0.1}
                    compact
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Shadow casting */}
      {(light.lightType === "directional" ||
        light.lightType === "point" ||
        light.lightType === "spot") && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-neutral-400">Cast Shadow</p>
          <input
            type="checkbox"
            checked={light.castShadow || false}
            onChange={(e) => handleCastShadowChange(e.target.checked)}
            className="rounded border-neutral-700 bg-neutral-800 text-emerald-600 focus:ring-emerald-500"
          />
        </div>
      )}
    </div>
  );
}
