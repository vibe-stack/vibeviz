import { atom } from "jotai";

// Timeline zoom level (pixels per second)
export const timelineZoomAtom = atom<number>(100);

// Selected keyframe IDs
export const selectedKeyframeIdsAtom = atom<string[]>([]);

// Keyframe snapping enabled
export const keyframeSnapEnabledAtom = atom<boolean>(true);

// Keyframe snap threshold in seconds
export const keyframeSnapThresholdAtom = atom<number>(0.1);

// Audio volume (0-1)
export const audioVolumeAtom = atom<number>(1);

// Collapsed property groups for hierarchical view
// Map of objectId -> Set of collapsed property paths
export const collapsedPropertyGroupsAtom = atom<Record<string, Set<string>>>(
  {},
);

// Helper to toggle property group collapse
export const togglePropertyGroupAtom = atom(
  null,
  (get, set, objectId: string, propertyPath: string) => {
    const collapsed = get(collapsedPropertyGroupsAtom);
    const objectCollapsed = collapsed[objectId] || new Set();
    const newObjectCollapsed = new Set(objectCollapsed);

    if (newObjectCollapsed.has(propertyPath)) {
      newObjectCollapsed.delete(propertyPath);
    } else {
      newObjectCollapsed.add(propertyPath);
    }

    set(collapsedPropertyGroupsAtom, {
      ...collapsed,
      [objectId]: newObjectCollapsed,
    });
  },
);
