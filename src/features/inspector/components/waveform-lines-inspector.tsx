"use client";

import { useSetAtom } from "jotai";
import { DragInput } from "@/components/ui/drag-input";
import { updateObjectAtom } from "@/features/scene/state";
import type { WaveformLinesObject } from "@/features/scene/types";
import { TransformSection } from "./transform-section";

type WaveformLinesInspectorProps = {
  object: WaveformLinesObject;
};

export function WaveformLinesInspector({
  object,
}: WaveformLinesInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);

  return (
    <>
      <TransformSection objectId={object.id} transform={object.transform} />

      <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Waveform Lines
        </h3>

        <div className="space-y-2">
          <h4 className="text-xs text-neutral-400 font-medium">
            Line Configuration
          </h4>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Line Amount</span>
            <DragInput
              value={object.lineAmount}
              onChange={(v) =>
                updateObject(object.id, { lineAmount: Math.round(v) })
              }
              step={1}
              precision={0}
              min={1}
              max={50}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Line Segments</span>
            <DragInput
              value={object.lineSegments}
              onChange={(v) =>
                updateObject(object.id, { lineSegments: Math.round(v) })
              }
              step={1}
              precision={0}
              min={32}
              max={500}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Line Gaps</span>
            <DragInput
              value={object.lineGaps}
              onChange={(v) => updateObject(object.id, { lineGaps: v })}
              step={0.01}
              precision={2}
              min={0.01}
              max={2}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Start Gap</span>
            <DragInput
              value={object.lineStartGap}
              onChange={(v) => updateObject(object.id, { lineStartGap: v })}
              step={0.01}
              precision={2}
              min={0}
              max={1}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Center Gap</span>
            <DragInput
              value={object.lineCenterGap}
              onChange={(v) => updateObject(object.id, { lineCenterGap: v })}
              step={0.01}
              precision={2}
              min={0}
              max={1}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">End Gap</span>
            <DragInput
              value={object.lineEndGap}
              onChange={(v) => updateObject(object.id, { lineEndGap: v })}
              step={0.01}
              precision={2}
              min={0}
              max={1}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">
              Start Converge
            </span>
            <DragInput
              value={object.lineStartConvergence}
              onChange={(v) =>
                updateObject(object.id, { lineStartConvergence: v })
              }
              step={0.01}
              precision={2}
              min={0}
              max={1}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">
              Center Converge
            </span>
            <DragInput
              value={object.lineCenterConvergence}
              onChange={(v) =>
                updateObject(object.id, { lineCenterConvergence: v })
              }
              step={0.01}
              precision={2}
              min={0}
              max={1}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">End Converge</span>
            <DragInput
              value={object.lineEndConvergence}
              onChange={(v) =>
                updateObject(object.id, { lineEndConvergence: v })
              }
              step={0.01}
              precision={2}
              min={0}
              max={1}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Smoothing</span>
            <DragInput
              value={object.smoothing}
              onChange={(v) => updateObject(object.id, { smoothing: v })}
              step={0.05}
              precision={2}
              min={0}
              max={1}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Thickness</span>
            <DragInput
              value={object.thickness}
              onChange={(v) => updateObject(object.id, { thickness: v })}
              step={0.01}
              precision={2}
              min={0.01}
              max={20}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Offset</span>
            <DragInput
              value={object.offset}
              onChange={(v) => updateObject(object.id, { offset: v })}
              step={0.01}
              precision={2}
              min={0}
              max={2}
              compact
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-neutral-700/50">
          <h4 className="text-xs text-neutral-400 font-medium">Material</h4>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Color</span>
            <input
              type="color"
              value={object.color}
              onChange={(e) =>
                updateObject(object.id, { color: e.target.value })
              }
              className="h-7 w-14 rounded border border-neutral-700 bg-neutral-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">
              Emissive Color
            </span>
            <input
              type="color"
              value={object.emissiveColor}
              onChange={(e) =>
                updateObject(object.id, { emissiveColor: e.target.value })
              }
              className="h-7 w-14 rounded border border-neutral-700 bg-neutral-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Emissive Int.</span>
            <DragInput
              value={object.emissiveIntensity}
              onChange={(v) =>
                updateObject(object.id, { emissiveIntensity: v })
              }
              step={0.1}
              precision={1}
              min={0}
              max={5}
              compact
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-neutral-700/50">
          <h4 className="text-xs text-neutral-400 font-medium">Layout</h4>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Layout</span>
            <select
              value={object.layout}
              onChange={(e) =>
                updateObject(object.id, {
                  layout: e.target.value as "linear" | "radial",
                })
              }
              className="flex-1 px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-300"
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-neutral-700/50">
          <h4 className="text-xs text-neutral-400 font-medium">
            Audio Reactivity
          </h4>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">
              Dynamic Height
            </span>
            <DragInput
              value={object.dynamicHeight}
              onChange={(v) => updateObject(object.id, { dynamicHeight: v })}
              step={0.1}
              precision={1}
              min={0}
              max={20}
              compact
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs text-neutral-400">Direction (XYZ)</span>
            <div className="grid grid-cols-3 gap-2">
              {(["x", "y", "z"] as const).map((component: string) => (
                <div key={component} className="flex flex-col gap-1">
                  <label
                    htmlFor={`direction-${component}`}
                    className="text-[10px] text-neutral-500 uppercase"
                  >
                    {component}
                  </label>
                  <DragInput
                    value={object.direction[component as "x" | "y" | "z"]}
                    onChange={(v) =>
                      updateObject(object.id, {
                        direction: {
                          ...object.direction,
                          [component]: v,
                        },
                      })
                    }
                    step={0.01}
                    precision={2}
                    min={0}
                    max={1}
                    compact
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">
              Audio Threshold
            </span>
            <DragInput
              value={object.audioThreshold}
              onChange={(v) => updateObject(object.id, { audioThreshold: v })}
              step={0.01}
              precision={2}
              min={0}
              max={1}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Audio Gain</span>
            <DragInput
              value={object.audioGain}
              onChange={(v) => updateObject(object.id, { audioGain: v })}
              step={0.1}
              precision={1}
              min={0}
              max={10}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Freq Start</span>
            <DragInput
              value={object.freqRangeStart}
              onChange={(v) => updateObject(object.id, { freqRangeStart: v })}
              step={0.01}
              precision={2}
              min={0}
              max={1}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Freq End</span>
            <DragInput
              value={object.freqRangeEnd}
              onChange={(v) => updateObject(object.id, { freqRangeEnd: v })}
              step={0.01}
              precision={2}
              min={0}
              max={1}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">
              Emissive Boost
            </span>
            <DragInput
              value={object.emissiveBoost}
              onChange={(v) => updateObject(object.id, { emissiveBoost: v })}
              step={0.1}
              precision={1}
              min={0}
              max={10}
              compact
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-28">Pivot Point</span>
            <select
              value={object.pivotPoint}
              onChange={(e) =>
                updateObject(object.id, {
                  pivotPoint: e.target.value as "bottom" | "center" | "top",
                })
              }
              className="flex-1 px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-300"
            >
              <option value="bottom">Bottom</option>
              <option value="center">Center</option>
              <option value="top">Top</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
