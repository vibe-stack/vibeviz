"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial, Vector3 } from "three";

import type { CameraObject } from "@/features/scene/types";

type CameraRendererProps = {
  object: CameraObject;
};

export function CameraRenderer({ object }: CameraRendererProps) {
  const { camera } = useThree();
  const targetRef = useRef(new Vector3());

  // Update camera every frame when active
  useFrame(() => {
    if (object.isActive) {
      // Update position
      camera.position.set(
        object.transform.position.x,
        object.transform.position.y,
        object.transform.position.z,
      );
      
      // Update target and look at it
      targetRef.current.set(
        object.target.x,
        object.target.y,
        object.target.z,
      );
      camera.lookAt(targetRef.current);
      
      // Update FOV if it's a perspective camera
      if ("fov" in camera) {
        camera.fov = object.fov;
        camera.updateProjectionMatrix();
      }
    }
  });

  // Create line for camera direction indicator
  const line = useMemo(() => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array([
      object.transform.position.x,
      object.transform.position.y,
      object.transform.position.z,
      object.target.x,
      object.target.y,
      object.target.z,
    ]);
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    const material = new LineBasicMaterial({ color: 0xfbbf24, opacity: 0.5, transparent: true });
    return new Line(geometry, material);
  }, [object.transform.position, object.target]);

  // Render a camera gizmo when not active
  if (!object.isActive) {
    return (
      <group>
        {/* Camera position gizmo */}
        <group
          position={[
            object.transform.position.x,
            object.transform.position.y,
            object.transform.position.z,
          ]}
        >
          <mesh>
            <coneGeometry args={[0.2, 0.4, 4]} />
            <meshBasicMaterial color="#fbbf24" wireframe />
          </mesh>
        </group>
        
        {/* Target indicator */}
        <mesh
          position={[
            object.target.x,
            object.target.y,
            object.target.z,
          ]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" wireframe />
        </mesh>
        
        {/* Line from camera to target */}
        <primitive object={line} />
      </group>
    );
  }

  return null;
}


