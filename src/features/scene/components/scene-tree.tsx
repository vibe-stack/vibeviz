"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  Box,
  Camera,
  Eye,
  EyeOff,
  Layers,
  Lightbulb,
  Sparkles,
  Trash2,
  Wand2,
  Zap,
  Wind,
  Circle,
  Boxes,
} from "lucide-react";
import {
  removeObjectAtom,
  sceneObjectsAtom,
  selectedObjectIdsAtom,
  updateObjectAtom,
} from "../state";
import type { SceneObject } from "../types";

const getIcon = (object: SceneObject) => {
  switch (object.type) {
    case "primitive":
      return <Box className="w-4 h-4" />;
    case "camera":
      return <Camera className="w-4 h-4" />;
    case "shader":
      return <Sparkles className="w-4 h-4" />;
    case "waveformInstancer":
      return <Layers className="w-4 h-4" />;
    case "waveformLines":
      return <Layers className="w-4 h-4" />;
    case "light":
      return <Lightbulb className="w-4 h-4" />;
    case "postprocessor":
      return <Wand2 className="w-4 h-4" />;
    case "audioParticle":
      return <Zap className="w-4 h-4" />;
    case "dynamicParticle":
      return <Wind className="w-4 h-4" />;
    case "forceField":
      return <Circle className="w-4 h-4" />;
    case "glb":
      return <Boxes className="w-4 h-4" />;
    default:
      return <Box className="w-4 h-4" />;
  }
};

export function SceneTree() {
  const objects = useAtomValue(sceneObjectsAtom);
  const [selectedIds, setSelectedIds] = useAtom(selectedObjectIdsAtom);
  const removeObject = useSetAtom(removeObjectAtom);
  const updateObject = useSetAtom(updateObjectAtom);

  const handleSelect = (objectId: string, multi: boolean) => {
    if (multi) {
      setSelectedIds((prev) =>
        prev.includes(objectId)
          ? prev.filter((id) => id !== objectId)
          : [...prev, objectId],
      );
    } else {
      // If clicking on already selected object, deselect it
      setSelectedIds((prev) => 
        prev.length === 1 && prev[0] === objectId ? [] : [objectId]
      );
    }
  };

  const toggleVisibility = (object: SceneObject) => {
    if (object.type === "postprocessor") {
      updateObject(object.id, { enabled: !object.enabled });
    } else {
      updateObject(object.id, { visible: !object.visible });
    }
  };

  const isVisible = (object: SceneObject) => {
    return object.type === "postprocessor" ? object.enabled : object.visible;
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-200">Scene</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {objects.length === 0 && (
          <p className="text-xs text-neutral-500 p-2 text-center">
            No objects in scene
          </p>
        )}
        {objects.map((object) => (
          <div
            key={object.id}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
              selectedIds.includes(object.id)
                ? "bg-emerald-500/20 text-emerald-200"
                : "hover:bg-neutral-800/50 text-neutral-300"
            }`}
            onClick={(e) => handleSelect(object.id, e.metaKey || e.ctrlKey)}
          >
            <span className="text-neutral-400">{getIcon(object)}</span>
            <span className="flex-1 text-sm truncate">{object.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(object);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-700 rounded"
            >
              {isVisible(object) ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3 text-neutral-600" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeObject(object.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
