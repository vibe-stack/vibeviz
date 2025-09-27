"use client";

import { useCallback } from "react";
import { useAudio } from "@/hooks/useAudio";
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



  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="flex h-full">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center p-8">
            <VisualizerScene getFrequencyData={getFrequencyData} />
          </div>

          <div className="space-y-4 border-t border-zinc-800/60 bg-zinc-950/40 p-6">
            <Timeline
              currentTime={audio.currentTime}
              duration={audio.duration}
              waveform={audio.data?.waveform || new Float32Array(0)}
              onSeek={seek}
              onFileSelect={handleFileSelect}
              isLoading={audio.isLoading}
            />
            <PlaybackControls
              isPlaying={audio.isPlaying}
              onPlay={play}
              onPause={pause}
              volume={audio.volume}
              onVolumeChange={setVolume}
              disabled={audio.isLoading}
            />
            {audio.error && (
              <div className="rounded-lg border border-red-800/40 bg-red-900/20 p-3 text-sm text-red-200">
                {audio.error}
              </div>
            )}
          </div>
        </div>

        <SettingsPanel />
      </div>
    </div>
  );
};
