import type { AudioClip } from "../audio/types";
import type { Keyframe, SceneObject } from "../scene/types";

export type ProjectMetadata = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string; // Base64 data URL
};

export type ProjectData = {
  metadata: ProjectMetadata;
  scene: {
    objects: SceneObject[];
    keyframes: Keyframe[];
  };
  audio: {
    clip: AudioClip | null;
  };
  assets: {
    glbFiles: Record<string, string>; // optional in-memory mapping (objectId -> data URL)
  };
};

export type StoredAssetReference = {
  assetKey: string;
  filename: string;
  mimeType?: string;
};

export type StoredAudioClipMetadata = {
  id: string;
  name: string;
  duration: number;
  assetKey?: string;
  mimeType?: string;
  sourceUrl?: string;
};

export type StoredProjectData = {
  metadata: ProjectMetadata;
  scene: {
    objects: SceneObject[];
    keyframes: Keyframe[];
  };
  audio: {
    clip: StoredAudioClipMetadata | null;
  };
  assets: {
    glbFiles: Record<string, StoredAssetReference>; // objectId -> asset reference
  };
};
