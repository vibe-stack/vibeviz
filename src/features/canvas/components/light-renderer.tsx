"use client";

import { Environment } from "@react-three/drei";
import { useEffect, useRef } from "react";
import type { Light } from "three";
import type { LightObject } from "@/features/scene/types";

type LightRendererProps = {
  object: LightObject;
  isSelected: boolean;
};

export function LightRenderer({ object, isSelected }: LightRendererProps) {
  const lightRef = useRef<Light>(null);

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.position.set(
        object.transform.position.x,
        object.transform.position.y,
        object.transform.position.z,
      );
    }
  }, [object.transform]);

  // Environment light doesn't use position
  if (object.lightType === "env") {
    return <Environment preset="sunset" />;
  }

  // Ambient light doesn't use position
  if (object.lightType === "ambient") {
    return (
      <ambientLight
        ref={lightRef}
        color={object.color}
        intensity={object.intensity}
      />
    );
  }

  // Directional light
  if (object.lightType === "directional") {
    return (
      <>
        <directionalLight
          ref={lightRef}
          color={object.color}
          intensity={object.intensity}
          castShadow={object.castShadow}
        />
        {isSelected && (
          <mesh
            position={[
              object.transform.position.x,
              object.transform.position.y,
              object.transform.position.z,
            ]}
          >
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#ffff00" wireframe />
          </mesh>
        )}
      </>
    );
  }

  // Point light
  if (object.lightType === "point") {
    return (
      <>
        <pointLight
          ref={lightRef}
          color={object.color}
          intensity={object.intensity}
          distance={object.distance}
          decay={object.decay}
          castShadow={object.castShadow}
        />
        {isSelected && (
          <mesh
            position={[
              object.transform.position.x,
              object.transform.position.y,
              object.transform.position.z,
            ]}
          >
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#ffff00" wireframe />
          </mesh>
        )}
      </>
    );
  }

  // Spot light
  if (object.lightType === "spot") {
    return (
      <>
        <spotLight
          ref={lightRef}
          color={object.color}
          intensity={object.intensity}
          distance={object.distance}
          angle={object.angle}
          penumbra={object.penumbra}
          decay={object.decay}
          castShadow={object.castShadow}
          target-position={[
            object.target?.x || 0,
            object.target?.y || 0,
            object.target?.z || 0,
          ]}
        />
        {isSelected && (
          <>
            <mesh
              position={[
                object.transform.position.x,
                object.transform.position.y,
                object.transform.position.z,
              ]}
            >
              <coneGeometry args={[0.3, 0.6, 8]} />
              <meshBasicMaterial color="#ffff00" wireframe />
            </mesh>
            <mesh
              position={[
                object.target?.x || 0,
                object.target?.y || 0,
                object.target?.z || 0,
              ]}
            >
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial color="#ff00ff" wireframe />
            </mesh>
          </>
        )}
      </>
    );
  }

  return null;
}
