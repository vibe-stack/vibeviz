"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Mesh } from "three";
import * as THREE from "three";
import type { PrimitiveObject } from "@/features/scene/types";

type PrimitiveRendererProps = {
  object: PrimitiveObject;
  isSelected: boolean;
};

export function PrimitiveRenderer({ object }: PrimitiveRendererProps) {
  const meshRef = useRef<Mesh>(null);
  const wireframeRef = useRef<Mesh>(null);

  // Create custom star geometry
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 0.5;
    const innerRadius = 0.2;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 1,
    });
  }, []);

  useEffect(() => {
    return () => {
      starGeometry.dispose();
    };
  }, [starGeometry]);

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
        return null; // Arrow is rendered as a group below
      case "star":
        return <primitive object={starGeometry} />;
    }
  };

  // Special rendering for arrow (composite shape)
  if (object.primitiveType === "arrow") {
    return (
      <group
        ref={meshRef}
        position={[
          object.transform.position.x,
          object.transform.position.y,
          object.transform.position.z,
        ]}
        rotation={[
          object.transform.rotation.x,
          object.transform.rotation.y,
          object.transform.rotation.z,
        ]}
        scale={[
          object.transform.scale.x,
          object.transform.scale.y,
          object.transform.scale.z,
        ]}
      >
        {/* Arrow shaft */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
          <meshPhysicalMaterial
            color={object.material.color}
            roughness={object.material.roughness}
            metalness={object.material.metalness}
            emissive={object.material.emissiveColor}
            emissiveIntensity={object.material.emissiveIntensity}
            opacity={object.material.opacity}
            transparent={object.material.transparent || object.material.opacity < 1}
            transmission={object.material.transmission}
            thickness={object.material.thickness}
            ior={object.material.ior}
            clearcoat={object.material.clearcoat}
            clearcoatRoughness={object.material.clearcoatRoughness}
            flatShading={object.material.flatShading}
          />
        </mesh>
        {/* Arrow head */}
        <mesh position={[0, 0.25, 0]}>
          <coneGeometry args={[0.25, 0.5, 16]} />
          <meshPhysicalMaterial
            color={object.material.color}
            roughness={object.material.roughness}
            metalness={object.material.metalness}
            emissive={object.material.emissiveColor}
            emissiveIntensity={object.material.emissiveIntensity}
            opacity={object.material.opacity}
            transparent={object.material.transparent || object.material.opacity < 1}
            transmission={object.material.transmission}
            thickness={object.material.thickness}
            ior={object.material.ior}
            clearcoat={object.material.clearcoat}
            clearcoatRoughness={object.material.clearcoatRoughness}
            flatShading={object.material.flatShading}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh ref={meshRef}>
        {getGeometry()}
        <meshPhysicalMaterial
          color={object.material.color}
          roughness={object.material.roughness}
          metalness={object.material.metalness}
          emissive={object.material.emissiveColor}
          emissiveIntensity={object.material.emissiveIntensity}
          opacity={object.material.opacity}
          transparent={object.material.transparent || object.material.opacity < 1}
          transmission={object.material.transmission}
          thickness={object.material.thickness}
          ior={object.material.ior}
          clearcoat={object.material.clearcoat}
          clearcoatRoughness={object.material.clearcoatRoughness}
          flatShading={object.material.flatShading}
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
