"use client";

import { useCallback, useRef, useState } from "react";
import { useAudio } from "@/hooks/useAudio";
import { VisualizerScene, type VisualizerSceneRef } from "@/components/visualizer/VisualizerScene";
import { Timeline } from "@/components/timeline/Timeline";
import { PlaybackControls } from "@/components/timeline/PlaybackControls";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { VideoExporter, type RenderFrameInfo } from "@/utils/export";
import { createFrequencySampler } from "@/utils/frequency-sampler";

export const MusicVisualizer = () => {
  const {
    audio,
    loadAudio,
    play,
    pause,
    seek,
    setVolume,
    getFrequencyData: getFrequencyDataFromAudio,
  } =
    useAudio();
  
  const visualizerRef = useRef<VisualizerSceneRef>(null);
  const [isExporting, setIsExporting] = useState(false);
  const frequencyOverrideRef = useRef<Uint8Array | null>(null);

  const getFrequencyData = useCallback(() => {
    if (frequencyOverrideRef.current) {
      return frequencyOverrideRef.current;
    }

    return getFrequencyDataFromAudio();
  }, [getFrequencyDataFromAudio]);

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

    const exporter = new VideoExporter();
    const frameRate = 30; // Reduce to 30fps for faster export
    const sampler = createFrequencySampler(audio.data.buffer, {
      fftSize: 512,
      smoothing: 0.8,
      minDecibels: -100,
      maxDecibels: -30,
    });

    let exportPrepared = false;

    try {
      pause();
      seek(0);
      sampler.reset();

      await visualizerRef.current.beginExport(frameRate);
      exportPrepared = true;

      await exporter.exportVideo({
        canvas,
        audioBuffer: audio.data.buffer,
        duration: audio.duration,
        frameRate,
        bitrate: 12_000_000,
        onProgress: (frame, total) => {
          if (frame === total || frame % Math.ceil(frameRate / 2) === 0) {
            const percentage = ((frame / total) * 100).toFixed(1);
            console.log(`Export progress: ${frame}/${total} frames (${percentage}%)`);
          }
        },
        renderFrame: async ({ time }: RenderFrameInfo) => {
          frequencyOverrideRef.current = sampler.sample(time);
          await visualizerRef.current?.renderFrameAt(time);
        },
      });

      console.log("Export completed successfully");
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      frequencyOverrideRef.current = null;

      if (exportPrepared && visualizerRef.current) {
        await visualizerRef.current.finishExport();
      }

      seek(0);
      setIsExporting(false);
    }
  }, [audio, pause, seek]);

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
