import {
  clamp,
  cos,
  Fn,
  mix,
  screenSize,
  sin,
  uniform,
  uv,
  vec2,
  vec4,
} from "three/tsl";
import type { PostprocessorObject } from "@/features/scene/types";

export function applyDotScreen(
  outputNode: any,
  processor: PostprocessorObject,
) {
  const scale = (processor.controls.scale as number) ?? 0.3;
  const angle = (processor.controls.angle as number) ?? 1.57;
  const dotColor = (processor.controls.dotColor as string) ?? "#000000";
  const backgroundColor =
    (processor.controls.backgroundColor as string) ?? "#ffffff";

  // Convert hex colors to vec3
  const dotColorVec = hexToVec3(dotColor);
  const bgColorVec = hexToVec3(backgroundColor);

  // Create custom dot screen with colors
  const dotColorUniform = uniform(dotColorVec);
  const bgColorUniform = uniform(bgColorVec);
  const scaleUniform = uniform(scale);
  const angleUniform = uniform(angle);

  const pattern = Fn(() => {
    const s = sin(angleUniform);
    const c = cos(angleUniform);
    const tex = uv().mul(screenSize);
    const point = vec2(
      c.mul(tex.x).sub(s.mul(tex.y)),
      s.mul(tex.x).add(c.mul(tex.y)),
    ).mul(scaleUniform);
    return sin(point.x).mul(sin(point.y)).mul(4);
  });

  const coloredDotScreen = Fn(() => {
    const color = outputNode;
    const patternValue = clamp(pattern().mul(0.5).add(0.5), 0.0, 1.0);
    const tintedDots = mix(bgColorUniform, dotColorUniform, patternValue);
    const finalColor = mix(color.rgb, tintedDots, 0.6);

    return vec4(finalColor, color.a);
  });

  const dotScreenEffect = coloredDotScreen();

  return {
    effectNode: {
      dotColorUniform,
      bgColorUniform,
      scaleUniform,
      angleUniform,
    },
    outputNode: dotScreenEffect,
  };
}

export function updateDotScreen(
  effectData: any,
  processor: PostprocessorObject,
) {
  const scale = (processor.controls.scale as number) ?? 0.3;
  const angle = (processor.controls.angle as number) ?? 1.57;
  const dotColor = (processor.controls.dotColor as string) ?? "#000000";
  const backgroundColor =
    (processor.controls.backgroundColor as string) ?? "#ffffff";

  if (effectData.scaleUniform) {
    effectData.scaleUniform.value = scale;
  }
  if (effectData.angleUniform) {
    effectData.angleUniform.value = angle;
  }
  if (effectData.dotColorUniform) {
    effectData.dotColorUniform.value = hexToVec3(dotColor);
  }
  if (effectData.bgColorUniform) {
    effectData.bgColorUniform.value = hexToVec3(backgroundColor);
  }
}

function hexToVec3(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
}
