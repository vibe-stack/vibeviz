"use client";

import { useFrame } from "@react-three/fiber";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import type { Group, InstancedMesh, MeshStandardMaterial } from "three";
import * as THREE from "three";
import { currentTimeAtom } from "@/features/audio/state";
import { sceneObjectsAtom } from "@/features/scene/state";
import { activeParticlesAtom } from "../state";
import type { DynamicParticleObject, Particle, ForceFieldObject } from "../types";

type DynamicParticleRendererProps = {
  object: DynamicParticleObject;
  isSelected: boolean;
};

export function DynamicParticleRenderer({
  object,
  isSelected,
}: DynamicParticleRendererProps) {
  const groupRef = useRef<Group>(null);
  const instancedRef = useRef<InstancedMesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const allObjects = useAtomValue(sceneObjectsAtom);
  const currentTime = useAtomValue(currentTimeAtom);
  const setActiveParticles = useAtom(activeParticlesAtom)[1];

  const matrices = useMemo(() => new THREE.Matrix4(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const scale = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);
  const euler = useMemo(() => new THREE.Euler(), []);

  const emitterObject = object.emitterObjectId
    ? allObjects.find((obj) => obj.id === object.emitterObjectId)
    : null;

  const particleObject = object.particleObjectId
    ? allObjects.find((obj) => obj.id === object.particleObjectId)
    : null;

  // Get all force fields in the scene
  const forceFields = useMemo(() => {
    return allObjects.filter(
      (obj) => obj.type === "forceField",
    ) as ForceFieldObject[];
  }, [allObjects]);

  // Create a seeded random generator for a specific particle index
  const getParticleRandom = (particleIndex: number) => {
    let seed = object.seed + particleIndex * 1000;
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  };

  // Calculate what particles should exist at a given timeline time
  const calculateParticlesAtTime = (timelineTime: number): Particle[] => {
    if (!emitterObject || emitterObject.type === "postprocessor") return [];

    const particles: Particle[] = [];
    const emissionInterval = 1 / object.emissionRate;
    
    // Calculate how many particles should have been emitted by this time
    const totalParticlesEmitted = Math.floor(timelineTime / emissionInterval);
    
    // Check each potential particle to see if it's still alive
    for (let i = 0; i <= totalParticlesEmitted; i++) {
      const birthTime = i * emissionInterval;
      const age = timelineTime - birthTime;
      
      // Skip if particle is dead
      if (age < 0 || age > object.lifetime) continue;
      
      // Skip if we're at capacity (keep most recent particles)
      if (particles.length >= object.capacity) break;
      
      // Calculate particle state at this age
      const random = getParticleRandom(i);
      const particle = simulateParticle(i, birthTime, age, random, emitterObject);
      
      if (particle) {
        particles.push(particle);
      }
    }
    
    return particles;
  };

  // Simulate a single particle from birth to current age
  const simulateParticle = (
    index: number,
    _birthTime: number,
    age: number,
    random: () => number,
    emitter: typeof emitterObject,
  ): Particle | null => {
    if (!emitter || emitter.type === "postprocessor") return null;

    // Initial spawn position with jitter
    const jitterX = (random() - 0.5) * 2 * object.spawnPositionJitter.x;
    const jitterY = (random() - 0.5) * 2 * object.spawnPositionJitter.y;
    const jitterZ = (random() - 0.5) * 2 * object.spawnPositionJitter.z;

    let posX = emitter.transform.position.x + jitterX;
    let posY = emitter.transform.position.y + jitterY;
    let posZ = emitter.transform.position.z + jitterZ;

    // Initial velocity with jitter
    const velJitterX = (random() - 0.5) * 2 * object.velocityJitter.x;
    const velJitterY = (random() - 0.5) * 2 * object.velocityJitter.y;
    const velJitterZ = (random() - 0.5) * 2 * object.velocityJitter.z;

    let velX = object.velocity.x + velJitterX;
    let velY = object.velocity.y + velJitterY;
    let velZ = object.velocity.z + velJitterZ;

    // Particle scale
    const particleScale = object.minScale + random() * (object.maxScale - object.minScale);

    // Simulate physics over the particle's lifetime using fixed timestep
    const timeStep = 1 / 60; // 60 FPS timestep for consistency
    const steps = Math.floor(age / timeStep);
    const remainderTime = age - steps * timeStep;

    for (let step = 0; step < steps; step++) {
      // Apply gravity
      velY += object.gravity * timeStep;

      // Apply wind
      velX += object.wind.x * timeStep;
      velZ += object.wind.z * timeStep;

      // Apply force fields
      for (const field of forceFields) {
        if (!field.visible) continue;

        const dx = field.transform.position.x - posX;
        const dy = field.transform.position.y - posY;
        const dz = field.transform.position.z - posZ;
        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq);

        if (dist < field.radius && dist > 0.001) {
          const normalizedDist = dist / field.radius;
          const falloffFactor = 1 - Math.pow(normalizedDist, 1 / (field.falloff + 0.1));
          const forceMagnitude =
            field.strength *
            falloffFactor *
            (field.forceFieldType === "repulsor" ? -1 : 1);

          velX += (dx / dist) * forceMagnitude * timeStep;
          velY += (dy / dist) * forceMagnitude * timeStep;
          velZ += (dz / dist) * forceMagnitude * timeStep;
        }
      }

      // Update position
      posX += velX * timeStep;
      posY += velY * timeStep;
      posZ += velZ * timeStep;
    }

    // Apply remainder time
    if (remainderTime > 0) {
      velY += object.gravity * remainderTime;
      velX += object.wind.x * remainderTime;
      velZ += object.wind.z * remainderTime;

      // Apply force fields for remainder
      for (const field of forceFields) {
        if (!field.visible) continue;
        const dx = field.transform.position.x - posX;
        const dy = field.transform.position.y - posY;
        const dz = field.transform.position.z - posZ;
        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq);

        if (dist < field.radius && dist > 0.001) {
          const normalizedDist = dist / field.radius;
          const falloffFactor = 1 - Math.pow(normalizedDist, 1 / (field.falloff + 0.1));
          const forceMagnitude =
            field.strength *
            falloffFactor *
            (field.forceFieldType === "repulsor" ? -1 : 1);

          velX += (dx / dist) * forceMagnitude * remainderTime;
          velY += (dy / dist) * forceMagnitude * remainderTime;
          velZ += (dz / dist) * forceMagnitude * remainderTime;
        }
      }

      posX += velX * remainderTime;
      posY += velY * remainderTime;
      posZ += velZ * remainderTime;
    }

    // Calculate rotation
    const rotX = object.angularVelocity.x * age;
    const rotY = object.angularVelocity.y * age;
    const rotZ = object.angularVelocity.z * age;

    return {
      id: `${object.id}-${index}`,
      position: { x: posX, y: posY, z: posZ },
      velocity: { x: velX, y: velY, z: velZ },
      rotation: { x: rotX, y: rotY, z: rotZ },
      angularVelocity: object.angularVelocity,
      scale: particleScale,
      lifetime: object.lifetime,
      age,
      active: true,
    };
  };

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

  // Get target geometry
  const geometry = useMemo(() => {
    if (particleObject && particleObject.type === "primitive") {
      switch (particleObject.primitiveType) {
        case "cube":
          return new THREE.BoxGeometry(1, 1, 1);
        case "pyramid":
          return new THREE.ConeGeometry(0.5, 1, 4);
        case "torus":
          return new THREE.TorusGeometry(0.5, 0.2, 16, 32);
        case "cylinder":
          return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        default:
          return new THREE.SphereGeometry(0.5, 16, 16);
      }
    }
    return new THREE.SphereGeometry(0.5, 16, 16);
  }, [particleObject]);

  // Update particles based on timeline time (deterministic)
  useFrame(() => {
    if (!instancedRef.current || !object.visible || !emitterObject) return;
    
    // Postprocessors don't have transforms, so skip if emitter is one
    if (emitterObject.type === "postprocessor") return;

    const instancedMesh = instancedRef.current;

    // Calculate particles at current timeline time
    const particles = calculateParticlesAtTime(currentTime);

    // Update instance matrices
    for (let i = 0; i < object.capacity; i++) {
      if (i < particles.length) {
        const particle = particles[i];
        position.set(particle.position.x, particle.position.y, particle.position.z);
        euler.set(particle.rotation.x, particle.rotation.y, particle.rotation.z);
        quaternion.setFromEuler(euler);
        scale.set(particle.scale, particle.scale, particle.scale);
        matrices.compose(position, quaternion, scale);
      } else {
        // Hide inactive instances
        scale.set(0, 0, 0);
        matrices.compose(position, quaternion, scale);
      }
      instancedMesh.setMatrixAt(i, matrices);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;

    // Update state for debugging/inspection
    setActiveParticles((prev) => ({
      ...prev,
      [object.id]: particles,
    }));
  });

  if (!emitterObject || !particleObject || particleObject.type !== "primitive") {
    return null;
  }

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={instancedRef}
        args={[geometry, undefined, object.capacity]}
      >
        <meshStandardMaterial
          ref={materialRef}
          color={particleObject.material.color}
          roughness={particleObject.material.roughness}
          metalness={particleObject.material.metalness}
          emissive={particleObject.material.emissiveColor}
          emissiveIntensity={particleObject.material.emissiveIntensity}
        />
      </instancedMesh>
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color="#10b981" wireframe />
        </mesh>
      )}
    </group>
  );
}
