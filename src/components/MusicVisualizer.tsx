"use client";

import { useCallback, useRef, useState } from "react";
import { useAudio } from "@/hooks/useAudio";
import { VisualizerScene, type VisualizerSceneRef } from "@/components/visualizer/VisualizerScene";
import { Timeline } from "@/components/timeline/Timeline";
import { PlaybackControls } from "@/components/timeline/PlaybackControls";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { VideoExporter } from "@/utils/export";

export const MusicVisualizer = () => {
  const { audio, loadAudio, play, pause, seek, setVolume, getFrequencyData } =
    useAudio();
  
  const visualizerRef = useRef<VisualizerSceneRef>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      await loadAudio(file);
    },
    [loadAudio],
  );

  const handleExport = useCallback(async () => {
    if (!audio.data || !visualizerRef.current) {
      console.error("No audio data or visualizer available for export");
      return;
    }

    const canvas = visualizerRef.current.getCanvas();
    
    if (!canvas) {
      console.error("Canvas not available for export");
      return;
    }

    setIsExporting(true);

    try {
      const exporter = new VideoExporter();
      await exporter.exportVideo({
        canvas,
        audioBuffer: audio.data.buffer,
        duration: audio.duration,
        frameRate: 30,
        bitrate: 2e6,
        onStartPlayback: async () => {
          seek(0);
          play();
        },
        onStopPlayback: async () => {
          pause();
          seek(0);
        },
      });

      console.log("Export completed successfully");
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [audio, seek, play, pause]);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="flex h-full">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center p-8">
            <VisualizerScene ref={visualizerRef} getFrequencyData={getFrequencyData} />
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
              onExport={handleExport}
              disabled={audio.isLoading}
              isExporting={isExporting}
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
