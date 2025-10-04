import { atom } from "jotai";
import type { ExportProgress, ExportSettings } from "./types";
import { DEFAULT_EXPORT_SETTINGS } from "./types";

export const exportSettingsAtom = atom<ExportSettings>(DEFAULT_EXPORT_SETTINGS);

export const exportProgressAtom = atom<ExportProgress>({
  state: "idle",
  currentFrame: 0,
  totalFrames: 0,
  progress: 0,
});

export const isExportingAtom = atom(
  (get) => get(exportProgressAtom).state === "rendering" || get(exportProgressAtom).state === "encoding"
);
