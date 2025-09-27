"use client";

import { VolumeSlider } from "./VolumeSlider";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  disabled?: boolean;
}

export const PlaybackControls = ({
  isPlaying,
  onPlay,
  onPause,
  volume,
  onVolumeChange,
  disabled = false,
}: PlaybackControlsProps) => {
  return (
    <div className="flex items-center justify-center space-x-6">
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        className="w-12 h-12 rounded-full bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 flex items-center justify-center hover:bg-zinc-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPlaying ? (
          <svg
            className="w-6 h-6 text-zinc-200"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-label="Pause"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-zinc-200 ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-label="Play"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <VolumeSlider volume={volume} onVolumeChange={onVolumeChange} />
    </div>
  );
};
