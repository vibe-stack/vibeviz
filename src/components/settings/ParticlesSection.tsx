import { useMemo, useId } from "react";
import { useSnapshot } from "valtio";
import { Combobox } from "@base-ui-components/react/combobox";
import { ChevronDown } from "lucide-react";
import { DragInput } from "@/components/ui/drag-input";
import {
  visualizerActions,
  visualizerStore,
  type ParticleMode,
  type ParticleBlendMode,
} from "@/state/visualizer-store";
import { SectionCard, TogglePill, SegmentedControl, ColorSwatch } from "./shared-ui";
import { ParticleModeControls } from "./ParticleModeControls";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type ParticleModeOption = {
  value: ParticleMode;
  label: string;
  description: string;
};

export const ParticlesSection = () => {
  const visualizer = useSnapshot(visualizerStore);

  const particleModeOptions = useMemo<ParticleModeOption[]>(
    () => [
      {
        value: "vortex",
        label: "Vortex Swirl",
        description: "Helical storms with beat-driven pulses and swirling columns.",
      },
      {
        value: "bursts",
        label: "Radial Bursts",
        description: "Percussive shells of particles that erupt on transients.",
      },
      {
        value: "orbits",
        label: "Orbit Trails",
        description: "Layered rings weaving around the listener with tempo-following twists.",
      },
      {
        value: "ribbons",
        label: "Wave Ribbons",
        description: "Flowing bands translating frequency bands into silky ribbons.",
      },
      {
        value: "nebula",
        label: "Nebula Drift",
        description: "Ethereal plumes drifting through curl-noise space clouds.",
      },
    ],
    [],
  );

  const particleModeItems = useMemo<ParticleMode[]>(
    () => particleModeOptions.map((option) => option.value),
    [particleModeOptions],
  );

  const particleModeLookup = useMemo(
    () =>
      particleModeOptions.reduce<Record<ParticleMode, ParticleModeOption>>(
        (acc, option) => {
          acc[option.value] = option;
          return acc;
        },
        {} as Record<ParticleMode, ParticleModeOption>,
      ),
    [particleModeOptions],
  );

  const particleModeFieldId = useId();
  const activeParticleMode = particleModeLookup[visualizer.particles.mode];

  const particleBlendOptions: Array<{
    value: ParticleBlendMode;
    label: string;
  }> = [
    { value: "normal", label: "Normal" },
    { value: "additive", label: "Additive" },
    { value: "screen", label: "Screen" },
  ];

  return (
    <SectionCard
      title="Particles"
      description="Design intricate particle choreographies that pulse with your track"
    >
      <div className="flex items-center justify-between gap-3">
        <TogglePill
          label={visualizer.particles.enabled ? "Enabled" : "Disabled"}
          active={visualizer.particles.enabled}
          onClick={() => visualizerActions.toggleParticles()}
        />
        <SegmentedControl
          value={visualizer.particles.global.shape}
          options={[
            { value: "sphere", label: "Spheres" },
            { value: "cube", label: "Cubes" },
          ]}
          onChange={(value) =>
            visualizerActions.updateParticleGlobal({
              shape: value as typeof visualizer.particles.global.shape,
            })
          }
        />
      </div>
      <div className="grid grid-cols-1 gap-3 text-xs">
        <DragInput
          label="Count"
          value={visualizer.particles.global.count}
          onChange={(value) =>
            visualizerActions.updateParticleGlobal({
              count: Math.round(clamp(value, 20, 3000)),
            })
          }
          step={25}
          precision={0}
          min={20}
          max={3000}
          suffix="pts"
        />
        <DragInput
          label="Spawn Radius"
          value={visualizer.particles.global.spawnRadius}
          onChange={(value) =>
            visualizerActions.updateParticleGlobal({
              spawnRadius: clamp(value, 2, 10),
            })
          }
          step={0.05}
          precision={2}
          min={2}
          max={10}
          suffix="u"
        />
        <DragInput
          label="Spawn Jitter"
          value={visualizer.particles.global.spawnJitter}
          onChange={(value) =>
            visualizerActions.updateParticleGlobal({
              spawnJitter: clamp(value, 0, 2),
            })
          }
          step={0.02}
          precision={2}
          min={0}
          max={2}
        />
        <DragInput
          label="Particle Size"
          value={visualizer.particles.global.size}
          onChange={(value) =>
            visualizerActions.updateParticleGlobal({
              size: clamp(value, 0.01, 0.12),
            })
          }
          step={0.002}
          precision={3}
          min={0.01}
          max={0.12}
        />
        <DragInput
          label="Speed"
          value={visualizer.particles.global.speed}
          onChange={(value) =>
            visualizerActions.updateParticleGlobal({
              speed: clamp(value, 0.3, 3),
            })
          }
          step={0.02}
          precision={2}
          min={0.3}
          max={3}
        />
        <DragInput
          label="Drag"
          value={visualizer.particles.global.drag}
          onChange={(value) =>
            visualizerActions.updateParticleGlobal({
              drag: clamp(value, 0, 0.6),
            })
          }
          step={0.01}
          precision={2}
          min={0}
          max={0.6}
        />
        <DragInput
          label="Trail Memory"
          value={visualizer.particles.global.trail}
          onChange={(value) =>
            visualizerActions.updateParticleGlobal({
              trail: clamp(value, 0.1, 1),
            })
          }
          step={0.02}
          precision={2}
          min={0.1}
          max={1}
        />
        <DragInput
          label="Depth Fade"
          value={visualizer.particles.global.depthFade}
          onChange={(value) =>
            visualizerActions.updateParticleGlobal({
              depthFade: clamp(value, 0, 1),
            })
          }
          step={0.02}
          precision={2}
          min={0}
          max={1}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 text-xs">
        <ColorSwatch
          label="Base Tone"
          value={visualizer.particles.palette.base}
          onChange={(value) =>
            visualizerActions.updateParticlePalette({ base: value })
          }
        />
        <ColorSwatch
          label="Mid Tone"
          value={visualizer.particles.palette.mid}
          onChange={(value) =>
            visualizerActions.updateParticlePalette({ mid: value })
          }
        />
        <ColorSwatch
          label="Highlight"
          value={visualizer.particles.palette.highlight}
          onChange={(value) =>
            visualizerActions.updateParticlePalette({ highlight: value })
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-3 text-xs">
        <ColorSwatch
          label="Material Color"
          value={visualizer.particles.material.color}
          onChange={(value) =>
            visualizerActions.updateParticleMaterial({ color: value })
          }
        />
        <DragInput
          label="Metalness"
          value={visualizer.particles.material.metalness}
          onChange={(value) =>
            visualizerActions.updateParticleMaterial({
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
          value={visualizer.particles.material.roughness}
          onChange={(value) =>
            visualizerActions.updateParticleMaterial({
              roughness: clamp(value, 0, 1),
            })
          }
          step={0.01}
          precision={2}
          min={0}
          max={1}
        />
        <DragInput
          label="Opacity"
          value={visualizer.particles.material.opacity}
          onChange={(value) =>
            visualizerActions.updateParticleMaterial({
              opacity: clamp(value, 0.2, 1),
            })
          }
          step={0.01}
          precision={2}
          min={0.2}
          max={1}
        />
        <DragInput
          label="Emissive"
          value={visualizer.particles.material.emissiveIntensity}
          onChange={(value) =>
            visualizerActions.updateParticleMaterial({
              emissiveIntensity: clamp(value, 0, 4),
            })
          }
          step={0.05}
          precision={2}
          min={0}
          max={4}
        />
        <DragInput
          label="Fresnel"
          value={visualizer.particles.material.fresnel}
          onChange={(value) =>
            visualizerActions.updateParticleMaterial({
              fresnel: clamp(value, 0, 2),
            })
          }
          step={0.05}
          precision={2}
          min={0}
          max={2}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Blend Mode
        </p>
        <SegmentedControl
          value={visualizer.particles.material.blend}
          options={particleBlendOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) =>
            visualizerActions.updateParticleMaterial({
              blend: value as ParticleBlendMode,
            })
          }
        />
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <label
              htmlFor={particleModeFieldId}
              className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
            >
              Particle Mode
            </label>
            <p className="text-xs text-zinc-500">
              {activeParticleMode?.description ??
                "Select a motion preset to sculpt the particle choreography."}
            </p>
          </div>
          <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200">
            {activeParticleMode?.label ?? "Mode"}
          </span>
        </div>

        <Combobox.Root<ParticleMode>
          items={particleModeItems}
          value={visualizer.particles.mode}
          onValueChange={(value) =>
            visualizerActions.setParticleMode(value ?? "vortex")
          }
          itemToStringLabel={(item) =>
            item ? particleModeLookup[item]?.label ?? "" : ""
          }
          itemToStringValue={(item) => item ?? ""}
        >
          <div className="relative">
            <Combobox.Input
              id={particleModeFieldId}
              placeholder="Select a particle mode"
              className="h-10 w-full rounded-lg border border-zinc-800/70 bg-zinc-900/60 px-3 pr-9 text-sm text-zinc-100 outline-none transition focus:border-sky-500/60"
            />
            <Combobox.Trigger
              aria-label="Open particle mode list"
              className="absolute inset-y-0 right-2 flex items-center justify-center rounded-md px-1 text-zinc-500 transition hover:text-zinc-200"
            >
              <ChevronDown size={14} strokeWidth={1.5} />
            </Combobox.Trigger>
          </div>

          <Combobox.Portal>
            <Combobox.Positioner className="outline-none" sideOffset={6}>
              <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),18rem)] overflow-y-auto rounded-lg border border-zinc-800/70 bg-zinc-900/95 p-1 text-sm text-zinc-100 shadow-xl shadow-black/30 outline-none">
                <Combobox.List>
                  {(item: ParticleMode) => {
                    const option = particleModeLookup[item];
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

      <ParticleModeControls />
    </SectionCard>
  );
};
