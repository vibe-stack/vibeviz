import { chromaticAberration } from "three/addons/tsl/display/ChromaticAberrationNode.js";
import { uniform } from "three/tsl";
import * as THREE from "three/webgpu";
import type { PostprocessorObject } from "@/features/scene/types";

export function applyChromaticAberration(
  outputNode: any,
  processor: PostprocessorObject,
) {
  const strength = (processor.controls.strength as number) ?? 1.5;
  const centerX = (processor.controls.centerX as number) ?? 0.5;
  const centerY = (processor.controls.centerY as number) ?? 0.5;
  const scale = (processor.controls.scale as number) ?? 1.2;

  // Create uniform nodes for dynamic updates
  const strengthUniform = uniform(strength);
  const centerUniform = uniform(new THREE.Vector2(centerX, centerY));
  const scaleUniform = uniform(scale);

  // Apply chromatic aberration effect
  const caEffect = chromaticAberration(
    outputNode,
    strengthUniform,
    centerUniform,
    scaleUniform,
  );

  return {
    effectNode: {
      strengthUniform,
      centerUniform,
      scaleUniform,
    },
    outputNode: caEffect,
  };
}

export function updateChromaticAberration(
  effectData: any,
  processor: PostprocessorObject,
) {
  const strength = (processor.controls.strength as number) ?? 1.5;
  const centerX = (processor.controls.centerX as number) ?? 0.5;
  const centerY = (processor.controls.centerY as number) ?? 0.5;
  const scale = (processor.controls.scale as number) ?? 1.2;

  if (effectData.strengthUniform) {
    effectData.strengthUniform.value = strength;
  }
  if (effectData.centerUniform) {
    effectData.centerUniform.value.x = centerX;
    effectData.centerUniform.value.y = centerY;
  }
  if (effectData.scaleUniform) {
    effectData.scaleUniform.value = scale;
  }
}
