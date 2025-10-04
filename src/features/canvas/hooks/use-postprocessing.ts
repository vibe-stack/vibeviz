"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { pass } from "three/tsl";
import * as THREE from "three/webgpu";
import type { PostprocessorObject } from "@/features/scene/types";
import { processors } from "./processors";

export function usePostprocessing(postprocessors: PostprocessorObject[]) {
  const { gl, scene, camera, size } = useThree();
  const postRef = useRef<THREE.PostProcessing | null>(null);
  const effectsRef = useRef<Map<string, any>>(new Map());
  const latestPostprocessorsRef = useRef(postprocessors);
  const pipelineSignature = useMemo(
    () =>
      postprocessors
        .map(
          (processor, index) =>
            `${index}:${processor.id}:${processor.effectType}:${processor.enabled ? "1" : "0"}`,
        )
        .join("|"),
    [postprocessors],
  );

  useEffect(() => {
    latestPostprocessorsRef.current = postprocessors;
  }, [postprocessors]);

  // Initialize/rebuild postprocessing chain when postprocessors change
  // biome-ignore lint/correctness/useExhaustiveDependencies(pipelineSignature): suppress dependency analysis warning
  useEffect(() => {
    function dispose() {
      if (
        postRef.current &&
        typeof (postRef.current as any).dispose === "function"
      ) {
        try {
          (postRef.current as any).dispose();
        } catch (e) {
          console.warn("Error disposing postprocessing:", e);
        }
      }
      postRef.current = null;
      effectsRef.current.clear();
    }

    // Only enable if we have enabled postprocessors and WebGPU renderer
    const enabledProcessors = latestPostprocessorsRef.current.filter(
      (p) => p.enabled,
    );
    if (!(gl as any)?.isWebGPURenderer || enabledProcessors.length === 0) {
      dispose();
      return;
    }

    try {
      const post = new (THREE as any).PostProcessing(gl as any);
      const scenePass = pass(scene as any, camera as any);
      let outputNode = (scenePass as any).getTextureNode("output");

      // Apply effects in order
      for (const processor of enabledProcessors) {
        const processorImpl = processors[processor.effectType];

        if (!processorImpl) {
          console.warn(`Unknown postprocessor type: ${processor.effectType}`);
          continue;
        }

        const result = processorImpl.apply(outputNode, processor);
        effectsRef.current.set(processor.id, result.effectNode);
        outputNode = result.outputNode;
      }

      post.outputNode = outputNode;
      postRef.current = post;
    } catch (e) {
      console.warn("Postprocessing init failed:", e);
      dispose();
    }

    return dispose;
  }, [gl, scene, camera, pipelineSignature]);

  useEffect(() => {
    if (!postRef.current) return;
    if (typeof (postRef.current as any).setSize === "function") {
      try {
        (postRef.current as any).setSize(size.width, size.height);
      } catch (e) {
        console.warn("Postprocessing resize failed:", e);
      }
    }
  }, [size.width, size.height]);

  // Update effect parameters when controls change
  useEffect(() => {
    postprocessors.forEach((processor) => {
      if (!processor.enabled) return;

      const effectData = effectsRef.current.get(processor.id);
      if (!effectData) return;

      const processorImpl = processors[processor.effectType];
      if (processorImpl) {
        processorImpl.update(effectData, processor);
      }
    });
  }, [postprocessors]);

  return postRef;
}
