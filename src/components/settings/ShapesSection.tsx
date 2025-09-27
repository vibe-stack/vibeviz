import { useMemo } from "react";
import { useSnapshot } from "valtio";
import { DragInput } from "@/components/ui/drag-input";
import {
  type ShapeRotationMode,
  type ShapeScaleMode,
  type ShapeType,
  visualizerActions,
  visualizerStore,
} from "@/state/visualizer-store";
import { cn } from "@/utils/tailwind";
import {
  ColorSwatch,
  SectionCard,
  SegmentedControl,
  TogglePill,
} from "./shared-ui";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const shapeOptions: Array<{ value: ShapeType; label: string }> = [
  { value: "cube", label: "Cube" },
  { value: "sphere", label: "Sphere" },
  { value: "heart", label: "Heart" },
  { value: "star", label: "Star" },
  { value: "torus", label: "Torus" },
  { value: "arrow", label: "Arrow" },
  { value: "pyramid", label: "Pyramid" },
  { value: "tetrahedron", label: "Tetra" },
];

const rotationModes: Array<{ value: ShapeRotationMode; label: string }> = [
  { value: "slowDownOnBeat", label: "Slow Down" },
  { value: "speedUpOnBeat", label: "Speed Up" },
  { value: "reverseOnBeat", label: "Reverse" },
  { value: "temporaryReverseOnBeat", label: "Mirror Flip" },
];

const scaleModes: Array<{ value: ShapeScaleMode; label: string }> = [
  { value: "slowDownOnBeat", label: "Slow Down" },
  { value: "speedUpOnBeat", label: "Speed Up" },
  { value: "reverseOnBeat", label: "Reverse" },
  { value: "temporaryReverseOnBeat", label: "Mirror Flip" },
  { value: "heartbeat", label: "Heartbeat" },
];

export const ShapesSection = () => {
  const visualizer = useSnapshot(visualizerStore);

  const modeDescription = useMemo(() => {
    switch (visualizer.shapes.animation.rotate.mode) {
      case "slowDownOnBeat":
        return "Beats ease rotation before releasing into motion.";
      case "speedUpOnBeat":
        return "Transients kick the spin into higher velocity.";
      case "reverseOnBeat":
        return "Each pulse flips the spin direction for dramatic stalls.";
      case "temporaryReverseOnBeat":
        return "Beats create mirror-like reversals that resume forward flow.";
      default:
        return "";
    }
  }, [visualizer.shapes.animation.rotate.mode]);

  return (
    <SectionCard
      title="Shapes"
      description="Drop iconic geometry into the center stage and drive it with rhythm."
    >
      <div className="flex items-center justify-between gap-3">
        <TogglePill
          active={visualizer.shapes.enabled}
          label={visualizer.shapes.enabled ? "Enabled" : "Disabled"}
          onClick={() => visualizerActions.toggleShapes()}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Shape
        </p>
        <div className="grid grid-cols-4 gap-2">
          {shapeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                visualizerActions.updateShapes({ type: option.value })
              }
              className={cn(
                "rounded-lg border px-2 py-2 text-xs font-medium transition",
                visualizer.shapes.type === option.value
                  ? "border-sky-500/60 bg-sky-500/15 text-sky-100"
                  : "border-zinc-800/60 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 text-xs">
        <DragInput
          label="Base Scale"
          value={visualizer.shapes.baseScale}
          onChange={(value) =>
            visualizerActions.updateShapes({
              baseScale: clamp(value, 0.2, 6),
            })
          }
          step={0.05}
          precision={2}
          min={0.2}
          max={6}
        />
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["x", "Pitch"],
              ["y", "Yaw"],
              ["z", "Roll"],
            ] as const
          ).map(([axis, label]) => (
            <DragInput
              key={axis}
              label={`${label}`}
              value={visualizer.shapes.baseRotation[axis]}
              onChange={(v) =>
                visualizerActions.updateShapeBaseRotation({
                  [axis]: clamp(Math.round(v), -180, 180),
                })
              }
              step={1}
              precision={0}
              min={-180}
              max={180}
              suffix="°"
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Rotation Animation
            </p>
            <p className="text-xs text-zinc-500">{modeDescription}</p>
          </div>
          <TogglePill
            active={visualizer.shapes.animation.rotate.enabled}
            label={
              visualizer.shapes.animation.rotate.enabled ? "Active" : "Off"
            }
            onClick={() =>
              visualizerActions.updateShapeRotation({
                enabled: !visualizer.shapes.animation.rotate.enabled,
              })
            }
          />
        </div>

        <DragInput
          label="Angular Speed"
          value={visualizer.shapes.animation.rotate.speed}
          onChange={(value) =>
            visualizerActions.updateShapeRotation({
              speed: clamp(value, 0, 6),
            })
          }
          step={0.05}
          precision={2}
          min={0}
          max={6}
          suffix="rad/s"
        />

        <div className="grid grid-cols-3 gap-2 text-xs">
          {(
            [
              ["x", "Axis X"],
              ["y", "Axis Y"],
              ["z", "Axis Z"],
            ] as const
          ).map(([axis, label]) => (
            <DragInput
              key={axis}
              label={label}
              value={visualizer.shapes.animation.rotate.axis[axis]}
              onChange={(v) =>
                visualizerActions.updateShapeRotationAxis({
                  [axis]: clamp(v, -1, 1),
                })
              }
              step={0.05}
              precision={2}
              min={-1}
              max={1}
            />
          ))}
        </div>

        <SegmentedControl
          value={visualizer.shapes.animation.rotate.mode}
          options={rotationModes}
          onChange={(value) =>
            visualizerActions.updateShapeRotation({
              mode: (value as ShapeRotationMode) ?? "slowDownOnBeat",
            })
          }
        />
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Scale Animation
            </p>
            <p className="text-xs text-zinc-500">
              Shape breathing synced with pulse and texture of the track.
            </p>
          </div>
          <TogglePill
            active={visualizer.shapes.animation.scale.enabled}
            label={visualizer.shapes.animation.scale.enabled ? "Active" : "Off"}
            onClick={() =>
              visualizerActions.updateShapeScale({
                enabled: !visualizer.shapes.animation.scale.enabled,
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <DragInput
            label="Min Scale"
            value={visualizer.shapes.animation.scale.min}
            onChange={(value) =>
              visualizerActions.updateShapeScale({
                min: clamp(value, 0.2, 3),
              })
            }
            step={0.05}
            precision={2}
            min={0.2}
            max={3}
          />
          <DragInput
            label="Max Scale"
            value={visualizer.shapes.animation.scale.max}
            onChange={(value) =>
              visualizerActions.updateShapeScale({
                max: clamp(value, 0.3, 4),
              })
            }
            step={0.05}
            precision={2}
            min={0.3}
            max={4}
          />
        </div>

        <DragInput
          label="Oscillation Speed"
          value={visualizer.shapes.animation.scale.speed}
          onChange={(value) =>
            visualizerActions.updateShapeScale({
              speed: clamp(value, 0.2, 4),
            })
          }
          step={0.05}
          precision={2}
          min={0.2}
          max={4}
          suffix="hz"
        />

        <SegmentedControl
          value={visualizer.shapes.animation.scale.mode}
          options={scaleModes}
          onChange={(value) =>
            visualizerActions.updateShapeScale({
              mode: (value as ShapeScaleMode) ?? "heartbeat",
            })
          }
        />
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Material
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <ColorSwatch
            label="Color"
            value={visualizer.shapes.material.color}
            onChange={(value) =>
              visualizerActions.updateShapeMaterial({ color: value })
            }
          />
          <ColorSwatch
            label="Emissive"
            value={visualizer.shapes.material.emissive}
            onChange={(value) =>
              visualizerActions.updateShapeMaterial({ emissive: value })
            }
          />
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <DragInput
            label="Metalness"
            value={visualizer.shapes.material.metalness}
            onChange={(value) =>
              visualizerActions.updateShapeMaterial({
                metalness: clamp(value, 0, 1),
              })
            }
            step={0.02}
            precision={2}
            min={0}
            max={1}
          />
          <DragInput
            label="Roughness"
            value={visualizer.shapes.material.roughness}
            onChange={(value) =>
              visualizerActions.updateShapeMaterial({
                roughness: clamp(value, 0, 1),
              })
            }
            step={0.02}
            precision={2}
            min={0}
            max={1}
          />
          <DragInput
            label="Glow"
            value={visualizer.shapes.material.emissiveIntensity}
            onChange={(value) =>
              visualizerActions.updateShapeMaterial({
                emissiveIntensity: clamp(value, 0, 5),
              })
            }
            step={0.05}
            precision={2}
            min={0}
            max={5}
          />
        </div>
      </div>
    </SectionCard>
  );
};
