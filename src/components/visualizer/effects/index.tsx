"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
// Postprocessing is not WebGPU compatible in this setup; disable for now
import * as THREE from 'three/webgpu';
// three WebGPU postprocessing via TSL
import { pass } from 'three/tsl';
import { bloom as bloomNode } from 'three/addons/tsl/display/BloomNode.js';

const toThreeColor = (rgb: { x: number; y: number; z: number }) => new THREE.Color(rgb.x, rgb.y, rgb.z);

// const blendMap ... removed with postprocessing
// const kernelMap ... removed with postprocessing

const toneMap: Record<string, THREE.ToneMapping> = {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
};

const shadowMapType: Record<string, THREE.ShadowMapType> = {
  Basic: THREE.BasicShadowMap,
  PCF: THREE.PCFShadowMap,
  PCFSoft: THREE.PCFSoftShadowMap,
};

export const WorldEffects: React.FC = () => {
  const { gl, scene, camera } = useThree();

  // Post-processing refs
  const postRef = useRef<THREE.PostProcessing | null>(null);
  const bloomRef = useRef<any>(null);
  const scenePassColorRef = useRef<any>(null);

  // Update renderer settings when they change
  useEffect(() => {
  // three newer versions removed physicallyCorrectLights; keep for compatibility
    if ('physicallyCorrectLights' in gl) gl.physicallyCorrectLights = true;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl]);

  // Ensure scene fog cleans up when switching types
  useEffect(() => {
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  // Setup/teardown WebGPU bloom post-processing. Only enable in material shading mode.
  useEffect(() => {
    // Tear down any previous chain first
    if (postRef.current && typeof (postRef.current as any).dispose === 'function') {
      try { (postRef.current as any).dispose(); } catch {}
    }
    postRef.current = null;
    bloomRef.current = null;
    scenePassColorRef.current = null;
  // enable only when bloom is on and we are in material shading mode
  // Only available with WebGPU renderer
  if (!(gl as any)?.isWebGPURenderer) return;

    try {
      const post = new (THREE as any).PostProcessing(gl as any);
      // Build a scene pass and add bloom on top of the color output
      const scenePass = pass(scene as any, camera as any);
      const scenePassColor = (scenePass as any).getTextureNode('output');
      const bloomPass = bloomNode(scenePassColor);

      // Initial params
      if (bloomPass.threshold) bloomPass.threshold.value = 0.3;
      if (bloomPass.strength) bloomPass.strength.value = 4.5;
      if (bloomPass.radius) bloomPass.radius.value = Math.max(0, Math.min(2, 2));

      // Compose and assign
      post.outputNode = (scenePassColor as any).add(bloomPass);

      postRef.current = post;
      bloomRef.current = bloomPass;
      scenePassColorRef.current = scenePassColor;
    } catch (e) {
      // If anything goes wrong, disable gracefully
      if (postRef.current && typeof (postRef.current as any).dispose === 'function') {
        try { (postRef.current as any).dispose(); } catch {}
      }
      postRef.current = null;
      bloomRef.current = null;
      scenePassColorRef.current = null;
      console.warn('Bloom postprocessing init failed:', e);
    }
    return () => {
      if (postRef.current && typeof (postRef.current as any).dispose === 'function') {
        try { (postRef.current as any).dispose(); } catch {}
      }
      postRef.current = null;
      bloomRef.current = null;
      scenePassColorRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  // Drive post-processing each frame (after the default r3f render)
  useFrame(() => {
    if (postRef.current) {
      postRef.current.render();
    } else {
      // Fallback: if no postprocessing chain is active, ensure the renderer still draws the scene.
      // In some WebGPU setups the default React-Three-Fiber render path can be bypassed; call render explicitly.
      try {
        (gl as any).render(scene, camera);
      } catch {
        // ignore render errors here
      }
    }
  }, 1);

  return (
    <>
    </>
  );
};

export default WorldEffects;
