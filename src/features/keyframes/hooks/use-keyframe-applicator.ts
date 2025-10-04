import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { Color } from "three";
import { currentTimeAtom } from "@/features/audio/state";
import { keyframesAtom, updateObjectAtom } from "@/features/scene/state";
import type { Keyframe } from "@/features/scene/types";
import { applyEasing } from "@/features/timeline/easing";

/**
 * Applies keyframe values to objects based on current time
 */
export function useKeyframeApplicator() {
  const keyframes = useAtomValue(keyframesAtom);
  const currentTime = useAtomValue(currentTimeAtom);
  const updateObject = useSetAtom(updateObjectAtom);

  const groupedKeyframes = useMemo(() => {
    if (keyframes.length === 0) {
      return [] as Array<{
        objectId: string;
        property: string;
        keyframes: Keyframe[];
      }>;
    }

    const groups = new Map<string, Keyframe[]>();

    for (const keyframe of keyframes) {
      const key = `${keyframe.objectId}:${keyframe.property}`;
      const existing = groups.get(key);
      if (existing) {
        existing.push(keyframe);
      } else {
        groups.set(key, [keyframe]);
      }
    }

    const result: Array<{
      objectId: string;
      property: string;
      keyframes: Keyframe[];
    }> = [];

    for (const [key, values] of groups.entries()) {
      values.sort((a, b) => a.time - b.time);
      const [objectId, property] = key.split(":");
      result.push({ objectId, property, keyframes: values });
    }

    return result;
  }, [keyframes]);

  useEffect(() => {
    if (groupedKeyframes.length === 0) {
      return;
    }

    for (const {
      objectId,
      property,
      keyframes: keyframesForProperty,
    } of groupedKeyframes) {
      const [prevKf, nextKf] = findBoundingKeyframes(
        keyframesForProperty,
        currentTime,
      );

      if (!prevKf && !nextKf) {
        continue;
      }

      let value: any;
      if (!nextKf) {
        value = prevKf!.value;
      } else if (!prevKf) {
        value = nextKf.value;
      } else {
        // Calculate linear interpolation factor
        const t = (currentTime - prevKf.time) / (nextKf.time - prevKf.time);
        
        // Apply easing function from the next keyframe
        const easedT = applyEasing(t, nextKf.ease);
        
        value = interpolateValue(prevKf.value, nextKf.value, easedT, property);
      }

      applyPropertyValue(objectId, property, value, updateObject);
    }
  }, [groupedKeyframes, currentTime, updateObject]);
}

function findBoundingKeyframes(
  keyframes: Keyframe[],
  time: number,
): [Keyframe | null, Keyframe | null] {
  if (keyframes.length === 0) {
    return [null, null];
  }

  const lastIndex = keyframes.length - 1;

  if (time <= keyframes[0].time) {
    return [null, keyframes[0]];
  }

  if (time >= keyframes[lastIndex].time) {
    return [keyframes[lastIndex], null];
  }

  let low = 0;
  let high = lastIndex;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midTime = keyframes[mid].time;

    if (midTime === time) {
      return [keyframes[mid], keyframes[mid + 1] ?? null];
    }

    if (midTime < time) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return [keyframes[low - 1] ?? null, keyframes[low] ?? null];
}

function interpolateValue(a: any, b: any, t: number, property?: string): any {
  if (a === null || b === null) {
    return a; // Hold previous value until next keyframe
  }
  if (typeof a === "number" && typeof b === "number") {
    return a + (b - a) * t;
  }
  if (typeof a === "boolean" && typeof b === "boolean") {
    return a; // Hold previous value until next keyframe (no mid-point switching)
  }
  if (typeof a === "object" && typeof b === "object" && "x" in a && "x" in b) {
    // Vector3
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
    };
  }
  // Check if it's a color string (hex or other CSS color)
  // Skip color interpolation for non-color string properties like activeAnimation
  if (typeof a === "string" && typeof b === "string" && property !== "activeAnimation") {
    try {
      const colorA = new Color(a);
      const colorB = new Color(b);

      // Convert to HSL for smooth color interpolation
      const hslA = { h: 0, s: 0, l: 0 };
      const hslB = { h: 0, s: 0, l: 0 };
      colorA.getHSL(hslA);
      colorB.getHSL(hslB);

      // Interpolate in HSL space
      // Handle hue wrapping for shortest path
      let hDiff = hslB.h - hslA.h;
      if (hDiff > 0.5) hDiff -= 1;
      if (hDiff < -0.5) hDiff += 1;

      const h = (hslA.h + hDiff * t) % 1;
      const s = hslA.s + (hslB.s - hslA.s) * t;
      const l = hslA.l + (hslB.l - hslA.l) * t;

      // Convert back to hex string
      const resultColor = new Color().setHSL(h, s, l);
      return `#${resultColor.getHexString()}`;
    } catch (_e) {
      // If color parsing fails, fall back to snap behavior
      return a;
    }
  }
  // For discrete values like activeAnimation, hold the previous value
  // until we reach the next keyframe (no mid-point switching)
  return a;
}

function applyPropertyValue(
  objectId: string,
  property: string,
  value: any,
  updateObject: any,
) {
  const parts = property.split(".");

  if (parts[0] === "transform") {
    // e.g., "transform.position.x"
    const axis = parts[1] as "position" | "rotation" | "scale";
    const component = parts[2] as "x" | "y" | "z";

    updateObject(objectId, {
      transform: {
        [axis]: {
          [component]: value,
        },
      },
    });
  } else if (parts[0] === "material") {
    // e.g., "material.color"
    const key = parts[1];
    updateObject(objectId, {
      material: {
        [key]: value,
      },
    });
  } else if (property === "activeAnimation") {
    updateObject(objectId, {
      activeAnimation: value === "" ? null : value,
    });
  } else {
    // Direct property like "isActive"
    updateObject(objectId, {
      [property]: value,
    });
  }
}
