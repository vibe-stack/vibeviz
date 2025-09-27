import { useSnapshot } from "valtio";
import { DragInput } from "@/components/ui/drag-input";
import { visualizerActions, visualizerStore } from "@/state/visualizer-store";
import { SectionCard, TogglePill, ColorSwatch } from "./shared-ui";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const WorldSection = () => {
  const visualizer = useSnapshot(visualizerStore);

  return (
    <div className="space-y-6">
      <SectionCard title="Environment">
        <ColorSwatch
          label="Background"
          value={visualizer.world.background}
          onChange={(value) =>
            visualizerActions.updateWorld({ background: value })
          }
        />
        <DragInput
          label="Ambient Light"
          value={visualizer.world.ambientIntensity}
          onChange={(value) =>
            visualizerActions.updateWorld({
              ambientIntensity: clamp(value, 0, 1.2),
            })
          }
          step={0.02}
          precision={2}
          min={0}
          max={1.2}
        />
        <DragInput
          label="Key Light"
          value={visualizer.world.keyLightIntensity}
          onChange={(value) =>
            visualizerActions.updateWorld({
              keyLightIntensity: clamp(value, 0, 1.5),
            })
          }
          step={0.02}
          precision={2}
          min={0}
          max={1.5}
        />
        <DragInput
          label="Fill Light"
          value={visualizer.world.fillLightIntensity}
          onChange={(value) =>
            visualizerActions.updateWorld({
              fillLightIntensity: clamp(value, 0, 1),
            })
          }
          step={0.02}
          precision={2}
          min={0}
          max={1}
        />
      </SectionCard>

      <SectionCard title="Fog">
        <TogglePill
          label={visualizer.world.fog.enabled ? "Enabled" : "Disabled"}
          active={visualizer.world.fog.enabled}
          onClick={() =>
            visualizerActions.updateFog({
              enabled: !visualizer.world.fog.enabled,
            })
          }
        />
        {visualizer.world.fog.enabled ? (
          <div className="space-y-3">
            <ColorSwatch
              label="Fog Color"
              value={visualizer.world.fog.color}
              onChange={(value) => visualizerActions.updateFog({ color: value })}
            />
            <DragInput
              label="Fog Near"
              value={visualizer.world.fog.near}
              onChange={(value) =>
                visualizerActions.updateFog({ near: clamp(value, 4, 40) })
              }
              step={0.5}
              precision={1}
              min={4}
              max={40}
            />
            <DragInput
              label="Fog Far"
              value={visualizer.world.fog.far}
              onChange={(value) =>
                visualizerActions.updateFog({
                  far: Math.max(value, visualizer.world.fog.near + 2),
                })
              }
              step={0.5}
              precision={1}
              min={10}
              max={80}
            />
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
};
