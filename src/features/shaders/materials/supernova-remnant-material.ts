import {
  abs,
  atan,
  cos,
  Fn,
  floor,
  fract,
  length,
  mix,
  pow,
  sin,
  smoothstep,
  time,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";
import type { SupernovaRemnantControls } from "../types";

// Hash function for randomness
const hash2 = Fn(([st]: any[]) => {
  return fract(sin(st.dot(vec2(12.9898, 78.233))).mul(43758.5453123));
});

const hash3 = Fn(([st]: any[]) => {
  return fract(sin(st.dot(vec3(12.9898, 78.233, 45.543))).mul(43758.5453123));
});

// 2D Noise
const noise2D = Fn(([st]: any[]) => {
  const i = floor(st);
  const f = fract(st);
  const u = f.mul(f).mul(f.mul(-2).add(3));

  const a = hash2(i.add(vec2(0, 0)));
  const b = hash2(i.add(vec2(1, 0)));
  const c = hash2(i.add(vec2(0, 1)));
  const d = hash2(i.add(vec2(1, 1)));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
});

// 3D Noise
const noise3D = Fn(([st]: any[]) => {
  const i = floor(st);
  const f = fract(st);
  const u = f.mul(f).mul(f.mul(-2).add(3));

  const n000 = hash3(i.add(vec3(0, 0, 0)));
  const n100 = hash3(i.add(vec3(1, 0, 0)));
  const n010 = hash3(i.add(vec3(0, 1, 0)));
  const n110 = hash3(i.add(vec3(1, 1, 0)));
  const n001 = hash3(i.add(vec3(0, 0, 1)));
  const n101 = hash3(i.add(vec3(1, 0, 1)));
  const n011 = hash3(i.add(vec3(0, 1, 1)));
  const n111 = hash3(i.add(vec3(1, 1, 1)));

  const mix00 = mix(n000, n100, u.x);
  const mix10 = mix(n010, n110, u.x);
  const mix01 = mix(n001, n101, u.x);
  const mix11 = mix(n011, n111, u.x);

  const mix0 = mix(mix00, mix10, u.y);
  const mix1 = mix(mix01, mix11, u.y);

  return mix(mix0, mix1, u.z);
});

// 2D FBM (Fractional Brownian Motion)
const fbm2D = Fn(([st]: any[]) => {
  let value: any = uniform(0);
  let amplitude: any = uniform(0.5);
  let frequency: any = st;

  for (let i = 0; i < 6; i++) {
    value = value.add(amplitude.mul(noise2D(frequency)));
    frequency = frequency.mul(2);
    amplitude = amplitude.mul(0.5);
  }

  return value;
});

// 3D FBM
const fbm3D = Fn(([st]: any[]) => {
  let value: any = uniform(0);
  let amplitude: any = uniform(0.5);
  let frequency: any = st;

  for (let i = 0; i < 6; i++) {
    value = value.add(amplitude.mul(noise3D(frequency)));
    frequency = frequency.mul(2);
    amplitude = amplitude.mul(0.5);
  }

  return value;
});

type NodeMaterialInstance = THREE.Material & {
  fragmentNode: unknown;
  lights: boolean;
  transparent: boolean;
  needsUpdate: boolean;
};

export type SupernovaRemnantMaterialHandle = {
  material: NodeMaterialInstance;
  uniforms: {
    audioLevel: ReturnType<typeof uniform>;
    speed: ReturnType<typeof uniform>;
    filament1Color: ReturnType<typeof uniform>;
    filament1GlowColor: ReturnType<typeof uniform>;
    filament1Speed: ReturnType<typeof uniform>;
    filament1Intensity: ReturnType<typeof uniform>;
    filament2Color: ReturnType<typeof uniform>;
    filament2GlowColor: ReturnType<typeof uniform>;
    filament2Speed: ReturnType<typeof uniform>;
    filament2Intensity: ReturnType<typeof uniform>;
    coreColor: ReturnType<typeof uniform>;
    coreIntensity: ReturnType<typeof uniform>;
    exposure: ReturnType<typeof uniform>;
    gamma: ReturnType<typeof uniform>;
    audioInfluence: ReturnType<typeof uniform>;
    audioAffectsExpansion: ReturnType<typeof uniform>;
    audioAffectsIntensity: ReturnType<typeof uniform>;
    audioAffectsCore: ReturnType<typeof uniform>;
  };
  updateControls: (controls: Partial<SupernovaRemnantControls>) => void;
};

export function createSupernovaRemnantMaterial(
  controls: SupernovaRemnantControls,
): SupernovaRemnantMaterialHandle {
  const audioLevel = uniform(0);
  const speed = uniform(controls.speed);
  const filament1Color = uniform(new THREE.Color(controls.filament1Color));
  const filament1GlowColor = uniform(
    new THREE.Color(controls.filament1GlowColor),
  );
  const filament1Speed = uniform(controls.filament1Speed);
  const filament1Intensity = uniform(controls.filament1Intensity);
  const filament2Color = uniform(new THREE.Color(controls.filament2Color));
  const filament2GlowColor = uniform(
    new THREE.Color(controls.filament2GlowColor),
  );
  const filament2Speed = uniform(controls.filament2Speed);
  const filament2Intensity = uniform(controls.filament2Intensity);
  const coreColor = uniform(new THREE.Color(controls.coreColor));
  const coreIntensity = uniform(controls.coreIntensity);
  const exposure = uniform(controls.exposure);
  const gamma = uniform(controls.gamma);
  const audioInfluence = uniform(controls.audioInfluence);
  const audioAffectsExpansion = uniform(controls.audioAffectsExpansion ? 1 : 0);
  const audioAffectsIntensity = uniform(controls.audioAffectsIntensity ? 1 : 0);
  const audioAffectsCore = uniform(controls.audioAffectsCore ? 1 : 0);

  const fragment = Fn(() => {
    // Center coordinates - match original GLSL exactly
    const uvCoords = uv();
    const coords = uvCoords.sub(vec2(0.5, 0.5));

    const t = time.mul(speed).mul(0.3);

    // Audio modulation
    const audioMod = audioLevel.mul(audioInfluence);
    const expansionMod = audioAffectsExpansion.mul(audioMod).mul(0.3);
    const intensityMod = audioAffectsIntensity.mul(audioMod);
    const coreMod = audioAffectsCore.mul(audioMod);

    let finalColor: any = vec3(0);

    const radius = length(coords);
    const angle = atan(coords.y, coords.x);

    // Filament Layer 1 - match original exactly
    const speed1 = filament1Speed;
    const outer1 = t.mul(speed1).add(1.5).add(expansionMod);
    const inner1 = outer1.sub(0.5);

    const p1 = vec3(
      sin(angle).mul(3.0),
      cos(angle).mul(3.0),
      radius.mul(3.0).add(t.mul(speed1)),
    );

    let filaments1: any = fbm3D(p1);
    filaments1 = abs(filaments1.sub(0.5)).mul(2.0).oneMinus();
    filaments1 = pow(filaments1, 10.0);
    filaments1 = filaments1.mul(smoothstep(outer1, inner1, radius));
    const filaments1Final = filaments1
      .mul(filament1Intensity)
      .mul(intensityMod.add(1));

    finalColor = finalColor.add(filaments1Final.mul(vec3(filament1Color)));
    finalColor = finalColor.add(
      pow(filaments1Final, 12.0).mul(vec3(filament1GlowColor)).mul(5.0),
    );

    // Filament Layer 2 - match original exactly
    const speed2 = filament2Speed;
    const outer2 = t.mul(speed2).add(1.5).add(expansionMod);
    const inner2 = outer2.sub(0.4);

    const p2 = vec3(
      sin(angle).mul(5.0),
      cos(angle).mul(5.0),
      radius.mul(4.0).add(t.mul(speed2)),
    ).add(vec3(3.7, 5.2, 1.3));

    let filaments2: any = fbm3D(p2);
    filaments2 = abs(filaments2.sub(0.5)).mul(2.0).oneMinus();
    filaments2 = pow(filaments2, 15.0);
    filaments2 = filaments2.mul(smoothstep(outer2, inner2, radius));
    const filaments2Final = filaments2
      .mul(filament2Intensity)
      .mul(intensityMod.add(1));

    finalColor = finalColor.add(filaments2Final.mul(vec3(filament2Color)));
    finalColor = finalColor.add(
      pow(filaments2Final, 18.0).mul(vec3(filament2GlowColor)).mul(5.0),
    );

    // Core - match original exactly
    const coreFade = smoothstep(1.5, 0.0, t).mul(coreMod.add(1));
    const coreTexture = fbm2D(coords.mul(3.0).sub(vec2(t, t)));
    const coreRadius = smoothstep(0.0, 0.2, radius).oneMinus();
    const coreBrightness = coreRadius
      .mul(pow(coreFade, 2.0))
      .mul(coreIntensity);

    finalColor = finalColor.add(
      coreBrightness.mul(coreTexture.mul(2.0)).mul(vec3(coreColor)),
    );

    // Tone mapping (Reinhard) - match original exactly
    finalColor = finalColor.mul(exposure);
    finalColor = finalColor.div(finalColor.add(vec3(1.0)));

    // Gamma correction - match original exactly
    finalColor = pow(finalColor, vec3(gamma));

    return vec4(finalColor.clamp(0, 1), 1.0);
  });

  type NodeMaterialCtor = new () => NodeMaterialInstance;
  const NodeMaterialClass = (
    THREE as unknown as { NodeMaterial: NodeMaterialCtor }
  ).NodeMaterial;
  const material = new NodeMaterialClass();
  material.side = THREE.DoubleSide;
  material.fragmentNode = fragment();
  material.lights = false;
  material.transparent = false;
  material.needsUpdate = true;

  const updateControls = (newControls: Partial<SupernovaRemnantControls>) => {
    if (newControls.speed !== undefined) speed.value = newControls.speed;
    if (newControls.filament1Color !== undefined)
      filament1Color.value = new THREE.Color(newControls.filament1Color);
    if (newControls.filament1GlowColor !== undefined)
      filament1GlowColor.value = new THREE.Color(
        newControls.filament1GlowColor,
      );
    if (newControls.filament1Speed !== undefined)
      filament1Speed.value = newControls.filament1Speed;
    if (newControls.filament1Intensity !== undefined)
      filament1Intensity.value = newControls.filament1Intensity;
    if (newControls.filament2Color !== undefined)
      filament2Color.value = new THREE.Color(newControls.filament2Color);
    if (newControls.filament2GlowColor !== undefined)
      filament2GlowColor.value = new THREE.Color(
        newControls.filament2GlowColor,
      );
    if (newControls.filament2Speed !== undefined)
      filament2Speed.value = newControls.filament2Speed;
    if (newControls.filament2Intensity !== undefined)
      filament2Intensity.value = newControls.filament2Intensity;
    if (newControls.coreColor !== undefined)
      coreColor.value = new THREE.Color(newControls.coreColor);
    if (newControls.coreIntensity !== undefined)
      coreIntensity.value = newControls.coreIntensity;
    if (newControls.exposure !== undefined)
      exposure.value = newControls.exposure;
    if (newControls.gamma !== undefined) gamma.value = newControls.gamma;
    if (newControls.audioInfluence !== undefined)
      audioInfluence.value = newControls.audioInfluence;
    if (newControls.audioAffectsExpansion !== undefined)
      audioAffectsExpansion.value = newControls.audioAffectsExpansion ? 1 : 0;
    if (newControls.audioAffectsIntensity !== undefined)
      audioAffectsIntensity.value = newControls.audioAffectsIntensity ? 1 : 0;
    if (newControls.audioAffectsCore !== undefined)
      audioAffectsCore.value = newControls.audioAffectsCore ? 1 : 0;
  };

  return {
    material,
    uniforms: {
      audioLevel,
      speed,
      filament1Color,
      filament1GlowColor,
      filament1Speed,
      filament1Intensity,
      filament2Color,
      filament2GlowColor,
      filament2Speed,
      filament2Intensity,
      coreColor,
      coreIntensity,
      exposure,
      gamma,
      audioInfluence,
      audioAffectsExpansion,
      audioAffectsIntensity,
      audioAffectsCore,
    },
    updateControls,
  };
}
