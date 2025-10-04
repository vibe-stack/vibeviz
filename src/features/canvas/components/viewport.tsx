"use client";

import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three/webgpu";
import { sceneObjectsAtom, selectedObjectIdsAtom } from "@/features/scene/state";
import type { CameraObject, PostprocessorObject } from "@/features/scene/types";
import { PostprocessingRenderer, SceneRenderer } from "./index";

interface ViewportProps {
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

function CanvasCapture({ onCanvasReady }: { onCanvasReady?: (canvas: HTMLCanvasElement) => void }) {
  const { gl } = useThree();

  useEffect(() => {
    if (onCanvasReady && gl.domElement) {
      onCanvasReady(gl.domElement);
    }
  }, [gl.domElement, onCanvasReady]);

  return null;
}

export function Viewport({ onCanvasReady }: ViewportProps) {
  const objects = useAtomValue(sceneObjectsAtom);
  const setSelectedIds = useSetAtom(selectedObjectIdsAtom);
  const [dpr, setDpr] = useState(1.5);
  const postprocessors = useMemo(
    () =>
      objects.filter(
        (obj): obj is PostprocessorObject => obj.type === "postprocessor",
      ),
    [objects],
  );

  // Check if there's an active custom camera
  const hasActiveCamera = useMemo(
    () =>
      objects.some(
        (obj): obj is CameraObject => obj.type === "camera" && obj.isActive,
      ),
    [objects],
  );

  return (
    <div className="relative w-full h-full rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
      <Canvas
        dpr={dpr}
        frameloop="always"
        onPointerMissed={() => setSelectedIds([])}
        gl={async (props) => {
          type RendererParameters = ConstructorParameters<
            typeof THREE.WebGPURenderer
          >[0];
          const renderer = new THREE.WebGPURenderer(
            props as RendererParameters,
          );
          await renderer.init();
          return renderer;
        }}
        camera={{ position: [4, 3, 5], fov: 50 }}
      >
        <color attach="background" args={["#171717"]} />
        <PerformanceMonitor
          onIncline={() => setDpr(2)}
          onDecline={() => setDpr(1)}
        >
          {/* <ambientLight intensity={0.3} /> */}
          {/* <pointLight position={[10, 10, 10]} intensity={1} /> */}
          <SceneRenderer objects={objects} />
          {!hasActiveCamera && <OrbitControls />}
          <PostprocessingRenderer postprocessors={postprocessors} />
          <CanvasCapture onCanvasReady={onCanvasReady} />
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
