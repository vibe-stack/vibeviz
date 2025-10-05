"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Diamond, Upload } from "lucide-react";
import { useRef } from "react";
import { currentTimeAtom } from "@/features/audio/state";
import { addKeyframeAtom, updateObjectAtom } from "@/features/scene/state";
import type { GLBObject } from "@/features/scene/types";
import { TransformSection } from "./transform-section";

type GLBInspectorProps = {
  object: GLBObject;
};

export function GLBInspector({ object }: GLBInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);
  const addKeyframe = useSetAtom(addKeyframeAtom);
  const currentTime = useAtomValue(currentTimeAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a local URL for the file
    const url = URL.createObjectURL(file);

    updateObject(object.id, {
      url,
      // Reset animations when loading a new file
      availableAnimations: [],
      activeAnimation: null,
    });
  };

  const handleAnimationChange = (animationName: string) => {
    updateObject(object.id, {
      activeAnimation: animationName === "" ? null : animationName,
    });
  };

  const handleKeyframeAnimation = () => {
    addKeyframe(
      object.id,
      "activeAnimation",
      currentTime,
      object.activeAnimation ?? null,
    );
  };

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
          GLB Model
        </h3>

        {/* File Upload */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-400">Model File</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-3 py-2 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-300 flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            {object.url ? "Change Model" : "Upload GLB File"}
          </button>
          {object.url && (
            <p className="text-xs text-neutral-500 truncate">Model loaded</p>
          )}
        </div>

        {/* Animation Selection */}
        {object.availableAnimations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-400">Animation</p>
              <button
                type="button"
                onClick={handleKeyframeAnimation}
                className="p-1 hover:bg-neutral-700 rounded transition-colors"
                title="Add keyframe"
              >
                <Diamond className="w-3 h-3 text-purple-400" />
              </button>
            </div>
            <select
              value={object.activeAnimation ?? ""}
              onChange={(e) => handleAnimationChange(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-300"
            >
              <option value="">None</option>
              {object.availableAnimations.map((animName) => (
                <option key={animName} value={animName}>
                  {animName}
                </option>
              ))}
            </select>
            {object.activeAnimation && (
              <p className="text-xs text-emerald-500">
                Playing: {object.activeAnimation}
              </p>
            )}
          </div>
        )}

        {object.availableAnimations.length === 0 && object.url && (
          <p className="text-xs text-neutral-500">
            No animations found in this model
          </p>
        )}
      </div>
    </div>
  );
}
