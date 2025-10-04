import {
  Fn,
  floor,
  max,
  min,
  positionLocal,
  sub,
  time,
  uniform,
  vec3,
} from "three/tsl";
import * as THREE from "three/webgpu";

const hslHelper = Fn(([h, s, l, n]: any[]) => {
  const k = n.add(h.mul(12)).mod(12);
  const a = s.mul(min(l, sub(1, l)));
  return l.sub(a.mul(max(-1, min(min(k.sub(3), sub(9, k)), 1))));
});

const hsl = Fn(([h, s, l]: any[]) => {
  const hh = h.fract().add(1).fract();
  const ss = s.clamp(0, 1);
  const ll = l.clamp(0, 1);
  const r = hslHelper(hh, ss, ll, 0);
  const g = hslHelper(hh, ss, ll, 8);
  const b = hslHelper(hh, ss, ll, 4);
  return vec3(r, g, b);
});

type NodeMaterialInstance = THREE.Material & {
  fragmentNode: unknown;
  lights: boolean;
  transparent: boolean;
  needsUpdate: boolean;
};

export type RainbowMaterialHandle = {
  material: NodeMaterialInstance;
  uniforms: {
    audioLevel: ReturnType<typeof uniform>;
  };
};

export function createRainbowMaterial(): RainbowMaterialHandle {
  const audioLevel = uniform(0);

  const fragment = Fn(() => {
    const t = time.mul(0.2).add(audioLevel.mul(0.35)).fract();
    const offset = positionLocal.x.add(0.3).sub(t);
    const hueBase = floor(offset.mul(10)).mul(0.1);
    const hue = hueBase.add(audioLevel.mul(0.15));
    const saturation = hueBase
      .mod(1)
      .oneMinus()
      .mul(0.5)
      .add(audioLevel.mul(0.25))
      .clamp(0, 1);
    const lightness = saturation.mul(0.5).add(0.35).add(audioLevel.mul(0.2));
    const base = hsl(hue, saturation, lightness.clamp(0, 1));
    const brightness = audioLevel.mul(0.5).add(0.75);
    return base.mul(brightness).clamp(0, 1);
  });

  type NodeMaterialCtor = new () => NodeMaterialInstance;
  const NodeMaterialClass = (
    THREE as unknown as { NodeMaterial: NodeMaterialCtor }
  ).NodeMaterial;
  const material = new NodeMaterialClass();
  material.fragmentNode = fragment();
  material.lights = false;
  material.transparent = false;
  material.needsUpdate = true;

  return {
    material,
    uniforms: {
      audioLevel,
    },
  };
}
