"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  Magnet,
  Minus,
  Pause,
  Play,
  Plus,
  Square,
  Upload,
  Volume2,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useRef } from "react";
import {
  audioClipAtom,
  currentTimeAtom,
  durationAtom,
  isPlayingAtom,
} from "@/features/audio/state";
import type { AudioClip } from "@/features/audio/types";
import {
  audioVolumeAtom,
  keyframeSnapEnabledAtom,
  timelineZoomAtom,
} from "../state";

export function TimelineControls() {
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const duration = useAtomValue(durationAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const setAudioClip = useSetAtom(audioClipAtom);
  const [zoom, setZoom] = useAtom(timelineZoomAtom);
  const [snapEnabled, setSnapEnabled] = useAtom(keyframeSnapEnabledAtom);
  const [volume, setVolume] = useAtom(audioVolumeAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);

        await new Promise<void>((resolve, reject) => {
          audio.addEventListener("loadedmetadata", () => resolve());
          audio.addEventListener("error", reject);
        });

        const clip: AudioClip = {
          id: nanoid(),
          name: file.name,
          url,
          duration: audio.duration,
          blob: file,
        };

        setAudioClip(clip);
        setCurrentTime(0);
        setIsPlaying(false);

        console.log("Audio loaded:", clip.name, "Duration:", clip.duration);
      } catch (error) {
        console.error("Failed to load audio:", error);
      }
    },
    [setAudioClip, setCurrentTime, setIsPlaying],
  );

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
      {/* Left side - Audio controls */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
        title="Load audio"
      >
        <Upload className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={duration === 0}
          className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          disabled={duration === 0}
          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1" />

      {/* Right side - Timeline settings */}
      <div className="flex items-center gap-4">
        {/* Time display */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-neutral-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
            title="Audio volume"
          />
          <span className="text-xs text-neutral-500 w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom(Math.max(50, zoom - 25))}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Zoom out"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-xs text-neutral-500 w-12 text-center">
            {zoom}px/s
          </span>
          <button
            type="button"
            onClick={() => setZoom(Math.min(500, zoom + 25))}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Zoom in"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Snap toggle */}
        <button
          type="button"
          onClick={() => setSnapEnabled(!snapEnabled)}
          className={`p-2 rounded-lg transition-colors ${
            snapEnabled
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-neutral-800 hover:bg-neutral-700 text-neutral-400"
          }`}
          title={`Keyframe snapping ${snapEnabled ? "enabled" : "disabled"}`}
        >
          <Magnet className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
