import { useMemo, useId } from "react";
import { useSnapshot } from "valtio";
import { Combobox } from "@base-ui-components/react/combobox";
import { ChevronDown } from "lucide-react";
import { DragInput } from "@/components/ui/drag-input";
import {
  visualizerActions,
  visualizerStore,
  type ShaderPreset,
} from "@/state/visualizer-store";
import { SectionCard, ColorSwatch } from "./shared-ui";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type ShaderOption = {
  value: ShaderPreset;
  label: string;
  description: string;
};

export const ShadersSection = () => {
  const visualizer = useSnapshot(visualizerStore);

  const shaderOptions = useMemo<ShaderOption[]>(
    () => [
      {
        value: "none",
        label: "No Shader",
        description: "Keep the scene minimal for a clean stage.",
      },
      {
        value: "aurora",
        label: "Aurora Veil",
        description: "Fluid ribbons reminiscent of classic Winamp curtains.",
      },
      {
        value: "pulseGrid",
        label: "Pulse Grid",
        description: "Retro synthwave grid that throbs with the beat.",
      },
      {
        value: "fragments",
        label: "Fragments",
        description: "Neon shards spiral and shimmer with every transient.",
      },
      {
        value: "smoke",
        label: "Smoke Drift",
        description: "Billowing clouds that quicken with the music's pulse.",
      },
    ],
    [],
  );

  const shaderItems = useMemo<ShaderPreset[]>(
    () => shaderOptions.map((option) => option.value),
    [shaderOptions],
  );

  const shaderLookup = useMemo(
    () =>
      shaderOptions.reduce<Record<ShaderPreset, ShaderOption>>(
        (acc, option) => {
          acc[option.value] = option;
          return acc;
        },
        {} as Record<ShaderPreset, ShaderOption>,
      ),
    [shaderOptions],
  );

  const shaderFieldId = useId();
  const activeShader = shaderLookup[visualizer.shader];

  const handleShaderSelection = (value: ShaderPreset | null) => {
    const next = value ?? "none";
    visualizerActions.setShader(next);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <label
              htmlFor={shaderFieldId}
              className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
            >
              Shader preset
            </label>
            <p className="text-xs text-zinc-500">
              {activeShader?.description ?? "Select a backdrop to layer behind the scene."}
            </p>
          </div>

          <Combobox.Root<ShaderPreset>
            items={shaderItems}
            value={visualizer.shader}
            onValueChange={(value) => handleShaderSelection(value ?? null)}
            itemToStringLabel={(item) =>
              item ? shaderLookup[item]?.label ?? "" : ""
            }
            itemToStringValue={(item) => item ?? ""}
          >
            <div className="relative">
              <Combobox.Input
                id={shaderFieldId}
                placeholder="Select a shader"
                className="h-10 w-full rounded-lg border border-zinc-800/70 bg-zinc-900/60 px-3 pr-9 text-sm text-zinc-100 outline-none transition focus:border-sky-500/60"
              />
              <Combobox.Trigger
                aria-label="Open shader list"
                className="absolute inset-y-0 right-2 flex items-center justify-center rounded-md px-1 text-zinc-500 transition hover:text-zinc-200"
              >
                <ChevronDown size={14} strokeWidth={1.5} />
              </Combobox.Trigger>
            </div>

            <Combobox.Portal>
              <Combobox.Positioner className="outline-none" sideOffset={6}>
                <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),20rem)] overflow-y-auto rounded-lg border border-zinc-800/70 bg-zinc-900/95 p-1 text-sm text-zinc-100 shadow-xl shadow-black/30 outline-none">
                  <Combobox.List>
                    {(item: ShaderPreset) => {
                      const option = shaderLookup[item];
                      if (!option) return null;
                      return (
                        <Combobox.Item
                          key={option.value}
                          value={option.value}
                          className="flex flex-col gap-1 rounded-md px-3 py-2 text-left text-sm text-zinc-200 outline-none transition data-[highlighted]:bg-sky-500/15 data-[highlighted]:text-zinc-100"
                        >
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-zinc-500">
                            {option.description}
                          </span>
                        </Combobox.Item>
                      );
                    }}
                  </Combobox.List>
                </Combobox.Popup>
              </Combobox.Positioner>
            </Combobox.Portal>
          </Combobox.Root>
        </div>
      </div>

      {visualizer.shader === "aurora" && (
        <SectionCard title="Aurora Parameters">
          <DragInput
            label="Intensity"
            value={visualizer.shaderSettings.aurora.intensity}
            onChange={(value) =>
              visualizerActions.updateShader("aurora", {
                intensity: clamp(value, 0.2, 1.3),
              })
            }
            step={0.02}
            precision={2}
            min={0.2}
            max={1.3}
          />
          <DragInput
            label="Speed"
            value={visualizer.shaderSettings.aurora.speed}
            onChange={(value) =>
              visualizerActions.updateShader("aurora", {
                speed: clamp(value, 0.1, 1.2),
              })
            }
            step={0.02}
            precision={2}
            min={0.1}
            max={1.2}
          />
          <DragInput
            label="Contrast"
            value={visualizer.shaderSettings.aurora.contrast}
            onChange={(value) =>
              visualizerActions.updateShader("aurora", {
                contrast: clamp(value, 0.4, 1.8),
              })
            }
            step={0.02}
            precision={2}
            min={0.4}
            max={1.8}
          />
        </SectionCard>
      )}

      {visualizer.shader === "pulseGrid" && (
        <SectionCard title="Pulse Grid Parameters">
          <DragInput
            label="Intensity"
            value={visualizer.shaderSettings.pulseGrid.intensity}
            onChange={(value) =>
              visualizerActions.updateShader("pulseGrid", {
                intensity: clamp(value, 0.2, 1.5),
              })
            }
            step={0.02}
            precision={2}
            min={0.2}
            max={1.5}
          />
          <DragInput
            label="Speed"
            value={visualizer.shaderSettings.pulseGrid.speed}
            onChange={(value) =>
              visualizerActions.updateShader("pulseGrid", {
                speed: clamp(value, 0.1, 1.6),
              })
            }
            step={0.02}
            precision={2}
            min={0.1}
            max={1.6}
          />
          <DragInput
            label="Contrast"
            value={visualizer.shaderSettings.pulseGrid.contrast}
            onChange={(value) =>
              visualizerActions.updateShader("pulseGrid", {
                contrast: clamp(value, 0.3, 2),
              })
            }
            step={0.02}
            precision={2}
            min={0.3}
            max={2}
          />
          <DragInput
            label="Warp"
            value={visualizer.shaderSettings.pulseGrid.warp}
            onChange={(value) =>
              visualizerActions.updateShader("pulseGrid", {
                warp: clamp(value, 0.6, 2.4),
              })
            }
            step={0.02}
            precision={2}
            min={0.6}
            max={2.4}
          />
        </SectionCard>
      )}

      {visualizer.shader === "fragments" && (
        <SectionCard title="Fragments Parameters">
          <DragInput
            label="Intensity"
            value={visualizer.shaderSettings.fragments.intensity}
            onChange={(value) =>
              visualizerActions.updateShader("fragments", {
                intensity: clamp(value, 0.2, 1.6),
              })
            }
            step={0.02}
            precision={2}
            min={0.2}
            max={1.6}
          />
          <DragInput
            label="Speed"
            value={visualizer.shaderSettings.fragments.speed}
            onChange={(value) =>
              visualizerActions.updateShader("fragments", {
                speed: clamp(value, 0.1, 1.5),
              })
            }
            step={0.02}
            precision={2}
            min={0.1}
            max={1.5}
          />
          <DragInput
            label="Contrast"
            value={visualizer.shaderSettings.fragments.contrast}
            onChange={(value) =>
              visualizerActions.updateShader("fragments", {
                contrast: clamp(value, 0.4, 2.2),
              })
            }
            step={0.02}
            precision={2}
            min={0.4}
            max={2.2}
          />
          <DragInput
            label="Fragmentation"
            value={visualizer.shaderSettings.fragments.fragmentation}
            onChange={(value) =>
              visualizerActions.updateShader("fragments", {
                fragmentation: clamp(value, 0.6, 2.8),
              })
            }
            step={0.02}
            precision={2}
            min={0.6}
            max={2.8}
          />
        </SectionCard>
      )}

      {visualizer.shader === "smoke" && (
        <SectionCard title="Smoke Parameters">
          <ColorSwatch
            label="Color"
            value={visualizer.shaderSettings.smoke.color}
            onChange={(value) =>
              visualizerActions.updateShader("smoke", { color: value })
            }
          />
          <DragInput
            label="Intensity"
            value={visualizer.shaderSettings.smoke.intensity}
            onChange={(value) =>
              visualizerActions.updateShader("smoke", {
                intensity: clamp(value, 0.2, 1.5),
              })
            }
            step={0.02}
            precision={2}
            min={0.2}
            max={1.5}
          />
          <DragInput
            label="Speed"
            value={visualizer.shaderSettings.smoke.speed}
            onChange={(value) =>
              visualizerActions.updateShader("smoke", {
                speed: clamp(value, 0.05, 1.2),
              })
            }
            step={0.02}
            precision={2}
            min={0.05}
            max={1.2}
          />
          <DragInput
            label="Contrast"
            value={visualizer.shaderSettings.smoke.contrast}
            onChange={(value) =>
              visualizerActions.updateShader("smoke", {
                contrast: clamp(value, 0.4, 2.4),
              })
            }
            step={0.02}
            precision={2}
            min={0.4}
            max={2.4}
          />
          <DragInput
            label="Scale"
            value={visualizer.shaderSettings.smoke.scale}
            onChange={(value) =>
              visualizerActions.updateShader("smoke", {
                scale: clamp(value, 0.6, 1.8),
              })
            }
            step={0.02}
            precision={2}
            min={0.6}
            max={1.8}
          />
        </SectionCard>
      )}

      {visualizer.shader === "none" && (
        <div className="rounded-xl border border-dashed border-zinc-800/60 bg-zinc-900/20 p-4 text-sm text-zinc-500">
          Add a shader backdrop to introduce a nostalgic motion layer behind the geometry.
        </div>
      )}
    </div>
  );
};
