"use client";

import React, { useCallback, useRef } from "react";

interface TimelineProps {
  currentTime: number;
  duration: number;
  waveform: Float32Array;
  onSeek: (time: number) => void;
  onFileSelect?: (file: File) => void;
  isLoading?: boolean;
}

export const Timeline = ({
  currentTime,
  duration,
  waveform,
  onSeek,
  onFileSelect,
  isLoading = false,
}: TimelineProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const percentage = x / rect.width;
      const time = percentage * duration;

      onSeek(time);
    },
    [duration, onSeek],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!onFileSelect) return;

      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith("audio/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    [],
  );

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Draw waveform on canvas
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const barWidth = rect.width / waveform.length;
    const maxBarHeight = rect.height * 4;

    // Draw waveform bars
    ctx.fillStyle = "#3f3f46";
    for (let i = 0; i < waveform.length; i++) {
      const barHeight = waveform[i] * maxBarHeight;
      const x = i * barWidth;
      const y = (rect.height - barHeight) / 2;

      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    }

    // Draw progress overlay
    const progressWidth = (currentTime / duration) * rect.width;
    ctx.fillStyle = "#3b82f6";
    for (let i = 0; i < waveform.length; i++) {
      const x = i * barWidth;
      if (x < progressWidth) {
        const barHeight = waveform[i] * maxBarHeight;
        const y = (rect.height - barHeight) / 2;
        ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
      }
    }
  }, [waveform, currentTime, duration]);

  // Use useEffect to draw waveform
  React.useEffect(() => {
    if (canvasRef.current && waveform.length > 0) {
      drawWaveform();
    }
  }, [drawWaveform, waveform]);

  return (
    <div className="space-y-3 p-4 bg-zinc-900/30 backdrop-blur-sm rounded-xl border border-zinc-800/50">
      <div
        ref={timelineRef}
        className="relative h-16 cursor-pointer rounded-lg overflow-hidden bg-zinc-800/30"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Playhead */}
        {duration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        )}

        {/* Drop zone overlay */}
        {waveform.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/50">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-zinc-700/50 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <p className="text-sm text-zinc-400">
                {isLoading ? "Loading audio..." : "Drop MP3 file here"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between text-sm text-zinc-400 px-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration || 0)}</span>
      </div>
    </div>
  );
};
