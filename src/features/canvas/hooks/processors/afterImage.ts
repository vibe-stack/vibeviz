import { afterImage } from "three/addons/tsl/display/AfterImageNode.js";
import type { PostprocessorObject } from "@/features/scene/types";

export function applyAfterImage(
  outputNode: any,
  processor: PostprocessorObject,
) {
  const damp = (processor.controls.damp as number) ?? 0.8;

  // Apply afterimage effect with damp value
  const afterImageEffect = afterImage(outputNode, damp);

  return {
    effectNode: {
      damp: afterImageEffect.damp,
      afterImageNode: afterImageEffect,
    },
    outputNode: afterImageEffect,
  };
}

export function updateAfterImage(
  effectData: any,
  processor: PostprocessorObject,
) {
  const damp = (processor.controls.damp as number) ?? 0.8;

  if (effectData.damp && effectData.damp.value !== undefined) {
    effectData.damp.value = damp;
  }
}
