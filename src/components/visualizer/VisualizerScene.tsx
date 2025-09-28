"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { OrbitControls, Environment } from "@react-three/drei";
import { Canvas, type ThreeToJSXElements, extend } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import { useSnapshot } from "valtio";
import { visualizerStore } from "@/state/visualizer-store";
import { AnimatedShaderRenderer } from "./AnimatedShaderRenderer";
import { CircularVisualizer } from "./CircularVisualizer";
import { ParticleSystem } from "./particles/ParticleSystem";
import { ShapesVisualizer } from "./shapes/ShapesVisualizer";
import WorldEffects from "./effects";

declare module "@react-three/fiber" {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> { }
}

extend(THREE as any);

interface VisualizerSceneProps {
  getFrequencyData: () => Uint8Array;
}

export interface VisualizerSceneRef {
  getCanvas: () => HTMLCanvasElement | null;
}

export const VisualizerScene = forwardRef<VisualizerSceneRef, VisualizerSceneProps>(({ getFrequencyData }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizer = useSnapshot(visualizerStore);
  const { background, fog, lights } = visualizer.world;

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  const toArray = (vector: { x: number; y: number; z: number }): [number, number, number] => [vector.x, vector.y, vector.z];

  return (
    <div className="h-full w-full">
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 7.5, 12], fov: 52 }}
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer(props as any)
          await renderer.init()
          return renderer
        }}
        className="bg-zinc-950"
      >
        <color attach="background" args={[background]} />
        {fog.enabled ? (
          <fog attach="fog" args={[fog.color, fog.near, fog.far]} />
        ) : null}

        {lights.ambient.enabled ? (
          <ambientLight
            intensity={lights.ambient.intensity}
            color={lights.ambient.color}
          />
        ) : null}

        {(["key", "fill", "rim"] as const).map((key) => {
          const light = lights[key];
          if (!light.enabled) return null;
          return (
            <directionalLight
              key={key}
              position={toArray(light.position)}
              intensity={light.intensity}
              color={light.color}
              castShadow={light.castShadow}
              shadow-bias={light.shadowBias}
              shadow-radius={light.shadowRadius}
            />
          );
        })}

        <ShapesVisualizer
          getFrequencyData={getFrequencyData}
          settings={visualizer.shapes}
        />

        {visualizer.bars.enabled && (
          <CircularVisualizer
            getFrequencyData={getFrequencyData}
            settings={visualizer.bars}
          />
        )}

        <group rotation={[-Math.PI / 2, 0, 0]}>
          {visualizer.particles.enabled && (
            <ParticleSystem
              getFrequencyData={getFrequencyData}
              settings={visualizer.particles}
            />
          )}
        </group>

        <AnimatedShaderRenderer
          shader={visualizer.shader}
          getFrequencyData={getFrequencyData}
          settings={visualizer.shaderSettings}
        />

        <OrbitControls
          enablePan={false}
          // minDistance={8}
          // maxDistance={20}
          // minPolarAngle={0.2}
          // maxPolarAngle={Math.PI / 2.2}
          enableDamping
          dampingFactor={0.12}
        />

        <Environment preset="night" />
        <WorldEffects />
      </Canvas>
    </div>
  );
});
