"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { PostprocessorObject } from "@/features/scene/types";
import { usePostprocessing } from "../hooks/use-postprocessing";

type PostprocessingRendererProps = {
  postprocessors: PostprocessorObject[];
};

export function PostprocessingRenderer({
  postprocessors,
}: PostprocessingRendererProps) {
  const { gl, scene, camera } = useThree();
  const postRef = usePostprocessing(postprocessors);

  // Render each frame
  useFrame(() => {
    if (postRef.current) {
      // Use postprocessing chain
      try {
        postRef.current.render();
      } catch (e) {
        console.warn("Error rendering postprocessing:", e);
      }
    } else {
      // Fallback to manual render when no postprocessing
      // This is needed for WebGPU renderer
      try {
        gl.render(scene, camera);
      } catch (_e) {
        // Ignore render errors
      }
    }
  }, 1); // Priority 1 to render after default R3F render

  return null;
}
