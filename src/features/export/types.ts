export type Resolution = "720p" | "1080p" | "1440p" | "2k";
export type Framerate = 30 | 60;
export type Bitrate = 1 | 8 | 20; // in Mbps
export type Quality = number; // 20-100%

export interface ExportSettings {
  resolution: Resolution;
  framerate: Framerate;
  bitrate: Bitrate;
  quality: Quality;
}

export const RESOLUTION_MAP: Record<
  Resolution,
  { width: number; height: number }
> = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
  "2k": { width: 2048, height: 1080 },
};

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  resolution: "720p",
  framerate: 30,
  bitrate: 8,
  quality: 100,
};

export type ExportState =
  | "idle"
  | "rendering"
  | "encoding"
  | "complete"
  | "error";

export interface ExportProgress {
  state: ExportState;
  currentFrame: number;
  totalFrames: number;
  progress: number; // 0-100
  error?: string;
}

export interface ExportAudioData {
  frameRate: number;
  totalFrames: number;
  duration: number;
  binCount: number;
  data: Float32Array;
}
