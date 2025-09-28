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

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

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
        <color attach="background" args={[visualizer.world.background]} />
        {visualizer.world.fog.enabled ? (
          <fog
            attach="fog"
            args={[
              visualizer.world.fog.color,
              visualizer.world.fog.near,
              visualizer.world.fog.far,
            ]}
          />
        ) : null}

        <ambientLight
          intensity={visualizer.world.ambientIntensity}
          color="#94a3b8"
        />
        <directionalLight
          position={[6, 10, 6]}
          intensity={visualizer.world.keyLightIntensity}
          color="#38bdf8"
        />
        <directionalLight
          position={[-6, 4, -4]}
          intensity={visualizer.world.fillLightIntensity}
          color="#f87171"
        />

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
