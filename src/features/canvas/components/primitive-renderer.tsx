"use client";

import { useEffect, useRef } from "react";
import type { Mesh } from "three";
import type { PrimitiveObject } from "@/features/scene/types";

type PrimitiveRendererProps = {
  object: PrimitiveObject;
  isSelected: boolean;
};

export function PrimitiveRenderer({ object }: PrimitiveRendererProps) {
  const meshRef = useRef<Mesh>(null);
  const wireframeRef = useRef<Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(
        object.transform.position.x,
        object.transform.position.y,
        object.transform.position.z,
      );
      meshRef.current.rotation.set(
        object.transform.rotation.x,
        object.transform.rotation.y,
        object.transform.rotation.z,
      );
      meshRef.current.scale.set(
        object.transform.scale.x,
        object.transform.scale.y,
        object.transform.scale.z,
      );
    }

    if (wireframeRef.current) {
      wireframeRef.current.position.set(
        object.transform.position.x,
        object.transform.position.y,
        object.transform.position.z,
      );
      wireframeRef.current.rotation.set(
        object.transform.rotation.x,
        object.transform.rotation.y,
        object.transform.rotation.z,
      );
      wireframeRef.current.scale.set(
        object.transform.scale.x,
        object.transform.scale.y,
        object.transform.scale.z,
      );
    }
  }, [object.transform]);

  const getGeometry = () => {
    switch (object.primitiveType) {
      case "cube":
        return <boxGeometry args={[1, 1, 1]} />;
      case "pyramid":
        return <coneGeometry args={[0.5, 1, 4]} />;
      case "torus":
        return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
      case "cylinder":
        return (
          <cylinderGeometry
            args={[
              object.cylinderTopRadius ?? 0.5,
              object.cylinderBottomRadius ?? 0.5,
              1,
              32,
            ]}
          />
        );
      case "plane":
        return <planeGeometry args={[2, 2, 1, 1]} />;
      case "sphere":
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case "triangularPrism":
        return <cylinderGeometry args={[0.5, 0.5, 1, 3]} />;
      case "octahedron":
        return <octahedronGeometry args={[0.5, 0]} />;
      case "tetrahedron":
        return <tetrahedronGeometry args={[0.5, 0]} />;
      case "hexagonPrism":
        return <cylinderGeometry args={[0.5, 0.5, 1, 6]} />;
      case "hexagonalPyramid":
        return <coneGeometry args={[0.5, 1, 6]} />;
      case "arrow":
        return <coneGeometry args={[0.3, 1.5, 8]} />;
      case "star":
        return <octahedronGeometry args={[0.5, 1]} />;
    }
  };

  return (
    <group>
      <mesh ref={meshRef}>
        {getGeometry()}
        <meshStandardMaterial
          color={object.material.color}
          roughness={object.material.roughness}
          metalness={object.material.metalness}
          emissive={object.material.emissiveColor}
          emissiveIntensity={object.material.emissiveIntensity}
        />
      </mesh>
      {/* {isSelected && (
        <mesh ref={wireframeRef}>
          {getGeometry()}
          <meshBasicMaterial color="#e879f9" wireframe />
        </mesh>
      )} */}
    </group>
  );
}
