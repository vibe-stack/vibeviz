import { atom } from "jotai";
import type * as Tone from "tone";
import type { AudioClip } from "./types";

export const audioClipAtom = atom<AudioClip | null>(null);
export const currentTimeAtom = atom<number>(0);
export const isPlayingAtom = atom<boolean>(false);

// Derived atom - duration comes from audio clip
export const durationAtom = atom((get) => {
  const clip = get(audioClipAtom);
  return clip?.duration ?? 0;
});

// Shared audio player reference for analyzers to connect to
export const audioPlayerAtom = atom<Tone.Player | null>(null);
