import { atom } from "jotai";
import { nanoid } from "nanoid";
import type { Keyframe, SceneObject } from "./types";

export const sceneObjectsAtom = atom<SceneObject[]>([]);
export const selectedObjectIdsAtom = atom<string[]>([]);
export const keyframesAtom = atom<Keyframe[]>([]);

// Derived atom for selected objects
export const selectedObjectsAtom = atom((get) => {
  const objects = get(sceneObjectsAtom);
  const selectedIds = get(selectedObjectIdsAtom);
  return objects.filter((obj) => selectedIds.includes(obj.id));
});

// Helper atoms for mutations
export const addObjectAtom = atom(null, (get, set, object: SceneObject) => {
  const objects = get(sceneObjectsAtom);
  set(sceneObjectsAtom, [...objects, object]);
});

export const removeObjectAtom = atom(null, (get, set, objectId: string) => {
  const objects = get(sceneObjectsAtom);
  set(
    sceneObjectsAtom,
    objects.filter((obj) => obj.id !== objectId),
  );
  // Also remove keyframes for this object
  const keyframes = get(keyframesAtom);
  set(
    keyframesAtom,
    keyframes.filter((kf) => kf.objectId !== objectId),
  );
});

export const updateObjectAtom = atom(
  null,
  (get, set, objectId: string, updates: Partial<SceneObject>) => {
    const objects = get(sceneObjectsAtom);
    set(
      sceneObjectsAtom,
      objects.map((obj) => {
        if (obj.id !== objectId) return obj;

        // Deep merge for nested properties
        const updated = { ...obj } as any;
        const updatesAny = updates as any;

        // Handle transform (all objects except postprocessor)
        if (updatesAny.transform && "transform" in obj) {
          updated.transform = {
            ...obj.transform,
            ...updatesAny.transform,
            position: {
              ...obj.transform.position,
              ...(updatesAny.transform.position || {}),
            },
            rotation: {
              ...obj.transform.rotation,
              ...(updatesAny.transform.rotation || {}),
            },
            scale: {
              ...obj.transform.scale,
              ...(updatesAny.transform.scale || {}),
            },
          };
        }

        // Handle target (cameras)
        if (updatesAny.target && "target" in obj) {
          updated.target = {
            ...obj.target,
            ...updatesAny.target,
          };
        }

        // Handle material (only primitives)
        if (updatesAny.material && "material" in obj) {
          updated.material = { ...updated.material, ...updatesAny.material };
        }

        // Merge other top-level properties
        Object.keys(updates).forEach((key) => {
          if (key !== "transform" && key !== "material" && key !== "target") {
            updated[key] = updatesAny[key];
          }
        });

        return updated as SceneObject;
      }),
    );
  },
);

export const addKeyframeAtom = atom(
  null,
  (get, set, objectId: string, property: string, time: number, value: any) => {
    const keyframes = get(keyframesAtom);
    // Check if keyframe already exists at this time for this property
    const existing = keyframes.find(
      (kf) =>
        kf.objectId === objectId &&
        kf.property === property &&
        kf.time === time,
    );

    if (existing) {
      // Update existing keyframe
      set(
        keyframesAtom,
        keyframes.map((kf) => (kf.id === existing.id ? { ...kf, value } : kf)),
      );
    } else {
      // Add new keyframe
      set(keyframesAtom, [
        ...keyframes,
        {
          id: nanoid(),
          objectId,
          property,
          time,
          value,
        },
      ]);
    }
  },
);

export const removeKeyframeAtom = atom(null, (get, set, keyframeId: string) => {
  const keyframes = get(keyframesAtom);
  set(
    keyframesAtom,
    keyframes.filter((kf) => kf.id !== keyframeId),
  );
});
