const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export const pseudoNoise3 = (x: number, y: number, z: number) => {
  const a = Math.sin(x * 0.76 + y * 0.41 + z * 0.63);
  const b = Math.sin((x + y) * 0.35 + z * 1.12);
  const c = Math.cos((x * 0.5 - y * 1.3 + z * 0.77));
  const d = Math.sin(z * 0.94 + Math.sin(x * 0.73) * 1.2);
  return clamp01(0.5 + 0.5 * (a * 0.6 + b * 0.3 + c * 0.4 + d * 0.2));
};

export const pseudoCurlNoise = (
  x: number,
  y: number,
  z: number,
  epsilon = 0.35,
) => {
  const dx = pseudoNoise3(x + epsilon, y, z) - pseudoNoise3(x - epsilon, y, z);
  const dy = pseudoNoise3(x, y + epsilon, z) - pseudoNoise3(x, y - epsilon, z);
  const dz = pseudoNoise3(x, y, z + epsilon) - pseudoNoise3(x, y, z - epsilon);

  return {
    x: dx / (epsilon * 2),
    y: dy / (epsilon * 2),
    z: dz / (epsilon * 2),
  };
};
