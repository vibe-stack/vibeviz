"use client";
import { OrbitControls, Environment } from "@react-three/drei";
import { CircularVisualizer } from "./CircularVisualizer";
import * as THREE from 'three/webgpu'
import * as TSL from 'three/tsl'
import { Canvas, extend, ThreeToJSXElements, useFrame, useThree } from '@react-three/fiber'

declare module '@react-three/fiber' {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> { }
}

extend(THREE as any)


interface VisualizerSceneProps {
  frequencyData: Uint8Array;
  radius: number;
  maxBarHeight: number;
}

export const VisualizerScene = ({
  frequencyData,
  radius,
  maxBarHeight,
}: VisualizerSceneProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 8, 12], fov: 50 }}
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer(props as any)
          await renderer.init()
          return renderer
        }}
        className="bg-zinc-950"
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#3b82f6"
        />

        <CircularVisualizer
          frequencyData={frequencyData}
          radius={radius}
          maxBarHeight={maxBarHeight}
        />

        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={20}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};
