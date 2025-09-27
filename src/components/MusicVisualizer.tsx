"use client";

import { useCallback } from "react";
import { useAudio } from "@/hooks/useAudio";
import { FileUpload } from "@/components/audio/FileUpload";
import { VisualizerScene } from "@/components/visualizer/VisualizerScene";
import { Timeline } from "@/components/timeline/Timeline";
import { PlaybackControls } from "@/components/timeline/PlaybackControls";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export const MusicVisualizer = () => {
  const { audio, loadAudio, play, pause, seek, setVolume, getFrequencyData } =
    useAudio();

  const handleFileSelect = useCallback(
    async (file: File) => {
      await loadAudio(file);
    },
    [loadAudio],
  );

  const hasAudio = Boolean(audio.data);

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {hasAudio && <SettingsPanel />}

      <div className="flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center p-8">
          {!hasAudio ? (
            <div className="w-full max-w-md">
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-4xl font-semibold tracking-tight text-zinc-100">
                  VibeViz
                </h1>
                <p className="text-sm text-zinc-400">
                  Upload your track to unlock immersive visual modes.
                </p>
              </div>
              <FileUpload
                onFileSelect={handleFileSelect}
                isLoading={audio.isLoading}
              />
              {audio.error && (
                <div className="mt-4 rounded-lg border border-red-800/40 bg-red-900/20 p-3 text-sm text-red-200">
                  {audio.error}
                </div>
              )}
            </div>
          ) : (
            <VisualizerScene getFrequencyData={getFrequencyData} />
          )}
        </div>

        {hasAudio && audio.data && (
          <div className="space-y-4 p-6">
            <Timeline
              currentTime={audio.currentTime}
              duration={audio.duration}
              waveform={audio.data.waveform}
              onSeek={seek}
            />
            <PlaybackControls
              isPlaying={audio.isPlaying}
              onPlay={play}
              onPause={pause}
              volume={audio.volume}
              onVolumeChange={setVolume}
              disabled={audio.isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};
