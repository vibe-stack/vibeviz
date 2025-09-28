import { useSnapshot } from "valtio";
import { DragInput } from "@/components/ui/drag-input";
import { visualizerActions, visualizerStore } from "@/state/visualizer-store";
import { SectionCard, TogglePill, SegmentedControl, ColorSwatch } from "./shared-ui";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const BarsSection = () => {
  const visualizer = useSnapshot(visualizerStore);

  return (
    <SectionCard
      title="Bars"
      description="Radial energy bars orbiting the listener"
    >
      <div className="flex items-center justify-between">
        <TogglePill
          label={visualizer.bars.enabled ? "Enabled" : "Disabled"}
          active={visualizer.bars.enabled}
          onClick={() => visualizerActions.toggleBars()}
        />
        <SegmentedControl
          value={visualizer.bars.scaleMode}
          options={[
            { value: "vertical", label: "Vertical" },
            { value: "radial", label: "Radial" },
          ]}
          onChange={(value) =>
            visualizerActions.updateBars({ scaleMode: value as typeof visualizer.bars.scaleMode })
          }
        />
      </div>
      <DragInput
        label="Rotation Speed"
        value={visualizer.bars.rotationSpeed}
        onChange={(value) =>
          visualizerActions.updateBars({
            rotationSpeed: clamp(value, 0, 0.4),
          })
        }
        step={0.005}
        precision={3}
        min={0}
        max={0.4}
        suffix="rad/s"
      />
      <DragInput
        label="Radius"
        value={visualizer.bars.radius}
        onChange={(value) =>
          visualizerActions.updateBars({ radius: clamp(value, 3, 9) })
        }
        step={0.05}
        precision={2}
        min={3}
        max={9}
        suffix="u"
      />
      <DragInput
        label="Base Height"
        value={visualizer.bars.baseHeight}
        onChange={(value) =>
          visualizerActions.updateBars({
            baseHeight: clamp(value, 0, 1),
          })
        }
        step={0.01}
        precision={2}
        min={0}
        max={1}
        suffix="u"
      />
      <DragInput
        label={
          visualizer.bars.scaleMode === "vertical"
            ? "Dynamic Height"
            : "Dynamic Length"
        }
        value={visualizer.bars.maxBarHeight}
        onChange={(value) =>
          visualizerActions.updateBars({
            maxBarHeight: clamp(value, 1, 20),
          })
        }
        step={0.05}
        precision={2}
        min={1}
        max={20}
      />
      <DragInput
        label="Arc Smoothing"
        value={visualizer.bars.smoothing}
        onChange={(value) =>
          visualizerActions.updateBars({
            smoothing: clamp(value, 0, 10),
          })
        }
        step={0.01}
        precision={2}
        min={0}
        max={10}
      />
      <DragInput
        label="Bar Count"
        value={visualizer.bars.barCount}
        onChange={(value) =>
          visualizerActions.updateBars({
            barCount: Math.round(clamp(value, 32, 160)),
          })
        }
        step={1}
        precision={0}
        min={32}
        max={160}
        suffix="bars"
      />
      <div className="grid grid-cols-1 gap-3">
        <DragInput
          label="Audio Threshold"
          value={visualizer.bars.audioThreshold}
          onChange={(value) =>
            visualizerActions.updateBars({
              audioThreshold: clamp(value, 0, 1),
            })
          }
          step={0.005}
          precision={3}
          min={0}
          max={1}
          suffix=""
        />
        <DragInput
          label="Audio Gain"
          value={visualizer.bars.audioGain}
          onChange={(value) =>
            visualizerActions.updateBars({
              audioGain: clamp(value, 0.1, 5.0),
            })
          }
          step={0.1}
          precision={1}
          min={0.1}
          max={5.0}
          suffix="x"
        />
      </div>
      <div className="grid grid-cols-1 gap-3">
        <DragInput
          label="Vertical Width"
          value={visualizer.bars.barWidth}
          onChange={(value) =>
            visualizerActions.updateBars({
              barWidth: clamp(value, 0.2, 2),
            })
          }
          step={0.05}
          precision={2}
          min={0.2}
          max={2}
          suffix="u"
        />
        <DragInput
          label="Radial Thickness"
          value={visualizer.bars.radialThickness}
          onChange={(value) =>
            visualizerActions.updateBars({
              radialThickness: clamp(value, 0.1, 1),
            })
          }
          step={0.01}
          precision={2}
          min={0.1}
          max={1}
          suffix="u"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 text-xs">
        <ColorSwatch
          label="Color"
          value={visualizer.bars.material.color}
          onChange={(value) =>
            visualizerActions.updateBarMaterial({ color: value })
          }
        />
        <DragInput
          label="Highlight Strength"
          value={visualizer.bars.highlightStrength}
          onChange={(value) =>
            visualizerActions.updateBars({
              highlightStrength: clamp(value, 0, 1),
            })
          }
          step={0.01}
          precision={2}
          min={0}
          max={1}
        />
        <DragInput
          label="Emissive Boost"
          value={visualizer.bars.emissiveIntensity}
          onChange={(value) =>
            visualizerActions.updateBars({
              emissiveIntensity: clamp(value, 0, 1.5),
            })
          }
          step={0.01}
          precision={2}
          min={0}
          max={1.5}
        />
        <DragInput
          label="Metalness"
          value={visualizer.bars.material.metalness}
          onChange={(value) =>
            visualizerActions.updateBarMaterial({
              metalness: clamp(value, 0, 1),
            })
          }
          step={0.01}
          precision={2}
          min={0}
          max={1}
        />
        <DragInput
          label="Roughness"
          value={visualizer.bars.material.roughness}
          onChange={(value) =>
            visualizerActions.updateBarMaterial({
              roughness: clamp(value, 0, 1),
            })
          }
          step={0.01}
          precision={2}
          min={0}
          max={1}
        />
      </div>
    </SectionCard>
  );
};
