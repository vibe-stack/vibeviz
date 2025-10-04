"use client";

import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import type { Group, InstancedMesh, MeshStandardMaterial } from "three";
import * as THREE from "three";
import * as Tone from "tone";
import { audioPlayerAtom, isPlayingAtom } from "@/features/audio/state";
import { isExportingAtom } from "@/features/export/state";
import { sceneObjectsAtom } from "@/features/scene/state";
import type { AudioParticleObject } from "../types";

type AudioParticleRendererProps = {
  object: AudioParticleObject;
  isSelected: boolean;
};

export function AudioParticleRenderer({
  object,
  isSelected,
}: AudioParticleRendererProps) {
  const groupRef = useRef<Group>(null);
  const instancedRef = useRef<InstancedMesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const allObjects = useAtomValue(sceneObjectsAtom);
  const audioPlayer = useAtomValue(audioPlayerAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const isExporting = useAtomValue(isExportingAtom);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const rawValuesRef = useRef<Float32Array | null>(null);

  const matrices = useMemo(() => new THREE.Matrix4(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const scale = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);

  const targetPrimitive = object.targetPrimitiveId
    ? allObjects.find((obj) => obj.id === object.targetPrimitiveId)
    : null;

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

  // Setup audio analyzer
  useEffect(() => {
    if (audioPlayer && !analyzerRef.current) {
      const fftSize =
        2 ** Math.ceil(Math.log2(Math.min(object.particleCount, 2048)));
      const analyzer = new Tone.Analyser("fft", fftSize);
      analyzer.smoothing = object.smoothing;
      audioPlayer.connect(analyzer);
      analyzerRef.current = analyzer;
      rawValuesRef.current = new Float32Array(fftSize);
    }

    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.dispose();
        analyzerRef.current = null;
        rawValuesRef.current = null;
      }
    };
  }, [audioPlayer, object.particleCount, object.smoothing]);

  // Get target geometry
  const geometry = useMemo(() => {
    if (
      targetPrimitive &&
      targetPrimitive.type === "primitive" &&
      targetPrimitive.primitiveType
    ) {
      switch (targetPrimitive.primitiveType) {
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
  }, [targetPrimitive]);

  // Path calculation functions
  const getPathPosition = (
    index: number,
    total: number,
    time: number,
    audioValue: number,
  ): THREE.Vector3 => {
    const t = index / Math.max(total - 1, 1);
    const animTime = time * object.pathSpeed + t * Math.PI * 2;
    const scale = object.pathScale * (1 + audioValue * object.audioReactivity);
    const pos = new THREE.Vector3();

    switch (object.pathType) {
      case "orbit":
        pos.x = Math.cos(animTime) * scale;
        pos.y = Math.sin(animTime * 0.5) * scale * 0.3;
        pos.z = Math.sin(animTime) * scale;
        break;
      case "wave":
        pos.x = (t - 0.5) * scale * 2;
        pos.y = Math.sin(animTime + t * Math.PI * 4) * scale * 0.5;
        pos.z = Math.cos(animTime + t * Math.PI * 2) * scale * 0.3;
        break;
      case "spiral":
        pos.x = Math.cos(animTime) * scale * t;
        pos.y = (t - 0.5) * scale;
        pos.z = Math.sin(animTime) * scale * t;
        break;
      case "linear":
        pos.x = (t - 0.5) * scale * 2;
        pos.y = Math.sin(animTime) * scale * 0.2;
        pos.z = 0;
        break;
    }

    return pos;
  };

  useFrame((state) => {
    if (!instancedRef.current || !object.visible) return;

    const instancedMesh = instancedRef.current;
    const time = state.clock.elapsedTime;

    // Get audio data
    let audioValues: number[] = [];
    if (analyzerRef.current && rawValuesRef.current && (isPlaying || isExporting)) {
      const values = analyzerRef.current.getValue() as Float32Array;
      rawValuesRef.current.set(values);

      const startIdx = Math.floor(object.freqRangeStart * values.length);
      const endIdx = Math.floor(object.freqRangeEnd * values.length);
      const rangeSize = endIdx - startIdx;

      for (let i = 0; i < object.particleCount; i++) {
        const freqIdx = startIdx + Math.floor((i / object.particleCount) * rangeSize);
        const dbValue = rawValuesRef.current[freqIdx] || -100;
        const normalizedValue = Math.max(0, (dbValue + 100) / 100);
        const threshold = normalizedValue > object.audioThreshold ? normalizedValue : 0;
        audioValues[i] = threshold * object.audioGain;
      }
    } else {
      audioValues = new Array(object.particleCount).fill(0);
    }

    // Update particle instances
    for (let i = 0; i < object.particleCount; i++) {
      const audioValue = audioValues[i] || 0;
      const particlePos = getPathPosition(i, object.particleCount, time, audioValue);

      position.copy(particlePos);
      
      const particleScale = object.baseSize + audioValue * object.dynamicSize;
      scale.set(particleScale, particleScale, particleScale);

      matrices.compose(position, quaternion, scale);
      instancedMesh.setMatrixAt(i, matrices);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;

    // Update material emissive based on audio
    if (materialRef.current && targetPrimitive && targetPrimitive.type === "primitive") {
      const avgAudio = audioValues.reduce((a, b) => a + b, 0) / audioValues.length;
      const emissiveIntensity = 
        targetPrimitive.material.emissiveIntensity + avgAudio * object.emissiveBoost;
      materialRef.current.emissiveIntensity = emissiveIntensity;
    }
  });

  if (!targetPrimitive || targetPrimitive.type !== "primitive") {
    return null;
  }

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={instancedRef}
        args={[geometry, undefined, object.particleCount]}
      >
        <meshStandardMaterial
          ref={materialRef}
          color={targetPrimitive.material.color}
          roughness={targetPrimitive.material.roughness}
          metalness={targetPrimitive.material.metalness}
          emissive={targetPrimitive.material.emissiveColor}
          emissiveIntensity={targetPrimitive.material.emissiveIntensity}
        />
      </instancedMesh>
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(object.pathScale * 2, object.pathScale * 2, object.pathScale * 2)]} />
          <lineBasicMaterial color="#10b981" />
        </lineSegments>
      )}
    </group>
  );
}
