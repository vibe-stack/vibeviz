"use client";

import { saveAs } from "file-saver";
import JSZip from "jszip";
import type { AudioClip } from "@/features/audio/types";
import type { SceneObject } from "@/features/scene/types";
import type { ProjectData, ProjectMetadata, StoredProjectData } from "./types";

const PROJECTS_STORAGE_KEY = "vibeviz_projects";

// ------------------------------
// Local storage helpers
// ------------------------------

export function saveProjectLocally(project: StoredProjectData): void {
  const projects = getLocalProjects();
  const existingIndex = projects.findIndex(
    (p) => p.metadata.id === project.metadata.id,
  );

  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }

  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

export function getLocalProjects(): StoredProjectData[] {
  const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as StoredProjectData[];
  } catch (error) {
    console.error("Failed to parse projects from localStorage:", error);
    return [];
  }
}

export function getProjectMetadataList(): ProjectMetadata[] {
  const projects = getLocalProjects();
  return projects.map((p) => p.metadata);
}

export function deleteLocalProject(projectId: string): void {
  const projects = getLocalProjects();
  const filtered = projects.filter((p) => p.metadata.id !== projectId);
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filtered));
}

export function loadLocalProject(projectId: string): StoredProjectData | null {
  const projects = getLocalProjects();
  return projects.find((p) => p.metadata.id === projectId) ?? null;
}

// ------------------------------
// ZIP import/export helpers
// ------------------------------

export async function exportProjectToZip(
  project: ProjectData,
  filename?: string,
): Promise<void> {
  const zip = new JSZip();

  const projectJson = {
    metadata: project.metadata,
    scene: project.scene,
    audio: {
      clip: project.audio.clip
        ? {
            id: project.audio.clip.id,
            name: project.audio.clip.name,
            duration: project.audio.clip.duration,
          }
        : null,
    },
  };
  zip.file("project.json", JSON.stringify(projectJson, null, 2));

  if (project.audio.clip) {
    const audioBlob = await resolveAudioBlob(project.audio.clip);
    if (audioBlob) {
      zip.file(`audio/${project.audio.clip.name}`, audioBlob);
    }
  }

  const glbFolder = zip.folder("glb");
  if (glbFolder) {
    for (const obj of project.scene.objects) {
      if (obj.type !== "glb") continue;

      const filenameForObj = deriveGlbFilename(obj);
      const glbBlob = await resolveGlbBlob(
        obj,
        project.assets.glbFiles[obj.id],
      );
      if (glbBlob) {
        glbFolder.file(filenameForObj, glbBlob);
      }
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const zipFilename = filename || `${project.metadata.name}.zip`;
  saveAs(blob, zipFilename);
}

export async function importProjectFromZip(
  file: File,
): Promise<ProjectData | null> {
  try {
    const zip = await JSZip.loadAsync(file);
    const projectJsonFile = zip.file("project.json");
    if (!projectJsonFile) {
      throw new Error("project.json not found in ZIP");
    }

    const projectJsonText = await projectJsonFile.async("text");
    const projectJson = JSON.parse(projectJsonText);

    const sceneObjects: SceneObject[] = projectJson.scene?.objects
      ? JSON.parse(JSON.stringify(projectJson.scene.objects))
      : [];
    const keyframes = projectJson.scene?.keyframes
      ? JSON.parse(JSON.stringify(projectJson.scene.keyframes))
      : [];

    let audioClip = projectJson.audio?.clip || null;

    const audioFolder = zip.folder("audio");
    if (audioClip && audioFolder) {
      const audioFile = audioFolder.file(audioClip.name);
      if (audioFile) {
        const audioBlob = await audioFile.async("blob");
        const audioUrl = URL.createObjectURL(audioBlob);
        audioClip = {
          ...audioClip,
          url: audioUrl,
          blob: audioBlob,
        };
      }
    }

    const glbReferences: Record<string, string> = {};
    const glbFolder = zip.folder("glb");
    if (glbFolder) {
      const glbFileList = glbFolder.file(/.*/);
      for (const glbFile of glbFileList) {
        const blob = await glbFile.async("blob");
        const dataUrl = await fileToDataUrl(blob);
        const objectUrl = URL.createObjectURL(blob);

        for (let i = 0; i < sceneObjects.length; i += 1) {
          const obj = sceneObjects[i];
          if (obj.type === "glb" && obj.url && obj.url.includes(glbFile.name)) {
            sceneObjects[i] = { ...obj, url: objectUrl };
            glbReferences[obj.id] = dataUrl;
          }
        }
      }
    }

    return {
      metadata: projectJson.metadata,
      scene: {
        objects: sceneObjects,
        keyframes,
      },
      audio: {
        clip: audioClip,
      },
      assets: {
        glbFiles: glbReferences,
      },
    };
  } catch (error) {
    console.error("Failed to import project from ZIP:", error);
    return null;
  }
}

// ------------------------------
// Shared utilities
// ------------------------------

export async function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

export function generateThumbnail(
  canvas: HTMLCanvasElement | null,
): string | undefined {
  if (!canvas) return undefined;
  try {
    const thumbnailCanvas = document.createElement("canvas");
    const ctx = thumbnailCanvas.getContext("2d");
    if (!ctx) return undefined;

    thumbnailCanvas.width = 320;
    thumbnailCanvas.height = 180;
    ctx.drawImage(canvas, 0, 0, 320, 180);
    return thumbnailCanvas.toDataURL("image/jpeg", 0.7);
  } catch (error) {
    console.error("Failed to generate thumbnail:", error);
    return undefined;
  }
}

// ------------------------------
// Internal helpers
// ------------------------------

async function resolveAudioBlob(clip: AudioClip): Promise<Blob | null> {
  if (clip.blob) {
    return clip.blob;
  }

  return fetchBlobFromUrl(clip.url);
}

async function resolveGlbBlob(
  obj: SceneObject,
  storedDataUrl?: string,
): Promise<Blob | null> {
  if (storedDataUrl?.startsWith("data:")) {
    try {
      return await dataUrlToBlob(storedDataUrl);
    } catch (error) {
      console.warn("Failed to decode stored GLB data URL:", error);
    }
  }

  if (obj.type === "glb") {
    return fetchBlobFromUrl(obj.url);
  }

  return null;
}

async function fetchBlobFromUrl(url: string | undefined): Promise<Blob | null> {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.blob();
  } catch (error) {
    console.warn("Failed to fetch blob from URL:", error);
    return null;
  }
}

function deriveGlbFilename(obj: SceneObject): string {
  if (obj.type !== "glb") {
    return "asset.glb";
  }

  const baseName = obj.name || "model";
  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return `${sanitized || "model"}-${obj.id}.glb`;
}
