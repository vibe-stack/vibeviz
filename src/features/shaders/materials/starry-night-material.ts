import {
  abs,
  Fn,
  floor,
  fract,
  hash,
  length,
  mix,
  sin,
  smoothstep,
  step,
  time,
  uniform,
  uv,
  vec2,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";
import type { StarryNightControls } from "../types";

type NodeMaterialInstance = THREE.Material & {
  fragmentNode: unknown;
  lights: boolean;
  transparent: boolean;
  needsUpdate: boolean;
};

export type StarryNightMaterialHandle = {
  material: NodeMaterialInstance;
  uniforms: {
    topColor: ReturnType<typeof uniform>;
    bottomColor: ReturnType<typeof uniform>;
    starCount: ReturnType<typeof uniform>;
    starColor: ReturnType<typeof uniform>;
    starSize: ReturnType<typeof uniform>;
    starBrightness: ReturnType<typeof uniform>;
    shootingStarFrequency: ReturnType<typeof uniform>;
    shootingStarSpeed: ReturnType<typeof uniform>;
  };
  updateControls: (controls: Partial<StarryNightControls>) => void;
};

export function createStarryNightMaterial(
  controls: StarryNightControls,
): StarryNightMaterialHandle {
  // Create uniforms
  const topColor = uniform(new THREE.Color(controls.topColor));
  const bottomColor = uniform(new THREE.Color(controls.bottomColor));
  const starCount = uniform(controls.starCount);
  const starColor = uniform(new THREE.Color(controls.starColor));
  const starSize = uniform(controls.starSize);
  const starBrightness = uniform(controls.starBrightness);
  const shootingStarFrequency = uniform(controls.shootingStarFrequency);
  const shootingStarSpeed = uniform(controls.shootingStarSpeed);

  // Star field function
  const starField = Fn(([coord, seed]: any[]) => {
    const cellId = floor(coord);
    const localPos = fract(coord);

    // Hash for star position within cell
    const starHash = hash(cellId.add(seed));
    const starPos = vec2(fract(starHash), fract(starHash.mul(43.758)));

    // Distance to star center
    const dist = length(localPos.sub(starPos));
    const starRadius = starSize.mul(0.001);

    // Star brightness with twinkle
    const twinkle = sin(time.mul(2.0).add(starHash.mul(100.0)))
      .mul(0.5)
      .add(0.5);
    const brightness = smoothstep(starRadius, starRadius.mul(0.5), dist);

    return brightness.mul(twinkle).mul(starBrightness);
  });

  // Shooting star function
  const shootingStar = Fn(([coord, t]: any[]) => {
    // Slower shooting star cycle - appears every 10-20 seconds
    const cycleTime = t.mul(shootingStarSpeed.mul(0.05));
    const shootingHash = floor(cycleTime);
    const progress = fract(cycleTime);

    // Only show shooting star during a small window of the cycle
    const appearWindow = smoothstep(0.0, 0.05, progress).mul(
      smoothstep(0.4, 0.35, progress),
    );

    // Random start position - varies each time
    const startY = fract(hash(shootingHash)).mul(0.4).add(0.6); // Start from top
    const startX = fract(hash(shootingHash.mul(7.234))).mul(0.6); // Start from left side

    // Movement direction - diagonal down-right
    const moveX = 1.0;
    const moveY = -0.7; // Negative for downward movement

    // Current position
    const shootingX = startX.add(progress.mul(moveX).mul(1.2));
    const shootingY = startY.add(progress.mul(moveY).mul(1.2));

    // Distance to shooting star position
    const toStar = coord.sub(vec2(shootingX, shootingY));

    // Normalize movement direction for trail calculation
    const moveLength = length(vec2(moveX, moveY));
    const moveDir = vec2(moveX, moveY).div(moveLength);

    // Project toStar onto movement direction
    const alongTrail = toStar.x.mul(moveDir.x).add(toStar.y.mul(moveDir.y));
    const perpTrail = toStar.x.mul(moveDir.y).sub(toStar.y.mul(moveDir.x));

    // Trail parameters - longer, more magical
    const trailWidth = 0.002; // Very thin
    const trailLength = 0.25; // Much longer trail

    // Trail with gradient fade
    const trailCrossFade = smoothstep(
      trailWidth * 3,
      trailWidth * 0.5,
      abs(perpTrail),
    );
    const trailLengthFade = smoothstep(trailLength, 0.0, alongTrail).mul(
      smoothstep(-0.01, 0.0, alongTrail),
    );

    // Add sparkle/twinkle to trail
    const trailSparkle = sin(alongTrail.mul(50.0).add(t.mul(10.0)))
      .mul(0.15)
      .add(0.85);
    const trailBrightness = trailCrossFade
      .mul(trailLengthFade)
      .mul(trailSparkle);

    // Bright head of the shooting star
    const headDist = length(toStar);
    const headBrightness = smoothstep(0.008, 0.001, headDist).mul(3.0);

    // Small glow around the head
    const headGlow = smoothstep(0.02, 0.005, headDist).mul(0.5);

    // Combine trail, head, and glow with appearance window
    const shootingBrightness = trailBrightness
      .mul(0.6)
      .add(headBrightness)
      .add(headGlow)
      .mul(appearWindow)
      .mul(step(progress, 0.4)); // Only show during first 40% of cycle

    return shootingBrightness;
  });

  const fragment = Fn(() => {
    const coords = uv();

    // Background gradient
    const gradient = mix(bottomColor, topColor, coords.y);

    // Star field - multiple layers for depth
    const stars1 = starField(coords.mul(starCount), 0.0);
    const stars2 = starField(coords.mul(starCount.mul(1.5)), 13.37).mul(0.6);
    const stars3 = starField(coords.mul(starCount.mul(0.7)), 42.42).mul(0.8);

    const allStars = stars1.add(stars2).add(stars3);

    // Shooting star - subtle brightness boost
    const shooting = shootingStar(coords, time).mul(shootingStarFrequency);

    // Combine - just add shooting star to stars, no extra glow
    const starContribution = allStars.add(shooting).clamp(0, 1);
    const finalColor = mix(gradient, starColor, starContribution);

    return vec4(finalColor, 1.0);
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

  const updateControls = (newControls: Partial<StarryNightControls>) => {
    if (newControls.topColor)
      topColor.value = new THREE.Color(newControls.topColor);
    if (newControls.bottomColor)
      bottomColor.value = new THREE.Color(newControls.bottomColor);
    if (newControls.starCount !== undefined)
      starCount.value = newControls.starCount;
    if (newControls.starColor)
      starColor.value = new THREE.Color(newControls.starColor);
    if (newControls.starSize !== undefined)
      starSize.value = newControls.starSize;
    if (newControls.starBrightness !== undefined)
      starBrightness.value = newControls.starBrightness;
    if (newControls.shootingStarFrequency !== undefined)
      shootingStarFrequency.value = newControls.shootingStarFrequency;
    if (newControls.shootingStarSpeed !== undefined)
      shootingStarSpeed.value = newControls.shootingStarSpeed;
  };

  return {
    material,
    uniforms: {
      topColor,
      bottomColor,
      starCount,
      starColor,
      starSize,
      starBrightness,
      shootingStarFrequency,
      shootingStarSpeed,
    },
    updateControls,
  };
}
