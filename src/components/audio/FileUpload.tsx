"use client";

import { useCallback } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload = ({
  onFileSelect,
  isLoading = false,
}: FileUploadProps) => {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith("audio/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
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

  return (
    <div
      className="relative border-2 border-dashed border-zinc-700/50 rounded-2xl p-8 text-center transition-colors hover:border-zinc-600/50 bg-zinc-900/20 backdrop-blur-sm"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        disabled={isLoading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="space-y-3">
        <div className="w-12 h-12 mx-auto bg-zinc-800/50 rounded-xl flex items-center justify-center">
          <svg
            className="w-6 h-6 text-zinc-400"
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
        <div>
          <p className="text-zinc-300 font-medium">
            {isLoading ? "Processing audio..." : "Drop your MP3 file here"}
          </p>
          <p className="text-zinc-500 text-sm mt-1">or click to browse</p>
        </div>
      </div>
    </div>
  );
};
