"use client";

import React, { useCallback, useRef } from "react";

interface TimelineProps {
  currentTime: number;
  duration: number;
  waveform: Float32Array;
  onSeek: (time: number) => void;
}

export const Timeline = ({
  currentTime,
  duration,
  waveform,
  onSeek,
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
    const maxBarHeight = rect.height * 0.8;

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
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-zinc-400 px-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
