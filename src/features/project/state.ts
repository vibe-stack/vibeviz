import { atom } from "jotai";
import type { ProjectMetadata } from "./types";

export const currentProjectMetadataAtom = atom<ProjectMetadata | null>(null);
export const recentProjectsAtom = atom<ProjectMetadata[]>([]);
