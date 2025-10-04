import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { useCallback } from "react";
import { sceneObjectsAtom, keyframesAtom } from "@/features/scene/state";
import { audioClipAtom } from "@/features/audio/state";
import {
  currentProjectMetadataAtom,
  recentProjectsAtom,
} from "../state";
import {
  saveProjectLocally,
  exportProjectToZip,
  importProjectFromZip,
  getProjectMetadataList,
  loadLocalProject,
  deleteLocalProject,
  generateThumbnail,
  dataUrlToBlob,
} from "../utils";
import type {
  ProjectData,
  ProjectMetadata,
  StoredProjectData,
  StoredAudioClipMetadata,
  StoredAssetReference,
} from "../types";
import { storeProjectAsset, getProjectAsset, deleteProjectAssets } from "../storage";
import type { AudioClip } from "@/features/audio/types";
import type { SceneObject } from "@/features/scene/types";

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sanitizeFilename(name: string, fallback: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return sanitized || fallback;
}

function buildGlbFilename(obj: SceneObject): string {
  const baseName = "name" in obj ? obj.name : "model";
  return `${sanitizeFilename(baseName, "model")}-${obj.id}.glb`;
}

async function fetchBlob(url: string | undefined): Promise<Blob | null> {
  if (!url) return null;
  if (url.startsWith("data:")) {
    try {
      return await dataUrlToBlob(url);
    } catch (error) {
      console.warn("Failed to decode data URL:", error);
      return null;
    }
  }
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.blob();
  } catch (error) {
    console.warn("Failed to fetch blob from URL:", error);
    return null;
  }
}

async function persistAudioAsset(
  projectId: string,
  clip: AudioClip | null,
): Promise<StoredAudioClipMetadata | null> {
  if (!clip) return null;

  const blob = clip.blob ?? (await fetchBlob(clip.url));
  if (!blob) {
    return {
      id: clip.id,
      name: clip.name,
      duration: clip.duration,
      sourceUrl: clip.url,
    };
  }

  try {
    const stored = await storeProjectAsset(projectId, "audio", clip.name, blob);
    return {
      id: clip.id,
      name: clip.name,
      duration: clip.duration,
      assetKey: stored.assetKey,
      mimeType: stored.mimeType,
      sourceUrl: clip.url,
    };
  } catch (error) {
    console.error("Failed to store audio asset:", error);
    return {
      id: clip.id,
      name: clip.name,
      duration: clip.duration,
      sourceUrl: clip.url,
    };
  }
}

async function persistGlbAsset(
  projectId: string,
  obj: SceneObject,
): Promise<StoredAssetReference | null> {
  if (obj.type !== "glb") return null;

  const blob = await fetchBlob(obj.url);
  if (!blob) {
    console.warn("Skipping GLB asset (unreachable) for object", obj.id);
    return null;
  }

  try {
    const stored = await storeProjectAsset(projectId, "glb", buildGlbFilename(obj), blob);
    return {
      assetKey: stored.assetKey,
      filename: stored.filename,
      mimeType: stored.mimeType,
    };
  } catch (error) {
    console.error("Failed to store GLB asset:", error);
    return null;
  }
}

async function persistProjectAssets(project: ProjectData): Promise<StoredProjectData> {
  await deleteProjectAssets(project.metadata.id);

  const glbReferences: Record<string, StoredAssetReference> = {};
  for (const obj of project.scene.objects) {
    if (obj.type !== "glb") continue;
    const reference = await persistGlbAsset(project.metadata.id, obj);
    if (reference) {
      glbReferences[obj.id] = reference;
    }
  }

  const storedAudio = await persistAudioAsset(project.metadata.id, project.audio.clip);

  return {
    metadata: project.metadata,
    scene: {
      objects: cloneJson(project.scene.objects),
      keyframes: cloneJson(project.scene.keyframes),
    },
    audio: {
      clip: storedAudio,
    },
    assets: {
      glbFiles: glbReferences,
    },
  };
}

async function restoreProjectFromStored(stored: StoredProjectData): Promise<ProjectData> {
  const objects = cloneJson(stored.scene.objects);
  const keyframes = cloneJson(stored.scene.keyframes);

  for (let i = 0; i < objects.length; i += 1) {
    const obj = objects[i];
    if (obj.type !== "glb") continue;
    const reference = stored.assets.glbFiles[obj.id];
    if (!reference) continue;

    const asset = await getProjectAsset(reference.assetKey);
    if (!asset) continue;

    const objectUrl = URL.createObjectURL(asset.blob);
    objects[i] = { ...obj, url: objectUrl };
  }

  let audioClip: AudioClip | null = null;
  const clipMeta = stored.audio.clip;
  if (clipMeta) {
    let blob: Blob | null = null;
    if (clipMeta.assetKey) {
      const asset = await getProjectAsset(clipMeta.assetKey);
      if (asset) {
        blob = asset.blob;
      }
    }

    if (!blob && clipMeta.sourceUrl?.startsWith("data:")) {
      blob = await fetchBlob(clipMeta.sourceUrl);
    }

    if (blob) {
      audioClip = {
        id: clipMeta.id,
        name: clipMeta.name,
        duration: clipMeta.duration,
        url: URL.createObjectURL(blob),
        blob,
      };
    } else if (clipMeta.sourceUrl) {
      audioClip = {
        id: clipMeta.id,
        name: clipMeta.name,
        duration: clipMeta.duration,
        url: clipMeta.sourceUrl,
      };
    } else {
      audioClip = null;
    }
  }

  return {
    metadata: stored.metadata,
    scene: {
      objects,
      keyframes,
    },
    audio: {
      clip: audioClip,
    },
    assets: {
      glbFiles: {},
    },
  };
}

export function useProjectManager() {
  const sceneObjects = useAtomValue(sceneObjectsAtom);
  const keyframes = useAtomValue(keyframesAtom);
  const audioClip = useAtomValue(audioClipAtom);

  const [currentProjectMetadata, setCurrentProjectMetadata] = useAtom(
    currentProjectMetadataAtom,
  );
  const setRecentProjects = useSetAtom(recentProjectsAtom);

  const setSceneObjects = useSetAtom(sceneObjectsAtom);
  const setKeyframes = useSetAtom(keyframesAtom);
  const setAudioClip = useSetAtom(audioClipAtom);

  const createProjectData = useCallback(
    async (
      name: string,
      canvas: HTMLCanvasElement | null,
      projectId?: string,
    ): Promise<ProjectData> => {
      const now = new Date().toISOString();
      const id = projectId || currentProjectMetadata?.id || nanoid();
      const thumbnail = generateThumbnail(canvas) ?? currentProjectMetadata?.thumbnail;

      const metadata: ProjectMetadata = {
        id,
        name,
        createdAt: currentProjectMetadata?.createdAt ?? now,
        updatedAt: now,
        thumbnail,
      };

      return {
        metadata,
        scene: {
          objects: cloneJson(sceneObjects),
          keyframes: cloneJson(keyframes),
        },
        audio: {
          clip: audioClip ? { ...audioClip } : null,
        },
        assets: {
          glbFiles: {},
        },
      };
    },
    [sceneObjects, keyframes, audioClip, currentProjectMetadata],
  );

  const saveProject = useCallback(
    async (name: string, canvas: HTMLCanvasElement | null) => {
      const projectData = await createProjectData(name, canvas, currentProjectMetadata?.id);
      const storedProject = await persistProjectAssets(projectData);
      saveProjectLocally(storedProject);
      setCurrentProjectMetadata(storedProject.metadata);

      const recent = getProjectMetadataList();
      setRecentProjects(
        recent.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
      );
    },
    [createProjectData, currentProjectMetadata, setCurrentProjectMetadata, setRecentProjects],
  );

  const exportProject = useCallback(
    async (name: string, canvas: HTMLCanvasElement | null) => {
      const projectData = await createProjectData(name, canvas, currentProjectMetadata?.id);
      await exportProjectToZip(projectData);
    },
    [createProjectData, currentProjectMetadata],
  );

  const loadProject = useCallback(
    async (projectId: string) => {
      const stored = loadLocalProject(projectId);
      if (!stored) {
        console.error("Project not found:", projectId);
        return false;
      }

      const project = await restoreProjectFromStored(stored);
      setSceneObjects(project.scene.objects);
      setKeyframes(project.scene.keyframes);
      setAudioClip(project.audio.clip);
      setCurrentProjectMetadata(project.metadata);
      return true;
    },
    [setSceneObjects, setKeyframes, setAudioClip, setCurrentProjectMetadata],
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      await deleteProjectAssets(projectId);
      deleteLocalProject(projectId);

      const recent = getProjectMetadataList();
      setRecentProjects(
        recent.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
      );

      if (currentProjectMetadata?.id === projectId) {
        setCurrentProjectMetadata(null);
      }
    },
    [currentProjectMetadata, setCurrentProjectMetadata, setRecentProjects],
  );

  const newProject = useCallback(() => {
    setSceneObjects([]);
    setKeyframes([]);
    setAudioClip(null);
    setCurrentProjectMetadata(null);
  }, [setSceneObjects, setKeyframes, setAudioClip, setCurrentProjectMetadata]);

  const loadRecentProjects = useCallback(() => {
    const recent = getProjectMetadataList();
    setRecentProjects(
      recent.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    );
  }, [setRecentProjects]);

  const importProject = useCallback(
    async (file: File) => {
      const project = await importProjectFromZip(file);
      if (!project) {
        console.error("Failed to import project");
        return false;
      }

      const storedProject = await persistProjectAssets(project);
      saveProjectLocally(storedProject);

      const recent = getProjectMetadataList();
      setRecentProjects(
        recent.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
      );

      await loadProject(storedProject.metadata.id);
      return true;
    },
    [loadProject, setRecentProjects],
  );

  return {
    currentProjectMetadata,
    saveProject,
    exportProject,
    importProject,
    loadProject,
    deleteProject,
    newProject,
    loadRecentProjects,
  };
}
