"use client";

import React, { useCallback, useRef, useState } from "react";

interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

export const VolumeSlider = ({
  volume,
  onVolumeChange,
  className = "",
}: VolumeSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      onVolumeChange(percentage);
    },
    [onVolumeChange],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      setIsDragging(true);
      handleInteraction(event.clientX);
    },
    [handleInteraction],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isDragging) {
        handleInteraction(event.clientX);
      }
    },
    [isDragging, handleInteraction],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle mouse events globally when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Volume Icon */}
      <div className="w-5 h-5 text-zinc-400">
        {volume === 0 ? (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.54-.77 2.2-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.34-1.71-.71z" />
          </svg>
        ) : volume < 0.5 ? (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 9v6h4l5 5V4l-5 5H7z" />
          </svg>
        ) : (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </div>

      {/* Slider Track */}
      <div
        ref={sliderRef}
        className="relative w-20 h-1 bg-zinc-700 rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        {/* Filled portion */}
        <div
          className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-150"
          style={{ width: `${volume * 100}%` }}
        />
      </div>
    </div>
  );
};
