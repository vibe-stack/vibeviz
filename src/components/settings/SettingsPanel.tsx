"use client";

interface SettingsPanelProps {
  radius: number;
  maxBarHeight: number;
  onRadiusChange: (radius: number) => void;
  onMaxBarHeightChange: (height: number) => void;
}

export const SettingsPanel = ({
  radius,
  maxBarHeight,
  onRadiusChange,
  onMaxBarHeightChange,
}: SettingsPanelProps) => {
  return (
    <div className="fixed top-4 right-4 w-72 p-4 bg-zinc-900/80 backdrop-blur-lg border border-zinc-700/50 rounded-xl shadow-xl z-50">
      <h3 className="text-lg font-medium text-zinc-200 mb-4">
        Visualization Settings
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Circle Radius
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={3}
              max={8}
              step={0.1}
              value={radius}
              onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>3</span>
              <span className="text-zinc-300">{radius.toFixed(1)}</span>
              <span>8</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Max Bar Height
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={1}
              max={6}
              step={0.1}
              value={maxBarHeight}
              onChange={(e) => onMaxBarHeightChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>1</span>
              <span className="text-zinc-300">{maxBarHeight.toFixed(1)}</span>
              <span>6</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};
