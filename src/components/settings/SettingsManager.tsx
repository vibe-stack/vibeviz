"use client";

import { useState, useRef } from "react";
import { visualizerActions } from "@/state/visualizer-store";

export function SettingsManager() {
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    try {
      visualizerActions.downloadSettings();
      showMessage("success", "Settings exported successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Export failed";
      showMessage("error", errorMessage);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await visualizerActions.importFromFile(file);
      showMessage("success", "Settings imported successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Import failed";
      showMessage("error", errorMessage);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to defaults? This action cannot be undone.")) {
      try {
        visualizerActions.resetToDefaults();
        showMessage("success", "Settings reset to defaults!");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Reset failed";
        showMessage("error", errorMessage);
      }
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const settings = visualizerActions.exportSettings();
      await navigator.clipboard.writeText(settings);
      showMessage("success", "Settings copied to clipboard!");
    } catch (error) {
      showMessage("error", "Failed to copy to clipboard");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setIsImporting(true);
      visualizerActions.importSettings(text);
      showMessage("success", "Settings imported from clipboard!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to import from clipboard";
      showMessage("error", errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-lg font-semibold text-white">Settings Manager</h3>
        <p className="text-sm text-gray-400">Export, import, or reset your visualizer settings</p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-900/20 text-green-400 border border-green-800"
              : "bg-red-900/20 text-red-400 border border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Section */}
        <div className="space-y-3">
          <h4 className="text-md font-medium text-white">Export Settings</h4>
          <button
            onClick={handleExport}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Download JSON File
          </button>
          <button
            onClick={handleCopyToClipboard}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>

        {/* Import Section */}
        <div className="space-y-3">
          <h4 className="text-md font-medium text-white">Import Settings</h4>
          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded-md transition-colors"
          >
            {isImporting ? "Importing..." : "Upload JSON File"}
          </button>
          <button
            onClick={handlePasteFromClipboard}
            disabled={isImporting}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded-md transition-colors"
          >
            {isImporting ? "Importing..." : "Paste from Clipboard"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Reset Section */}
      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={handleReset}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          Reset to Defaults
        </button>
        <p className="text-xs text-gray-400 mt-2 text-center">
          This will restore all settings to their default values
        </p>
      </div>

      {/* Info Section */}
      <div className="pt-4 border-t border-gray-700">
        <div className="bg-gray-800 p-3 rounded-md">
          <h5 className="text-sm font-medium text-white mb-2">💡 Tips:</h5>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Settings are automatically saved to your browser's local storage</li>
            <li>• Export your settings to back them up or share with others</li>
            <li>• JSON files contain all visualizer configuration including colors, effects, and animations</li>
            <li>• Use clipboard import/export for quick sharing between sessions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}