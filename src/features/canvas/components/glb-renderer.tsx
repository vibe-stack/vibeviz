"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useSetAtom } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { updateObjectAtom } from "@/features/scene/state";
import type { GLBObject } from "@/features/scene/types";

type GLBRendererProps = {
  object: GLBObject;
  isSelected: boolean;
};

// Inner component that handles the actual GLB loading
function GLBContent({ object, isSelected }: GLBRendererProps) {
  const groupRef = useRef<Group>(null);
  const updateObject = useSetAtom(updateObjectAtom);
  const currentAnimationRef = useRef<string | null>(null);

  // Load GLB model - URL is guaranteed to exist here
  const gltf = useGLTF(object.url!);

  // Clone the scene once and store it
  const clonedScene = useMemo(() => {
    if (!gltf?.scene) {
      return null;
    }

    return SkeletonUtils.clone(gltf.scene) as Group;
  }, [gltf]);

  const { actions, names, mixer } = useAnimations(
    gltf?.animations || [],
    clonedScene ?? undefined,
  );

  // Extract available animations from GLTF
  useEffect(() => {
    if (!names.length) return;

    const animationNames = names;

    // Update object with available animations if they changed
    if (
      JSON.stringify(animationNames) !==
      JSON.stringify(object.availableAnimations)
    ) {
      updateObject(object.id, {
        availableAnimations: animationNames,
        // Set first animation as active if none selected
        activeAnimation: object.activeAnimation || animationNames[0] || null,
      });
    }
  }, [
    names,
    object.availableAnimations,
    object.activeAnimation,
    object.id,
    updateObject,
  ]);

  // Play active animation
  useEffect(() => {
    if (!actions) return;

    // Check if animation actually changed
    if (currentAnimationRef.current === object.activeAnimation) {
      return;
    }

    // Update the ref to track current animation
    currentAnimationRef.current = object.activeAnimation;

    console.log("[GLB Animation] Switching to:", object.activeAnimation);

    // Stop all actions first
    Object.values(actions).forEach((action) => {
      action?.stop();
    });

    if (!object.activeAnimation) {
      console.log("[GLB Animation] No active animation, stopping all");
      return;
    }

    const action = actions[object.activeAnimation];
    if (!action) {
      console.log("[GLB Animation] Action not found:", object.activeAnimation);
      return;
    }

    console.log("[GLB Animation] Playing:", object.activeAnimation);
    action.reset();
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = false;
    action.play();
  }, [actions, object.activeAnimation]);

  // Ensure mixer advances even when component is not the default hook owner
  useEffect(() => {
    if (!mixer) return;

    mixer.timeScale = 1;
  }, [mixer]);

  // Apply transform
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

  if (!clonedScene) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Main renderer component that conditionally renders based on URL
export function GLBRenderer({ object, isSelected }: GLBRendererProps) {
  const groupRef = useRef<Group>(null);

  // Apply transform
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

  if (!object.url) {
    // Render a placeholder box if no URL is set
    return (
      <group ref={groupRef}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={isSelected ? "#e879f9" : "#666666"}
            wireframe
          />
        </mesh>
      </group>
    );
  }

  return <GLBContent object={object} isSelected={isSelected} />;
}
