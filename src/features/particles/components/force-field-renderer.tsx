"use client";

import { useEffect, useRef } from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";
import type { ForceFieldObject } from "../types";

type ForceFieldRendererProps = {
  object: ForceFieldObject;
  isSelected: boolean;
};

export function ForceFieldRenderer({
  object,
  isSelected,
}: ForceFieldRendererProps) {
  const groupRef = useRef<Group>(null);
  const sphereRef = useRef<Mesh>(null);

  // Apply transform to group
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        object.transform.position.x,
        object.transform.position.y,
        object.transform.position.z,
      );
      groupRef.current.rotation.set(
        object.transform.rotation.x,
        object.transform.rotation.y,
        object.transform.rotation.z,
      );
      groupRef.current.scale.set(
        object.transform.scale.x,
        object.transform.scale.y,
        object.transform.scale.z,
      );
    }
  }, [object.transform]);

  // Force fields are only visible when selected
  if (!object.visible || !isSelected) {
    return null;
  }

  const color =
    object.forceFieldType === "attractor" ? "#3b82f6" : "#ef4444";
  const selectedColor = isSelected ? "#10b981" : color;

  return (
    <group ref={groupRef}>
      {/* Outer sphere showing radius */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[object.radius, 32, 32]} />
        <meshBasicMaterial
          color={selectedColor}
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
      {/* Inner sphere showing falloff */}
      <mesh>
        <sphereGeometry args={[object.radius * (1 - object.falloff), 32, 32]} />
        <meshBasicMaterial
          color={selectedColor}
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
      {/* Center marker */}
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={selectedColor} />
      </mesh>
      {/* Direction arrows for attractors/repulsors */}
      {object.forceFieldType === "attractor" ? (
        <>
          <arrowHelper
            args={[
              new THREE.Vector3(1, 0, 0),
              new THREE.Vector3(object.radius * 0.7, 0, 0),
              object.radius * 0.3,
              selectedColor,
            ]}
          />
          <arrowHelper
            args={[
              new THREE.Vector3(-1, 0, 0),
              new THREE.Vector3(-object.radius * 0.7, 0, 0),
              object.radius * 0.3,
              selectedColor,
            ]}
          />
          <arrowHelper
            args={[
              new THREE.Vector3(0, 1, 0),
              new THREE.Vector3(0, object.radius * 0.7, 0),
              object.radius * 0.3,
              selectedColor,
            ]}
          />
          <arrowHelper
            args={[
              new THREE.Vector3(0, -1, 0),
              new THREE.Vector3(0, -object.radius * 0.7, 0),
              object.radius * 0.3,
              selectedColor,
            ]}
          />
        </>
      ) : (
        <>
          <arrowHelper
            args={[
              new THREE.Vector3(1, 0, 0),
              new THREE.Vector3(0, 0, 0),
              object.radius * 0.3,
              selectedColor,
            ]}
          />
          <arrowHelper
            args={[
              new THREE.Vector3(-1, 0, 0),
              new THREE.Vector3(0, 0, 0),
              object.radius * 0.3,
              selectedColor,
            ]}
          />
          <arrowHelper
            args={[
              new THREE.Vector3(0, 1, 0),
              new THREE.Vector3(0, 0, 0),
              object.radius * 0.3,
              selectedColor,
            ]}
          />
          <arrowHelper
            args={[
              new THREE.Vector3(0, -1, 0),
              new THREE.Vector3(0, 0, 0),
              object.radius * 0.3,
              selectedColor,
            ]}
          />
        </>
      )}
    </group>
  );
}
