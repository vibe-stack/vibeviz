"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group, Mesh } from "three/webgpu";
import { MathUtils, MeshStandardMaterial, Vector3 } from "three/webgpu";
import type { ShapesSettings } from "@/state/visualizer-store";
import { createShapeGeometry } from "./geometries";

interface ShapesVisualizerProps {
  getFrequencyData: () => Uint8Array;
  settings: ShapesSettings;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const ShapesVisualizer = ({
  getFrequencyData,
  settings,
}: ShapesVisualizerProps) => {
  const isEnabled = settings.enabled;

  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  const rotationSettings = settings.animation.rotate;
  const scaleSettings = settings.animation.scale;

  const geometry = useMemo(
    () => createShapeGeometry(settings.type),
    [settings.type],
  );

  const material = useMemo(() => new MeshStandardMaterial({}), []);

  const rotationAxis = useMemo(() => {
    const axis = new Vector3(
      settings.animation.rotate.axis.x,
      settings.animation.rotate.axis.y,
      settings.animation.rotate.axis.z,
    );

    // If axis is zero vector, default to Y-axis
    if (axis.lengthSq() < 1e-6) {
      axis.set(0, 1, 0);
    }

    return axis.normalize();
  }, [
    settings.animation.rotate.axis.x,
    settings.animation.rotate.axis.y,
    settings.animation.rotate.axis.z,
  ]);

  const rotationAxisRef = useRef(new Vector3(0, 1, 0));
  const baseRotationRef = useRef<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 0,
  });

  const rotationStateRef = useRef({
    direction: 1,
    beatLatch: 0,
    tempTimer: 0,
    tempActive: false,
  });

  const scaleStateRef = useRef({
    phase: 0,
    direction: 1,
    beatLatch: 0,
    tempTimer: 0,
    tempActive: false,
    pulse: 0,
  });

  const audioStateRef = useRef({
    smoothedBeat: 0,
    lastBeatTime: 0,
  });

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    rotationAxisRef.current.copy(rotationAxis);
  }, [rotationAxis]);

  useEffect(() => {
    rotationStateRef.current.direction = 1;
    rotationStateRef.current.beatLatch = 0;
    rotationStateRef.current.tempTimer = 0;
    rotationStateRef.current.tempActive = false;

    // Only reset rotation if disabled
    if (!rotationSettings.enabled && meshRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
    }
  }, [rotationSettings.enabled, rotationSettings.mode]);

  useEffect(() => {
    const radians = {
      x: MathUtils.degToRad(settings.baseRotation.x),
      y: MathUtils.degToRad(settings.baseRotation.y),
      z: MathUtils.degToRad(settings.baseRotation.z),
    };

    baseRotationRef.current = radians;

    const group = groupRef.current;
    if (group) {
      group.rotation.set(radians.x, radians.y, radians.z);
    }
  }, [
    settings.baseRotation.x,
    settings.baseRotation.y,
    settings.baseRotation.z,
  ]);

  useEffect(() => {
    const group = groupRef.current;
    if (group) {
      group.scale.setScalar(clamp(settings.baseScale, 0.1, 8));
    }
  }, [settings.baseScale]);

  useEffect(() => {
    material.color.set(settings.material.color);
    material.metalness = clamp(settings.material.metalness, 0, 1);
    material.roughness = clamp(settings.material.roughness, 0, 1);
    material.emissive.set(settings.material.emissive);
    material.emissiveIntensity = clamp(
      settings.material.emissiveIntensity,
      0,
      6,
    );
    material.needsUpdate = true;
  }, [
    material,
    settings.material.color,
    settings.material.metalness,
    settings.material.roughness,
    settings.material.emissive,
    settings.material.emissiveIntensity,
  ]);

  useEffect(() => {
    scaleStateRef.current.phase = 0;
    scaleStateRef.current.direction = 1;
    scaleStateRef.current.beatLatch = 0;
    scaleStateRef.current.tempTimer = 0;
    scaleStateRef.current.tempActive = false;
    scaleStateRef.current.pulse = 0;

    // Only reset scale if disabled
    if (!scaleSettings.enabled && meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  }, [
    scaleSettings.enabled,
    scaleSettings.mode,
  ]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.visible = isEnabled;
    }
    if (meshRef.current) {
      meshRef.current.visible = isEnabled;
    }
  }, [isEnabled]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!isEnabled) {
      mesh.visible = false;
      return;
    }

    if (!mesh.visible) {
      mesh.visible = true;
    }

    // Get audio data and calculate beat strength - simplified approach like CircularVisualizer
    const frequencyData = getFrequencyData();
    let averageFreq = 0;
    for (let i = 0; i < Math.min(frequencyData.length, 64); i++) {
      averageFreq += frequencyData[i];
    }
    averageFreq /= Math.min(frequencyData.length, 64);
    
    // Normalize and smooth
    const normalizedFreq = averageFreq / 255;
    const audioState = audioStateRef.current;
    audioState.smoothedBeat = audioState.smoothedBeat * 0.85 + normalizedFreq * 0.15;
    
    // Simple beat detection - when current is significantly higher than average
    const beatStrength = Math.max(0, (normalizedFreq - audioState.smoothedBeat) * 4);
    
    // Also use raw amplitude for more responsive animations
    const amplitude = normalizedFreq;

    const rotationState = rotationStateRef.current;
    rotationState.beatLatch = Math.max(rotationState.beatLatch - delta, 0);
    rotationState.tempTimer = Math.max(rotationState.tempTimer - delta, 0);

    if (rotationSettings.enabled && rotationSettings.speed !== 0) {
      let speed = rotationSettings.speed;
      const axis = rotationAxisRef.current;

      // Base continuous rotation
      let baseSpeed = speed * 0.3; // Slower base rotation

      switch (rotationSettings.mode) {
        case "slowDownOnBeat": {
          speed = baseSpeed * (1 - clamp(beatStrength * 0.8, 0, 0.7));
          break;
        }
        case "speedUpOnBeat": {
          speed = baseSpeed * (1 + beatStrength * 2.5 + amplitude * 1.5);
          break;
        }
        case "reverseOnBeat": {
          if (beatStrength > 0.2 && rotationState.beatLatch <= 0) {
            rotationState.direction *= -1;
            rotationState.beatLatch = 0.5;
          }
          speed = baseSpeed;
          break;
        }
        case "temporaryReverseOnBeat": {
          if (!rotationState.tempActive && beatStrength > 0.2) {
            rotationState.tempActive = true;
            rotationState.direction = -1;
            rotationState.tempTimer = 0.6;
          }

          if (rotationState.tempActive && rotationState.tempTimer <= 0) {
            rotationState.tempActive = false;
            rotationState.direction = 1;
          }
          speed = baseSpeed;
          break;
        }
        default: {
          // Default continuous rotation
          speed = baseSpeed;
          break;
        }
      }

      const direction = rotationState.direction;

      mesh.rotateOnAxis(axis, direction * speed * delta);
    }

    const scaleState = scaleStateRef.current;
    scaleState.beatLatch = Math.max(scaleState.beatLatch - delta, 0);
    scaleState.tempTimer = Math.max(scaleState.tempTimer - delta, 0);
    scaleState.pulse = Math.max(scaleState.pulse - delta * 4.0, 0);

    if (scaleSettings.enabled) {
      const minRange = clamp(
        Math.min(scaleSettings.min, scaleSettings.max),
        0.1,
        5,
      );
      const maxRange = clamp(
        Math.max(scaleSettings.min, scaleSettings.max),
        minRange,
        6,
      );

      let speed = scaleSettings.speed;
      
      // Base continuous scaling
      let baseSpeed = speed * 0.5; // Slower base scaling

      switch (scaleSettings.mode) {
        case "slowDownOnBeat": {
          speed = baseSpeed * (1 - clamp(beatStrength * 0.8, 0, 0.75));
          break;
        }
        case "speedUpOnBeat": {
          speed = baseSpeed * (1 + beatStrength * 1.8);
          break;
        }
        case "reverseOnBeat": {
          if (beatStrength > 0.3 && scaleState.beatLatch <= 0) {
            scaleState.direction *= -1;
            scaleState.beatLatch = 0.3;
          }
          speed = baseSpeed;
          break;
        }
        case "temporaryReverseOnBeat": {
          if (!scaleState.tempActive && beatStrength > 0.3) {
            scaleState.tempActive = true;
            scaleState.direction = -1;
            scaleState.tempTimer = 0.35;
          }

          if (scaleState.tempActive && scaleState.tempTimer <= 0) {
            scaleState.tempActive = false;
            scaleState.direction = 1;
          }
          speed = baseSpeed;
          break;
        }
        case "heartbeat": {
          scaleState.pulse = Math.max(scaleState.pulse, beatStrength * 1.2);
          speed = baseSpeed * (1 + beatStrength * 1.2);
          break;
        }
        default: {
          // Default continuous scaling
          speed = baseSpeed;
          break;
        }
      }

      scaleState.phase += delta * speed * scaleState.direction;

      let progress = (Math.sin(scaleState.phase) + 1) / 2;
      if (scaleSettings.mode === "heartbeat") {
        progress = Math.min(1, progress + scaleState.pulse * 0.5);
      }

      const scaleValue = minRange + (maxRange - minRange) * progress;
      mesh.scale.setScalar(scaleValue);
    } else {
      // Reset scale when disabled
      mesh.scale.setScalar(1);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} visible={isEnabled}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
    </group>
  );
};
