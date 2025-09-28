import { useSnapshot } from "valtio";
import { DragInput } from "@/components/ui/drag-input";
import { visualizerActions, visualizerStore } from "@/state/visualizer-store";
import { SectionCard, TogglePill, ColorSwatch } from "./shared-ui";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type DirectionalLightId = "key" | "fill" | "rim";

const directionalLightPresets: Array<{
  id: DirectionalLightId;
  label: string;
  description: string;
  range: [number, number];
}> = [
  {
    id: "key",
    label: "Key Light",
    description: "Primary directional light defining depth and highlights.",
    range: [0, 8],
  },
  {
    id: "fill",
    label: "Fill Light",
    description: "Secondary light to soften contrast and shadow edges.",
    range: [0, 8],
  },
  {
    id: "rim",
    label: "Rim Light",
    description: "Back light for silhouettes and atmosphere.",
    range: [0, 8],
  },
];

export const WorldSection = () => {
  const visualizer = useSnapshot(visualizerStore);
  const { world } = visualizer;
  const { lights, bloom, fog } = world;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Environment Lighting"
        description="Dial in ambient tone and directional light sculpting."
      >
        <ColorSwatch
          label="Background"
          value={world.background}
          onChange={(value) => visualizerActions.updateWorld({ background: value })}
        />

        <div className="space-y-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Ambient Light
              </p>
              <p className="text-xs text-zinc-500">
                Softens the scene with uniform illumination.
              </p>
            </div>
            <TogglePill
              label={lights.ambient.enabled ? "Active" : "Off"}
              active={lights.ambient.enabled}
              onClick={() =>
                visualizerActions.updateAmbientLight({
                  enabled: !lights.ambient.enabled,
                })
              }
            />
          </div>
          <ColorSwatch
            label="Color"
            value={lights.ambient.color}
            onChange={(value) =>
              visualizerActions.updateAmbientLight({ color: value })
            }
          />
          <DragInput
            label="Intensity"
            value={lights.ambient.intensity}
            onChange={(value) =>
              visualizerActions.updateAmbientLight({
                intensity: clamp(value, 0, 2),
              })
            }
            step={0.02}
            precision={2}
            min={0}
            max={2}
            disabled={!lights.ambient.enabled}
          />
        </div>

        <div className="space-y-4">
          {directionalLightPresets.map(({ id, label, description, range }) => {
            const light = lights[id];
            return (
              <div
                key={id}
                className="space-y-3 rounded-lg border border-zinc-800/50 bg-zinc-900/20 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      {label}
                    </p>
                    <p className="text-xs text-zinc-500">{description}</p>
                  </div>
                  <TogglePill
                    label={light.enabled ? "Active" : "Off"}
                    active={light.enabled}
                    onClick={() =>
                      visualizerActions.updateDirectionalLight(id, {
                        enabled: !light.enabled,
                      })
                    }
                  />
                </div>

                <ColorSwatch
                  label="Color"
                  value={light.color}
                  onChange={(value) =>
                    visualizerActions.updateDirectionalLight(id, {
                      color: value,
                    })
                  }
                />

                <DragInput
                  label="Intensity"
                  value={light.intensity}
                  onChange={(value) =>
                    visualizerActions.updateDirectionalLight(id, {
                      intensity: clamp(value, range[0], range[1]),
                    })
                  }
                  step={0.02}
                  precision={2}
                  min={range[0]}
                  max={range[1]}
                  disabled={!light.enabled}
                />

                <div className="grid grid-cols-1 gap-2 text-xs">
                  {(
                    [
                      ["x", "X"],
                      ["y", "Y"],
                      ["z", "Z"],
                    ] as const
                  ).map(([axis, axisLabel]) => (
                    <DragInput
                      key={axis}
                      label={axisLabel}
                      value={light.position[axis]}
                      onChange={(value) =>
                        visualizerActions.updateDirectionalLightPosition(id, {
                          [axis]: clamp(value, -20, 20),
                        })
                      }
                      step={0.1}
                      precision={2}
                      min={-20}
                      max={20}
                      disabled={!light.enabled}
                    />
                  ))}
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <DragInput
                    label="Shadow Bias"
                    value={light.shadowBias}
                    onChange={(value) =>
                      visualizerActions.updateDirectionalLight(id, {
                        shadowBias: clamp(value, -0.01, 0.01),
                      })
                    }
                    step={0.0002}
                    precision={4}
                    min={-0.01}
                    max={0.01}
                    disabled={!light.enabled}
                  />
                  <DragInput
                    label="Shadow Radius"
                    value={light.shadowRadius}
                    onChange={(value) =>
                      visualizerActions.updateDirectionalLight(id, {
                        shadowRadius: clamp(value, 0, 5),
                      })
                    }
                    step={0.05}
                    precision={2}
                    min={0}
                    max={5}
                    disabled={!light.enabled}
                  />
                  <div className="flex items-end justify-end">
                    <TogglePill
                      label={light.castShadow ? "Casting" : "No Shadows"}
                      active={light.castShadow}
                      onClick={() =>
                        visualizerActions.updateDirectionalLight(id, {
                          castShadow: !light.castShadow,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="Bloom"
        description="Add a cinematic glow to the brightest energy bands."
      >
        <TogglePill
          label={bloom.enabled ? "Enabled" : "Disabled"}
          active={bloom.enabled}
          onClick={() => visualizerActions.updateBloom({ enabled: !bloom.enabled })}
        />
        {bloom.enabled ? (
          <div className="grid gap-2 text-xs">
            <DragInput
              label="Threshold"
              value={bloom.threshold}
              onChange={(value) =>
                visualizerActions.updateBloom({
                  threshold: clamp(value, 0, 1),
                })
              }
              step={0.01}
              precision={2}
              min={0}
              max={1}
            />
            <DragInput
              label="Strength"
              value={bloom.strength}
              onChange={(value) =>
                visualizerActions.updateBloom({
                  strength: clamp(value, 0, 2),
                })
              }
              step={0.05}
              precision={2}
              min={0}
              max={2}
            />
            <DragInput
              label="Radius"
              value={bloom.radius}
              onChange={(value) =>
                visualizerActions.updateBloom({
                  radius: clamp(value, 0, 3),
                })
              }
              step={0.05}
              precision={2}
              min={0}
              max={3}
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="Fog">
        <TogglePill
          label={fog.enabled ? "Enabled" : "Disabled"}
          active={fog.enabled}
          onClick={() =>
            visualizerActions.updateFog({
              enabled: !fog.enabled,
            })
          }
        />
        {fog.enabled ? (
          <div className="space-y-3">
            <ColorSwatch
              label="Fog Color"
              value={fog.color}
              onChange={(value) => visualizerActions.updateFog({ color: value })}
            />
            <DragInput
              label="Fog Near"
              value={fog.near}
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
              value={fog.far}
              onChange={(value) =>
                visualizerActions.updateFog({
                  far: Math.max(value, fog.near + 2),
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
