"use client";

import { VolumeSlider } from "./VolumeSlider";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onExport?: () => void;
  disabled?: boolean;
  isExporting?: boolean;
}

export const PlaybackControls = ({
  isPlaying,
  onPlay,
  onPause,
  volume,
  onVolumeChange,
  onExport,
  disabled = false,
  isExporting = false,
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

      {onExport && (
        <button
          onClick={onExport}
          disabled={disabled || isExporting}
          className="h-10 px-4 rounded-lg bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 flex items-center justify-center space-x-2 hover:bg-zinc-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <svg
                className="w-4 h-4 text-zinc-200 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm text-zinc-200">Exporting...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 text-zinc-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm text-zinc-200">Export</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
