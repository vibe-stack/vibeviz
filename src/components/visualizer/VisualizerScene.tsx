"use client";

import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { OrbitControls, Environment } from "@react-three/drei";
import {
  Canvas,
  type RootState,
  type ThreeToJSXElements,
  extend,
  useThree,
} from "@react-three/fiber";
import * as THREE from "three/webgpu";
import { useSnapshot } from "valtio";
import { visualizerStore } from "@/state/visualizer-store";
import { AnimatedShaderRenderer } from "./AnimatedShaderRenderer";
import { CircularVisualizer } from "./CircularVisualizer";
import { ParticleSystem } from "./particles/ParticleSystem";
import { ShapesVisualizer } from "./shapes/ShapesVisualizer";
import WorldEffects from "./effects";
import { usePlaybackTimeRef } from "@/context/playback-time-context";

declare module "@react-three/fiber" {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> { }
}

extend(THREE as any);

interface VisualizerSceneProps {
  getFrequencyData: () => Uint8Array;
}

export interface VisualizerSceneRef {
  getCanvas: () => HTMLCanvasElement | null;
  beginExport: (frameRate: number) => Promise<void>;
  renderFrameAt: (time: number) => Promise<void>;
  finishExport: () => Promise<void>;
}

interface ExportBridgeProps {
  onReady: (state: RootState) => void;
}

const ExportBridge = ({ onReady }: ExportBridgeProps) => {
  const state = useThree();
  const readyRef = useRef(onReady);

  readyRef.current = onReady;

  useLayoutEffect(() => {
    if (state) {
      readyRef.current(state);
    }
  }, [state]);

  return null;
};

export const VisualizerScene = forwardRef<VisualizerSceneRef, VisualizerSceneProps>(({ getFrequencyData }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizer = useSnapshot(visualizerStore);
  const { background, fog, lights } = visualizer.world;
  const playbackTimeRef = usePlaybackTimeRef();
  const exportStateRef = useRef<RootState | null>(null);
  const originalFrameloopRef = useRef<RootState["frameloop"]>("always");
  const isExportingRef = useRef(false);
  const lastExportTimeRef = useRef<number>(0);

  const handleStoreReady = useCallback((state: RootState) => {
    exportStateRef.current = state;
  }, []);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    beginExport: async (_frameRate: number) => {
      const store = exportStateRef.current;
      if (!store) {
        throw new Error("Visualizer store is not ready for exporting");
      }

      if (isExportingRef.current) {
        return;
      }

      const state = store.get();
      originalFrameloopRef.current = state.frameloop;
      isExportingRef.current = true;

      state.setFrameloop("never");
      state.clock.running = true;
      state.clock.elapsedTime = 0;
      state.clock.oldTime = 0;
      lastExportTimeRef.current = 0;
    },
    renderFrameAt: async (time: number) => {
      const store = exportStateRef.current;
      if (!store) {
        return;
      }

      const state = store.get();
      const timestamp = Math.max(0, time * 1000);
      
      // Calculate proper delta for export
      const delta = time - lastExportTimeRef.current;
      lastExportTimeRef.current = time;

      playbackTimeRef.current = time;

      // Update clock with proper timing
      state.clock.elapsedTime = time;
      state.clock.oldTime = timestamp;

      store.advance(timestamp, true);
    },
    finishExport: async () => {
      const store = exportStateRef.current;
      if (!store) {
        return;
      }

      const state = store.get();
      state.setFrameloop(originalFrameloopRef.current);
      state.clock.start();
      store.invalidate();
      isExportingRef.current = false;
      lastExportTimeRef.current = 0;
    },
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
        <ExportBridge onReady={handleStoreReady} />
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
          enablePan
          // minDistance={8}
          // maxDistance={20}
          // minPolarAngle={0.2}
          // maxPolarAngle={Math.PI / 2.2}
          enableDamping
          dampingFactor={0.12}
        />

        {/* <Environment preset="warehouse" /> */}
        <WorldEffects />
      </Canvas>
    </div>
  );
});
