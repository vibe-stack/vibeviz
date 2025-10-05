"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Download, Minimize2, X } from "lucide-react";
import { useCallback, useState } from "react";
import {
  audioClipAtom,
  audioPlayerAtom,
  currentTimeAtom,
  durationAtom,
} from "@/features/audio/state";
import { ExportManager } from "../export-manager";
import {
  exportAudioDataAtom,
  exportProgressAtom,
  exportSettingsAtom,
} from "../state";
import type { Bitrate, Framerate, Quality, Resolution } from "../types";

interface ExportDialogProps {
  canvas: HTMLCanvasElement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ canvas, isOpen, onClose }: ExportDialogProps) {
  const [settings, setSettings] = useAtom(exportSettingsAtom);
  const [progress, setProgress] = useAtom(exportProgressAtom);
  const audioPlayer = useAtomValue(audioPlayerAtom);
  const audioClip = useAtomValue(audioClipAtom);
  const setAudioPlayer = useSetAtom(audioPlayerAtom);
  const duration = useAtomValue(durationAtom);
  const setCurrentTime = useSetAtom(currentTimeAtom);
  const setExportAudioData = useSetAtom(exportAudioDataAtom);
  const [exportManager] = useState(
    () => new ExportManager((p) => setProgress(p)),
  );
  const [isMinimized, setIsMinimized] = useState(false);

  const handleExport = useCallback(async () => {
    if (!canvas) {
      alert("Canvas not available");
      return;
    }

    if (duration === 0) {
      alert("No audio loaded. Please load an audio file first.");
      return;
    }

    try {
      await exportManager.export(
        canvas,
        settings,
        duration,
        audioPlayer,
        (time) => {
          setCurrentTime(time);
        },
        audioClip,
        (player) => {
          // Update audio player reference so waveform analyzers connect to export player
          setAudioPlayer(player);
        },
        (data) => {
          setExportAudioData(data);
        },
      );

      // Success - file saved to disk
      if (progress.state === "complete") {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [
    canvas,
    settings,
    duration,
    audioPlayer,
    audioClip,
    exportManager,
    setCurrentTime,
    setAudioPlayer,
    setExportAudioData,
    progress.state,
    onClose,
  ]);

  const handleCancel = useCallback(() => {
    if (progress.state === "rendering" || progress.state === "encoding") {
      exportManager.abort();
    }
    onClose();
  }, [progress.state, exportManager, onClose]);

  if (!isOpen) return null;

  const isExporting =
    progress.state === "rendering" || progress.state === "encoding";

  // Compact popover style when exporting and minimized
  if (isExporting && isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 w-80 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Download className="w-4 h-4 animate-pulse" />
              Exporting...
            </h3>
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>Expand</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">
                {progress.state === "rendering"
                  ? "Rendering frames..."
                  : "Encoding..."}
              </span>
              <span className="text-neutral-300 font-mono">
                {progress.currentFrame}/{progress.totalFrames}
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <div className="text-center text-xs text-neutral-400">
              {Math.round(progress.progress)}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full dialog
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExporting) {
          onClose();
        }
      }}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-[500px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Video
          </h2>
          <div className="flex items-center gap-2">
            {isExporting && (
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
              disabled={isExporting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {progress.state === "error" && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            Error: {progress.error || "Unknown error"}
          </div>
        )}

        <div className="space-y-4">
          {/* Info */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-xs">
            <strong>Tip:</strong> The canvas will be scaled to your chosen
            resolution while maintaining aspect ratio. Audio will be included!
            🎵 You can minimize this dialog to see the render in action.
          </div>

          {/* Resolution */}
          <div>
            <label
              htmlFor="resolution"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Resolution
            </label>
            <select
              id="resolution"
              value={settings.resolution}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  resolution: e.target.value as Resolution,
                })
              }
              disabled={isExporting}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="720p">720p (1280x720)</option>
              <option value="1080p">1080p (1920x1080)</option>
              <option value="1440p">1440p (2560x1440)</option>
              <option value="2k">2K (2048x1080)</option>
            </select>
          </div>

          {/* Framerate */}
          <div>
            <label
              htmlFor="framerate"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Framerate
            </label>
            <select
              id="framerate"
              value={settings.framerate}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  framerate: Number(e.target.value) as Framerate,
                })
              }
              disabled={isExporting}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value={30}>30 FPS</option>
              <option value={60}>60 FPS</option>
            </select>
          </div>

          {/* Bitrate */}
          <div>
            <label
              htmlFor="bitrate"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Bitrate
            </label>
            <select
              id="bitrate"
              value={settings.bitrate}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bitrate: Number(e.target.value) as Bitrate,
                })
              }
              disabled={isExporting}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value={1}>1 Mbps</option>
              <option value={8}>8 Mbps</option>
              <option value={20}>20 Mbps</option>
            </select>
          </div>

          {/* Quality */}
          <div>
            <label
              htmlFor="quality"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Quality: {settings.quality}%
            </label>
            <input
              id="quality"
              type="range"
              min={20}
              max={100}
              step={10}
              value={settings.quality}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  quality: Number(e.target.value) as Quality,
                })
              }
              disabled={isExporting}
              className="w-full accent-blue-500 disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>20%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Progress */}
          {isExporting && (
            <div className="pt-4 border-t border-neutral-800">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-400">
                  {progress.state === "rendering"
                    ? "Rendering..."
                    : "Encoding..."}
                </span>
                <span className="text-neutral-300">
                  {progress.currentFrame} / {progress.totalFrames} frames
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              <div className="text-center text-sm text-neutral-400 mt-2">
                {Math.round(progress.progress)}%
              </div>
            </div>
          )}

          {progress.state === "complete" && (
            <div className="pt-4 border-t border-neutral-800">
              <div className="text-center text-green-400 font-medium">
                Export complete! File saved.
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors disabled:opacity-50"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || !canvas || duration === 0}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
