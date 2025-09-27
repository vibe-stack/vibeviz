import { Color } from "three/webgpu";
import type { ParticlePalette } from "@/state/visualizer-store";

export interface PaletteColors {
  base: Color;
  mid: Color;
  highlight: Color;
}

export const createPaletteColors = (palette: ParticlePalette): PaletteColors => ({
  base: new Color(palette.base),
  mid: new Color(palette.mid),
  highlight: new Color(palette.highlight),
});

export const samplePalette = (
  palette: PaletteColors,
  t: number,
  target = new Color(),
) => {
  const clamped = Math.min(Math.max(t, 0), 1);
  if (clamped < 0.5) {
    return target
      .copy(palette.base)
      .lerp(palette.mid, clamped / 0.5);
  }

  return target
    .copy(palette.mid)
    .lerp(palette.highlight, (clamped - 0.5) / 0.5);
};
