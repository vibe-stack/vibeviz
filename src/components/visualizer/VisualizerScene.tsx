"use client";

import { OrbitControls, Environment } from "@react-three/drei";
import { Canvas, ThreeToJSXElements, extend } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import * as THREE from "three/webgpu";
import { CircularVisualizer } from "./CircularVisualizer";
import { ParticleField } from "./ParticleField";
import { AuroraShader } from "./shaders/AuroraShader";
import { PulseGridShader } from "./shaders/PulseGridShader";
import { visualizerStore } from "@/state/visualizer-store";

declare module "@react-three/fiber" {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

extend(THREE as any);

interface VisualizerSceneProps {
  getFrequencyData: () => Uint8Array;
}

export const VisualizerScene = ({ getFrequencyData }: VisualizerSceneProps) => {
  const visualizer = useSnapshot(visualizerStore);

  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 7.5, 12], fov: 52 }}
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer(props as any);
          await renderer.init();
          return renderer;
        }}
        className="bg-zinc-950"
      >
        <color attach="background" args={["#09090b"]} />
        <fog attach="fog" args={["#0f172a", 12, 42]} />

        <ambientLight intensity={0.35} color="#94a3b8" />
        <directionalLight
          position={[6, 10, 6]}
          intensity={0.8}
          color="#38bdf8"
        />
        <directionalLight position={[-6, 4, -4]} intensity={0.45} color="#f87171" />

        {visualizer.mode === "circular" && (
          <CircularVisualizer
            getFrequencyData={getFrequencyData}
            settings={visualizer.circular}
          />
        )}

        {visualizer.mode === "particles" && (
          <ParticleField
            getFrequencyData={getFrequencyData}
            settings={visualizer.particles}
          />
        )}

        {visualizer.shader === "aurora" && (
          <AuroraShader
            getFrequencyData={getFrequencyData}
            settings={visualizer.shaderSettings.aurora}
          />
        )}

        {visualizer.shader === "pulseGrid" && (
          <PulseGridShader
            getFrequencyData={getFrequencyData}
            settings={visualizer.shaderSettings.pulseGrid}
          />
        )}

        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={20}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.2}
          enableDamping
          dampingFactor={0.12}
        />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};
