import { eases } from "animejs";

// Built-in easing functions from anime.js
export const EASING_OPTIONS = [
  // Linear
  { value: "linear", label: "Linear", category: "Linear" },

  // Power (In/Out/InOut)
  { value: "in", label: "Ease In", category: "Power" },
  { value: "out", label: "Ease Out", category: "Power" },
  { value: "inOut", label: "Ease In Out", category: "Power" },
  { value: "outIn", label: "Ease Out In", category: "Power" },

  // Quad
  { value: "inQuad", label: "In Quad", category: "Quad" },
  { value: "outQuad", label: "Out Quad", category: "Quad" },
  { value: "inOutQuad", label: "In Out Quad", category: "Quad" },
  { value: "outInQuad", label: "Out In Quad", category: "Quad" },

  // Cubic
  { value: "inCubic", label: "In Cubic", category: "Cubic" },
  { value: "outCubic", label: "Out Cubic", category: "Cubic" },
  { value: "inOutCubic", label: "In Out Cubic", category: "Cubic" },
  { value: "outInCubic", label: "Out In Cubic", category: "Cubic" },

  // Quart
  { value: "inQuart", label: "In Quart", category: "Quart" },
  { value: "outQuart", label: "Out Quart", category: "Quart" },
  { value: "inOutQuart", label: "In Out Quart", category: "Quart" },
  { value: "outInQuart", label: "Out In Quart", category: "Quart" },

  // Quint
  { value: "inQuint", label: "In Quint", category: "Quint" },
  { value: "outQuint", label: "Out Quint", category: "Quint" },
  { value: "inOutQuint", label: "In Out Quint", category: "Quint" },
  { value: "outInQuint", label: "Out In Quint", category: "Quint" },

  // Sine
  { value: "inSine", label: "In Sine", category: "Sine" },
  { value: "outSine", label: "Out Sine", category: "Sine" },
  { value: "inOutSine", label: "In Out Sine", category: "Sine" },
  { value: "outInSine", label: "Out In Sine", category: "Sine" },

  // Expo
  { value: "inExpo", label: "In Expo", category: "Expo" },
  { value: "outExpo", label: "Out Expo", category: "Expo" },
  { value: "inOutExpo", label: "In Out Expo", category: "Expo" },
  { value: "outInExpo", label: "Out In Expo", category: "Expo" },

  // Circ
  { value: "inCirc", label: "In Circ", category: "Circ" },
  { value: "outCirc", label: "Out Circ", category: "Circ" },
  { value: "inOutCirc", label: "In Out Circ", category: "Circ" },
  { value: "outInCirc", label: "Out In Circ", category: "Circ" },

  // Back
  { value: "inBack", label: "In Back", category: "Back" },
  { value: "outBack", label: "Out Back", category: "Back" },
  { value: "inOutBack", label: "In Out Back", category: "Back" },
  { value: "outInBack", label: "Out In Back", category: "Back" },

  // Elastic
  { value: "inElastic", label: "In Elastic", category: "Elastic" },
  { value: "outElastic", label: "Out Elastic", category: "Elastic" },
  { value: "inOutElastic", label: "In Out Elastic", category: "Elastic" },
  { value: "outInElastic", label: "Out In Elastic", category: "Elastic" },

  // Bounce
  { value: "inBounce", label: "In Bounce", category: "Bounce" },
  { value: "outBounce", label: "Out Bounce", category: "Bounce" },
  { value: "inOutBounce", label: "In Out Bounce", category: "Bounce" },
  { value: "outInBounce", label: "Out In Bounce", category: "Bounce" },
];

// Group easings by category
export const EASING_CATEGORIES = EASING_OPTIONS.reduce(
  (acc, easing) => {
    if (!acc[easing.category]) {
      acc[easing.category] = [];
    }
    acc[easing.category].push(easing);
    return acc;
  },
  {} as Record<string, typeof EASING_OPTIONS>,
);

// Get easing function from anime.js
export function getEasingFunction(easingName: string): (t: number) => number {
  if (!easingName || easingName === "linear") {
    return (t: number) => t;
  }

  try {
    // Access the easing function directly from anime.js eases object
    const easeFn = (eases as any)[easingName];

    if (typeof easeFn === "function") {
      console.log(`✅ Loaded easing function: ${easingName}`);
      return easeFn;
    }

    console.warn(
      `⚠️ Easing function "${easingName}" not found in anime.js eases`,
    );
  } catch (e) {
    console.warn(`❌ Failed to get easing function for ${easingName}`, e);
  }

  // Fallback to linear
  console.log(`Falling back to linear for: ${easingName}`);
  return (t: number) => t;
}

// Apply easing to interpolation value
export function applyEasing(t: number, easingName?: string): number {
  if (!easingName || easingName === "linear") {
    return t;
  }

  const easingFn = getEasingFunction(easingName);
  return easingFn(t);
}
