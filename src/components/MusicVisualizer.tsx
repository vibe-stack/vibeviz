"use client";

import { useState, useCallback } from "react";
import { useAudio } from "../hooks/useAudio";
import { FileUpload } from "./audio/FileUpload";
import { VisualizerScene } from "./visualizer/VisualizerScene";
import { Timeline } from "./timeline/Timeline";
import { PlaybackControls } from "./timeline/PlaybackControls";
import { SettingsPanel } from "./settings/SettingsPanel";

export const MusicVisualizer = () => {
  const {
    audioData,
    audioState,
    loadAudio,
    play,
    pause,
    seek,
    setVolume,
    getFrequencyData,
  } = useAudio();
  const [radius, setRadius] = useState(5);
  const [maxBarHeight, setMaxBarHeight] = useState(3);

  const handleFileSelect = useCallback(
    async (file: File) => {
      await loadAudio(file);
    },
    [loadAudio],
  );

  const frequencyData = getFrequencyData();

  return (
    <div className="h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden">
      {/* Settings Panel */}
      {audioData && (
        <SettingsPanel
          radius={radius}
          maxBarHeight={maxBarHeight}
          onRadiusChange={setRadius}
          onMaxBarHeightChange={setMaxBarHeight}
        />
      )}

      <div className="h-full flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          {!audioData ? (
            <div className="max-w-md w-full">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-zinc-100 mb-2">
                  VibeViz
                </h1>
                <p className="text-zinc-400">
                  Upload an MP3 file to start visualizing
                </p>
              </div>
              <FileUpload
                onFileSelect={handleFileSelect}
                isLoading={audioState.isLoading}
              />
              {audioState.error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-red-200 text-sm">
                  {audioState.error}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full">
              <VisualizerScene
                frequencyData={frequencyData}
                radius={radius}
                maxBarHeight={maxBarHeight}
              />
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        {audioData && (
          <div className="p-6 space-y-4">
            <Timeline
              currentTime={audioState.currentTime}
              duration={audioState.duration}
              waveform={audioData.waveform}
              onSeek={seek}
            />
            <PlaybackControls
              isPlaying={audioState.isPlaying}
              onPlay={play}
              onPause={pause}
              volume={audioState.volume}
              onVolumeChange={setVolume}
              disabled={audioState.isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};
