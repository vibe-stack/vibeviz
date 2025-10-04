import {
  atan,
  cos,
  Fn,
  floor,
  fract,
  length,
  mix,
  sin,
  time,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";
import type { RainbowControls } from "../types";

const hslHelper = Fn(([h, s, l, n]: any[]) => {
  const k = n.add(h.mul(12)).mod(12);
  const a = s.mul(l.min(l.oneMinus()));
  return l.sub(a.mul(k.sub(3).min(k.mul(-1).add(9)).min(1).max(-1)));
});

const hsl = Fn(([h, s, l]: any[]) => {
  const hh = h.fract().add(1).fract();
  const ss = s.clamp(0, 1);
  const ll = l.clamp(0, 1);
  const r = hslHelper(hh, ss, ll, uniform(0));
  const g = hslHelper(hh, ss, ll, uniform(8));
  const b = hslHelper(hh, ss, ll, uniform(4));
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
    speed: ReturnType<typeof uniform>;
    scale: ReturnType<typeof uniform>;
    patternType: ReturnType<typeof uniform>;
    saturation: ReturnType<typeof uniform>;
    brightness: ReturnType<typeof uniform>;
    contrast: ReturnType<typeof uniform>;
    waveAmplitude: ReturnType<typeof uniform>;
    waveFrequency: ReturnType<typeof uniform>;
    audioInfluence: ReturnType<typeof uniform>;
    audioAffectsSpeed: ReturnType<typeof uniform>;
    audioAffectsAmplitude: ReturnType<typeof uniform>;
    audioAffectsScale: ReturnType<typeof uniform>;
    audioAffectsHue: ReturnType<typeof uniform>;
    audioAffectsBrightness: ReturnType<typeof uniform>;
    useCustomPalette: ReturnType<typeof uniform>;
    paletteColors: ReturnType<typeof uniform>[];
  };
  updateControls: (controls: Partial<RainbowControls>) => void;
};

export function createRainbowMaterial(
  controls: RainbowControls,
): RainbowMaterialHandle {
  const audioLevel = uniform(0);
  const speed = uniform(controls.speed);
  const scale = uniform(controls.scale);
  const patternType = uniform(
    controls.patternType === "waves"
      ? 0
      : controls.patternType === "spiral"
        ? 1
        : controls.patternType === "radial"
          ? 2
          : 3,
  );
  const saturation = uniform(controls.saturation);
  const brightness = uniform(controls.brightness);
  const contrast = uniform(controls.contrast);
  const waveAmplitude = uniform(controls.waveAmplitude);
  const waveFrequency = uniform(controls.waveFrequency);
  const audioInfluence = uniform(controls.audioInfluence);

  // Individual audio reactivity toggles
  const audioAffectsSpeed = uniform(controls.audioAffectsSpeed ? 1 : 0);
  const audioAffectsAmplitude = uniform(controls.audioAffectsAmplitude ? 1 : 0);
  const audioAffectsScale = uniform(controls.audioAffectsScale ? 1 : 0);
  const audioAffectsHue = uniform(controls.audioAffectsHue ? 1 : 0);
  const audioAffectsBrightness = uniform(
    controls.audioAffectsBrightness ? 1 : 0,
  );

  const useCustomPalette = uniform(controls.useCustomPalette ? 1 : 0);

  // Create palette color uniforms (support up to 7 colors)
  const paletteColors = controls.colorPalette.colors
    .slice(0, 7)
    .map((color) => uniform(new THREE.Color(color)));
  // Pad to always have 7 colors for shader consistency
  while (paletteColors.length < 7) {
    paletteColors.push(uniform(new THREE.Color("#000000")));
  }

  const fragment = Fn(() => {
    const coords = uv();

    // Audio reactive modulation
    const audioMod = audioLevel.mul(audioInfluence);

    // Apply audio to different parameters based on toggles
    const speedMod = audioAffectsSpeed.mul(audioMod).mul(0.5);
    const ampMod = audioAffectsAmplitude.mul(audioMod);
    const scaleMod = audioAffectsScale.mul(audioMod).mul(0.5);
    const hueShiftMod = audioAffectsHue.mul(audioMod).mul(0.3);
    const brightMod = audioAffectsBrightness.mul(audioMod).mul(0.3);

    const t = time.mul(speed).mul(0.1).add(speedMod);
    const dynamicScale = scale.add(scaleMod);
    const dynamicAmplitude = waveAmplitude.add(ampMod);

    // Waves pattern
    const wavesHue = Fn(() => {
      const x = coords.x.mul(dynamicScale);
      const y = coords.y.mul(dynamicScale);
      const wave1 = sin(x.mul(waveFrequency).add(t)).mul(dynamicAmplitude);
      const wave2 = cos(y.mul(waveFrequency).add(t.mul(0.7))).mul(
        dynamicAmplitude,
      );
      return fract(x.add(y).add(wave1).add(wave2).add(t.mul(0.5)));
    })();

    // Spiral pattern - use dynamic scale for audio reactivity
    const spiralHue = Fn(() => {
      const centered = coords.sub(vec2(0.5, 0.5));
      const angle = atan(centered.y, centered.x);
      const radius = length(centered);
      const spiral = angle
        .div(Math.PI * 2)
        .add(radius.mul(dynamicScale.mul(2)))
        .add(t);
      return fract(spiral);
    })();

    // Radial pattern - use dynamic scale for audio reactivity
    const radialHue = Fn(() => {
      const centered = coords.sub(vec2(0.5, 0.5));
      const angle = atan(centered.y, centered.x);
      const radius = length(centered);
      const radial = angle
        .div(Math.PI * 2)
        .mul(dynamicScale.mul(4))
        .add(t);
      const rings = sin(radius.mul(dynamicScale.mul(10)).sub(t.mul(2))).mul(
        0.2,
      );
      return fract(radial.add(rings));
    })();

    // Classic rainbow (smooth horizontal)
    const classicHue = Fn(() => {
      const base = coords.x.mul(dynamicScale).add(t);
      const variation = sin(coords.y.mul(Math.PI * 2).mul(waveFrequency)).mul(
        dynamicAmplitude.mul(0.1),
      );
      return fract(base.add(variation));
    })();

    // Select pattern based on patternType uniform (0=waves, 1=spiral, 2=radial, 3=classic)
    const typeVal = floor(patternType);
    const isWaves = typeVal.equal(0).toFloat();
    const isSpiral = typeVal.equal(1).toFloat();
    const isRadial = typeVal.equal(2).toFloat();

    const hue = wavesHue
      .mul(isWaves)
      .add(spiralHue.mul(isSpiral))
      .add(radialHue.mul(isRadial))
      .add(classicHue.mul(isWaves.add(isSpiral).add(isRadial).oneMinus()))
      .add(hueShiftMod); // Add audio hue shift

    // Sample from custom palette if enabled
    const numPaletteColors = paletteColors.length;
    const scaledHue = hue.mul(numPaletteColors);
    const colorIndex = floor(scaledHue);
    const colorFrac = fract(scaledHue);

    // Build palette color selection using vec3
    let selectedPaletteColor: any = vec3(paletteColors[0]);
    for (let i = 0; i < numPaletteColors - 1; i++) {
      const isInRange = colorIndex.equal(i).toFloat();
      const interpolated = mix(
        vec3(paletteColors[i]),
        vec3(paletteColors[i + 1]),
        colorFrac,
      );
      selectedPaletteColor = mix(selectedPaletteColor, interpolated, isInRange);
    }

    // Use custom palette or generate HSL color
    const rainbowColor = hsl(
      hue,
      saturation,
      brightness.add(brightMod).clamp(0, 1),
    );
    const finalColor = mix(
      rainbowColor,
      selectedPaletteColor,
      useCustomPalette,
    );

    // Apply contrast
    const contrastedColor = finalColor.sub(0.5).mul(contrast).add(0.5);

    return vec4(contrastedColor.clamp(0, 1), 1.0);
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
  material.side = THREE.DoubleSide;

  const updateControls = (newControls: Partial<RainbowControls>) => {
    if (newControls.speed !== undefined) speed.value = newControls.speed;
    if (newControls.scale !== undefined) scale.value = newControls.scale;
    if (newControls.patternType !== undefined) {
      patternType.value =
        newControls.patternType === "waves"
          ? 0
          : newControls.patternType === "spiral"
            ? 1
            : newControls.patternType === "radial"
              ? 2
              : 3;
    }
    if (newControls.saturation !== undefined)
      saturation.value = newControls.saturation;
    if (newControls.brightness !== undefined)
      brightness.value = newControls.brightness;
    if (newControls.contrast !== undefined)
      contrast.value = newControls.contrast;
    if (newControls.waveAmplitude !== undefined)
      waveAmplitude.value = newControls.waveAmplitude;
    if (newControls.waveFrequency !== undefined)
      waveFrequency.value = newControls.waveFrequency;
    if (newControls.audioInfluence !== undefined)
      audioInfluence.value = newControls.audioInfluence;
    if (newControls.audioAffectsSpeed !== undefined)
      audioAffectsSpeed.value = newControls.audioAffectsSpeed ? 1 : 0;
    if (newControls.audioAffectsAmplitude !== undefined)
      audioAffectsAmplitude.value = newControls.audioAffectsAmplitude ? 1 : 0;
    if (newControls.audioAffectsScale !== undefined)
      audioAffectsScale.value = newControls.audioAffectsScale ? 1 : 0;
    if (newControls.audioAffectsHue !== undefined)
      audioAffectsHue.value = newControls.audioAffectsHue ? 1 : 0;
    if (newControls.audioAffectsBrightness !== undefined)
      audioAffectsBrightness.value = newControls.audioAffectsBrightness ? 1 : 0;
    if (newControls.useCustomPalette !== undefined) {
      useCustomPalette.value = newControls.useCustomPalette ? 1 : 0;
    }
    if (newControls.colorPalette !== undefined) {
      const colors = newControls.colorPalette.colors.slice(0, 7);
      colors.forEach((color, i) => {
        paletteColors[i].value = new THREE.Color(color);
      });
    }
  };

  return {
    material,
    uniforms: {
      audioLevel,
      speed,
      scale,
      patternType,
      saturation,
      brightness,
      contrast,
      waveAmplitude,
      waveFrequency,
      audioInfluence,
      audioAffectsSpeed,
      audioAffectsAmplitude,
      audioAffectsScale,
      audioAffectsHue,
      audioAffectsBrightness,
      useCustomPalette,
      paletteColors,
    },
    updateControls,
  };
}
