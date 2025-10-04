"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { CameraObject } from "@/features/scene/types";

type CameraRendererProps = {
  object: CameraObject;
};

export function CameraRenderer({ object }: CameraRendererProps) {
  const { camera } = useThree();

  useEffect(() => {
    if (object.isActive) {
      camera.position.set(
        object.transform.position.x,
        object.transform.position.y,
        object.transform.position.z,
      );
      camera.rotation.set(
        object.transform.rotation.x,
        object.transform.rotation.y,
        object.transform.rotation.z,
      );
      if ("fov" in camera) {
        camera.fov = object.fov;
        camera.updateProjectionMatrix();
      }
    }
  }, [object, camera]);

  // Render a camera gizmo when not active
  if (!object.isActive) {
    return (
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
    );
  }

  return null;
}
