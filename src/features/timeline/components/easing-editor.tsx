"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { keyframesAtom } from "@/features/scene/state";
import { selectedKeyframeIdsAtom } from "@/features/timeline/state";
import { EASING_CATEGORIES, getEasingFunction } from "@/features/timeline/easing";

export function EasingEditor() {
  const keyframes = useAtomValue(keyframesAtom);
  const selectedIds = useAtomValue(selectedKeyframeIdsAtom);
  const setKeyframes = useSetAtom(keyframesAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get selected keyframes
  const selectedKeyframes = keyframes.filter((kf) =>
    selectedIds.includes(kf.id),
  );

  const canShowEditor = selectedKeyframes.length > 0;

  // Get the most common easing from selected keyframes
  const easingCounts = new Map<string, number>();
  selectedKeyframes.forEach((kf) => {
    const ease = kf.ease || "linear";
    easingCounts.set(ease, (easingCounts.get(ease) || 0) + 1);
  });

  let currentEasing = "linear";
  let maxCount = 0;
  easingCounts.forEach((count, ease) => {
    if (count > maxCount) {
      maxCount = count;
      currentEasing = ease;
    }
  });

  // Update easing when dropdown changes
  const handleEasingChange = (newEasing: string) => {
    setKeyframes((prev) =>
      prev.map((kf) =>
        selectedIds.includes(kf.id) ? { ...kf, ease: newEasing } : kf,
      ),
    );
  };

  // Draw easing curve on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canShowEditor) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = "#171717";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#404040";
    ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i <= 4; i++) {
      const x = padding + (i * (width - 2 * padding)) / 4;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * (height - 2 * padding)) / 4;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "#737373";
    ctx.lineWidth = 2;

    // X axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Draw easing curve
    const easingFn = getEasingFunction(currentEasing);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.beginPath();

    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const easedT = easingFn(t);

      const x = padding + t * (width - 2 * padding);
      const y = height - padding - easedT * (height - 2 * padding);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw start and end points
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(padding, height - padding, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width - padding, padding, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [currentEasing, canShowEditor]);

  if (!canShowEditor) {
    return (
      <div className="w-80 flex-shrink-0 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm p-4">
        <h2 className="text-sm font-semibold text-neutral-200 mb-3">
          Easing Editor
        </h2>
        <div className="text-xs text-neutral-500 text-center py-8">
          Select one or more keyframes
          <br />
          to edit their easing
        </div>
      </div>
    );
  }

  // Group selected keyframes by property for display
  const propertyCounts = new Map<string, number>();
  selectedKeyframes.forEach((kf) => {
    propertyCounts.set(
      kf.property,
      (propertyCounts.get(kf.property) || 0) + 1,
    );
  });

  const uniqueProperties = Array.from(propertyCounts.keys());
  const hasMultipleEasings = easingCounts.size > 1;

  return (
    <div className="w-80 flex-shrink-0 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm p-4">
      <h2 className="text-sm font-semibold text-neutral-200 mb-3">
        Easing Editor
      </h2>

      {/* Keyframe info */}
      <div className="text-xs text-neutral-400 mb-4 space-y-1">
        <div>
          Selected:{" "}
          <span className="text-neutral-300">
            {selectedKeyframes.length} keyframe{selectedKeyframes.length > 1 ? "s" : ""}
          </span>
        </div>
        {uniqueProperties.length === 1 ? (
          <div>
            Property: <span className="text-neutral-300">{uniqueProperties[0]}</span>
          </div>
        ) : (
          <div>
            Properties:{" "}
            <span className="text-neutral-300">{uniqueProperties.length}</span>
          </div>
        )}
        {hasMultipleEasings && (
          <div className="text-amber-400">
            ⚠ Multiple easings selected
          </div>
        )}
      </div>

      {/* Easing preview canvas */}
      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={288}
          height={200}
          className="w-full rounded-lg border border-neutral-800"
        />
      </div>

      {/* Easing dropdown */}
      <div className="space-y-2">
        <label htmlFor="easing-select" className="text-xs text-neutral-400">
          Easing Function
        </label>
        <select
          id="easing-select"
          value={currentEasing}
          onChange={(e) => handleEasingChange(e.target.value)}
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
        >
          {Object.entries(EASING_CATEGORIES).map(([category, easings]) => (
            <optgroup key={category} label={category}>
              {easings.map((easing) => (
                <option key={easing.value} value={easing.value}>
                  {easing.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Helper text */}
      <div className="mt-4 text-xs text-neutral-500">
        The easing function controls how each selected keyframe transitions from
        the previous keyframe.
        {hasMultipleEasings && (
          <div className="mt-2 text-amber-400">
            Selecting a new easing will apply it to all selected keyframes.
          </div>
        )}
      </div>
    </div>
  );
}
