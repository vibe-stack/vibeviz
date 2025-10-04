import { bloom as bloomNode } from "three/addons/tsl/display/BloomNode.js";
import type { PostprocessorObject } from "@/features/scene/types";

export function applyBloom(outputNode: any, processor: PostprocessorObject) {
  const bloomEffect = bloomNode(outputNode);

  // Set parameters from controls
  const threshold = (processor.controls.threshold as number) ?? 0.85;
  const strength = (processor.controls.strength as number) ?? 0.5;
  const radius = (processor.controls.radius as number) ?? 0.5;

  if (bloomEffect.threshold) bloomEffect.threshold.value = threshold;
  if (bloomEffect.strength) bloomEffect.strength.value = strength;
  if (bloomEffect.radius)
    bloomEffect.radius.value = Math.max(0, Math.min(3, radius));

  return {
    effectNode: bloomEffect,
    outputNode: (outputNode as any).add(bloomEffect),
  };
}

export function updateBloom(effectData: any, processor: PostprocessorObject) {
  const threshold = (processor.controls.threshold as number) ?? 0.85;
  const strength = (processor.controls.strength as number) ?? 0.5;
  const radius = (processor.controls.radius as number) ?? 0.5;

  if (effectData.threshold) effectData.threshold.value = threshold;
  if (effectData.strength) effectData.strength.value = strength;
  if (effectData.radius)
    effectData.radius.value = Math.max(0, Math.min(3, radius));
}
