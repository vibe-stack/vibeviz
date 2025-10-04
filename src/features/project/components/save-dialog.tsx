"use client";

import { Save, X } from "lucide-react";
import { useState, useEffect } from "react";

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectName: string) => void;
  currentProjectName?: string;
}

export function SaveDialog({
  isOpen,
  onClose,
  onSave,
  currentProjectName,
}: SaveDialogProps) {
  const [projectName, setProjectName] = useState(
    currentProjectName || "Untitled Project"
  );

  useEffect(() => {
    if (currentProjectName) {
      setProjectName(currentProjectName);
    }
  }, [currentProjectName]);

  const handleSave = () => {
    if (projectName.trim()) {
      onSave(projectName.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-[500px] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-50 flex items-center gap-2">
                <Save className="w-5 h-5 text-emerald-500" />
                Save Project
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Save your project locally in your browser
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="project-name"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter project name"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Save Project
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
