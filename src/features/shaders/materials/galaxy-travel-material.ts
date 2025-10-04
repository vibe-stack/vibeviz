import {
  Fn,
  floor,
  fract,
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
import type { GalaxyTravelControls } from "../types";

type NodeMaterialInstance = THREE.Material & {
  fragmentNode: unknown;
  lights: boolean;
  transparent: boolean;
  needsUpdate: boolean;
};

export type GalaxyTravelMaterialHandle = {
  material: NodeMaterialInstance;
  uniforms: {
    backgroundColor: ReturnType<typeof uniform>;
    starColor: ReturnType<typeof uniform>;
    baseSpeed: ReturnType<typeof uniform>;
    starCount: ReturnType<typeof uniform>;
    starSize: ReturnType<typeof uniform>;
    audioLevel: ReturnType<typeof uniform>;
    audioInfluence: ReturnType<typeof uniform>;
  };
  updateControls: (controls: Partial<GalaxyTravelControls>) => void;
};

export function createGalaxyTravelMaterial(
  controls: GalaxyTravelControls,
): GalaxyTravelMaterialHandle {
  // Create uniforms
  const backgroundColor = uniform(new THREE.Color(controls.backgroundColor));
  const starColor = uniform(new THREE.Color(controls.starColor));
  const baseSpeed = uniform(controls.baseSpeed / 500);
  const starCount = uniform(controls.starCount);
  const starSize = uniform(controls.starSize);
  const audioLevel = uniform(0.0);
  const audioInfluence = uniform(controls.audioInfluence);

  // Star field with motion - 3D perspective from center
  const travelingStarField = Fn(([coord, depth, speed]: any[]) => {
    // Center point (vanishing point)
    const center = vec2(0.5, 0.5);

    // Direction from center to this point (radial)
    const fromCenter = coord.sub(center);
    const distFromCenter = length(fromCenter);
    const direction = fromCenter.div(distFromCenter.max(0.0001)); // Normalized direction

    // Movement: stars move outward from center (toward viewer)
    const offset = time.mul(speed).mul(0.08);

    // Scale coordinate based on depth - creates perspective
    const scale = depth.mul(0.5).add(0.5); // 0.5 to 1.0
    const scaledCoord = center.add(fromCenter.div(scale));

    // Apply radial movement
    const movingCoord = scaledCoord.add(direction.mul(offset));

    // Use starCount to control density
    const gridScale = starCount.mul(0.5).add(10.0);
    const gridSample = movingCoord.mul(gridScale);
    const cellId = floor(gridSample); // Grid for star placement
    const localPos = fract(gridSample);

    // Stable pseudo-random values derived from cell id and depth
    const baseSeed = cellId.x
      .mul(127.1)
      .add(cellId.y.mul(311.7))
      .add(depth.mul(269.5));

    const randPresence = fract(sin(baseSeed).mul(43758.5453));
    const randPosX = fract(sin(baseSeed.add(1.0)).mul(12543.853));
    const randPosY = fract(sin(baseSeed.add(2.0)).mul(38945.231));

    // Random star position with better distribution - avoid grid patterns
    const starPos = vec2(randPosX, randPosY);

    // Random variation in star presence (not every cell has a star)
    // Increased density: lower threshold means more stars
    const starExists = step(0.15, randPresence);

    // Distance to star center
    const toStar = localPos.sub(starPos);

    // Improved star stretching - controlled growth with speed
    // At low speeds: minimal stretch, at high speeds: longer streaks
    const stretchAmount = speed.mul(4.0).clamp(0, 20); // Cap the stretch

    // Project distance onto direction for stretching
    const alongDir = toStar.x.mul(direction.x).add(toStar.y.mul(direction.y));
    const perpDir = toStar.x.mul(direction.y).sub(toStar.y.mul(direction.x));

    // Stretch along movement direction - create elongated stars
    const stretchedDist = length(
      vec2(alongDir, perpDir.mul(stretchAmount.add(1.0))),
    );

    // Star tail effect - longer in the direction opposite to movement
    const isBehind = step(0, alongDir.negate()); // 1 if behind, 0 if ahead
    const tailLength = stretchAmount.mul(0.1).mul(isBehind);
    const finalDist = stretchedDist.sub(tailLength.mul(alongDir.abs()));

    // Larger stars and trails at higher speeds - increased base size
    const speedBoost = speed.mul(0.3).add(1.0);
    const starRadius = starSize.mul(0.003).div(depth.max(0.5)).mul(speedBoost);

    // Star brightness with smooth falloff
    // brightness = 1 at center (finalDist=0), brightness = 0 at outer edge
    const outerRadius = starRadius.mul(2.0);
    const brightness = smoothstep(outerRadius, starRadius.mul(0.5), finalDist);

    // Gentler fade at edges of screen (circular vignette) - more gradual falloff
    const edgeFade = smoothstep(1.2, 0.3, distFromCenter);

    // Brighter stars closer to viewer - increased minimum brightness
    const depthBrightness = depth.oneMinus().mul(0.3).add(0.7);

    return brightness.mul(edgeFade).mul(depthBrightness).mul(starExists);
  });

  const fragment = Fn(() => {
    const coords = uv();

    // Calculate current speed (base + audio reactive)
    const currentSpeed = baseSpeed
      .mul(0.4)
      .add(audioLevel.mul(audioInfluence).mul(0.6));

    // Multiple depth layers - closest (depth=0.3) to farthest (depth=2.0)
    // Closer stars move faster (more parallax)
    const stars1 = travelingStarField(
      coords,
      0.3, // Closest
      currentSpeed.mul(2.0),
    ).mul(1.2);

    const stars2 = travelingStarField(coords, 0.7, currentSpeed.mul(1.5)).mul(
      1.0,
    );

    const stars3 = travelingStarField(coords, 1.2, currentSpeed.mul(1.0)).mul(
      0.8,
    );

    const stars4 = travelingStarField(
      coords,
      2.0, // Farthest
      currentSpeed.mul(0.5),
    ).mul(0.6);

    // Combine all star layers
    const allStars = stars1.add(stars2).add(stars3).add(stars4).clamp(0, 1);

    // Mix stars with background
    const finalColor = mix(backgroundColor, starColor, allStars);

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

  const updateControls = (newControls: Partial<GalaxyTravelControls>) => {
    if (newControls.backgroundColor)
      backgroundColor.value = new THREE.Color(newControls.backgroundColor);
    if (newControls.starColor)
      starColor.value = new THREE.Color(newControls.starColor);
    if (newControls.baseSpeed !== undefined)
      baseSpeed.value = newControls.baseSpeed;
    if (newControls.starCount !== undefined)
      starCount.value = newControls.starCount;
    if (newControls.starSize !== undefined)
      starSize.value = newControls.starSize;
    if (newControls.audioInfluence !== undefined)
      audioInfluence.value = newControls.audioInfluence;
  };

  return {
    material,
    uniforms: {
      backgroundColor,
      starColor,
      baseSpeed,
      starCount,
      starSize,
      audioLevel,
      audioInfluence,
    },
    updateControls,
  };
}
