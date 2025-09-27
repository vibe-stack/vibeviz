"use client";

import { useMemo, useId } from "react";
import type { ReactNode } from "react";
import { useSnapshot } from "valtio";
import { Tabs } from "@base-ui-components/react/tabs";
import { Combobox } from "@base-ui-components/react/combobox";
import { Shapes, Sparkles, Globe2, ChevronDown } from "lucide-react";
import { DragInput } from "@/components/ui/drag-input";
import { cn } from "@/utils/tailwind";
import {
  visualizerActions,
  visualizerStore,
  type ShaderPreset,
  type ParticleMode,
  type ParticleBlendMode,
} from "@/state/visualizer-store";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const TogglePill = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-full border px-3 py-1 text-xs font-medium transition",
      "border-zinc-800/60 text-zinc-400 hover:border-zinc-600/60",
      active && "border-sky-400/70 bg-sky-500/10 text-sky-200",
    )}
  >
    {label}
  </button>
);

const SegmentedControl = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) => (
  <div
    className="grid gap-1 rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-1 text-xs"
    style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
  >
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={cn(
          "rounded-md px-2 py-1 text-xs font-medium capitalize transition",
          value === option.value
            ? "bg-sky-500/20 text-sky-200"
            : "text-zinc-400 hover:text-zinc-200",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const SectionCard = ({
  title,
  children,
  description,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
    <div className="mb-3 space-y-1">
      <h4 className="text-sm font-semibold text-zinc-100">{title}</h4>
      {description ? (
        <p className="text-xs text-zinc-500">{description}</p>
      ) : null}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

type ShaderOption = {
  value: ShaderPreset;
  label: string;
  description: string;
};

const ColorSwatch = ({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) => (
  <label className="flex items-center justify-between text-xs text-zinc-400">
    <span>{label}</span>
    <input
      type="color"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-7 w-16 cursor-pointer rounded border border-zinc-800/60 bg-transparent"
    />
  </label>
);

export const SettingsPanel = () => {
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

  type ParticleModeOption = {
    value: ParticleMode;
    label: string;
    description: string;
  };

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

  const handleShaderSelection = (value: ShaderPreset | null) => {
    const next = value ?? "none";
    visualizerActions.setShader(next);
  };

  const activeShader = shaderLookup[visualizer.shader];

  const particleBlendOptions: Array<{
    value: ParticleBlendMode;
    label: string;
  }> = [
    { value: "normal", label: "Normal" },
    { value: "additive", label: "Additive" },
    { value: "screen", label: "Screen" },
  ];

  const renderParticleModeControls = () => {
    const { mode, presets } = visualizer.particles;

    switch (mode) {
      case "vortex": {
        const vortex = presets.vortex;
        return (
          <div className="grid grid-cols-1 gap-3">
            <DragInput
              label="Swirl Strength"
              value={vortex.swirlStrength}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("vortex", {
                  swirlStrength: clamp(value, 0, 1.6),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={1.6}
            />
            <DragInput
              label="Axial Pull"
              value={vortex.axialPull}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("vortex", {
                  axialPull: clamp(value, 0, 1.2),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={1.2}
            />
            <DragInput
              label="Beat Pulse"
              value={vortex.beatPulse}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("vortex", {
                  beatPulse: clamp(value, 0, 2),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={2}
            />
            <DragInput
              label="Noise Strength"
              value={vortex.noiseStrength}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("vortex", {
                  noiseStrength: clamp(value, 0, 1.6),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={1.6}
            />
            <DragInput
              label="Vertical Drift"
              value={vortex.verticalDrift}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("vortex", {
                  verticalDrift: clamp(value, 0, 1),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={1}
            />
          </div>
        );
      }
      case "bursts": {
        const bursts = presets.bursts;
        return (
          <div className="grid grid-cols-1 gap-3">
            <DragInput
              label="Emission Rate"
              value={bursts.emissionRate}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("bursts", {
                  emissionRate: Math.round(clamp(value, 20, 400)),
                })
              }
              step={5}
              precision={0}
              min={20}
              max={400}
              suffix="pps"
            />
            <DragInput
              label="Burst Strength"
              value={bursts.burstStrength}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("bursts", {
                  burstStrength: clamp(value, 0.2, 4),
                })
              }
              step={0.05}
              precision={2}
              min={0.2}
              max={4}
            />
            <DragInput
              label="Burst Spread"
              value={bursts.burstSpread}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("bursts", {
                  burstSpread: clamp(value, 0.1, 1.5),
                })
              }
              step={0.05}
              precision={2}
              min={0.1}
              max={1.5}
            />
            <DragInput
              label="Gravity"
              value={bursts.gravity}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("bursts", {
                  gravity: clamp(value, 0, 2),
                })
              }
              step={0.05}
              precision={2}
              min={0}
              max={2}
            />
            <DragInput
              label="Decay"
              value={bursts.decay}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("bursts", {
                  decay: clamp(value, 0.3, 2),
                })
              }
              step={0.02}
              precision={2}
              min={0.3}
              max={2}
            />
          </div>
        );
      }
      case "orbits": {
        const orbits = presets.orbits;
        return (
          <div className="grid grid-cols-1 gap-3">
            <DragInput
              label="Ring Count"
              value={orbits.ringCount}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("orbits", {
                  ringCount: Math.max(1, Math.round(clamp(value, 1, 12))),
                })
              }
              step={1}
              precision={0}
              min={1}
              max={12}
              suffix="rings"
            />
            <DragInput
              label="Orbit Radius"
              value={orbits.radius}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("orbits", {
                  radius: clamp(value, 2, 10),
                })
              }
              step={0.05}
              precision={2}
              min={2}
              max={10}
              suffix="u"
            />
            <DragInput
              label="Twist"
              value={orbits.twist}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("orbits", {
                  twist: clamp(value, 0, 1.5),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={1.5}
            />
            <DragInput
              label="Wobble"
              value={orbits.wobble}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("orbits", {
                  wobble: clamp(value, 0, 1.2),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={1.2}
            />
            <DragInput
              label="Tempo Follow"
              value={orbits.tempoFollow}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("orbits", {
                  tempoFollow: clamp(value, 0, 1.6),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={1.6}
            />
          </div>
        );
      }
      case "ribbons": {
        const ribbons = presets.ribbons;
        return (
          <div className="grid grid-cols-1 gap-3">
            <DragInput
              label="Band Count"
              value={ribbons.bandCount}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("ribbons", {
                  bandCount: Math.max(1, Math.round(clamp(value, 1, 6))),
                })
              }
              step={1}
              precision={0}
            />
            <DragInput
              label="Trail Length"
              value={ribbons.trailLength}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("ribbons", {
                  trailLength: Math.max(4, Math.round(clamp(value, 4, 64))),
                })
              }
              step={1}
              precision={0}
              min={4}
              max={64}
              suffix="segments"
            />
            <DragInput
              label="Wave Amplitude"
              value={ribbons.waveAmplitude}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("ribbons", {
                  waveAmplitude: clamp(value, 0, 2),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={2}
            />
            <DragInput
              label="Wave Frequency"
              value={ribbons.waveFrequency}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("ribbons", {
                  waveFrequency: clamp(value, 0.2, 2),
                })
              }
              step={0.02}
              precision={2}
              min={0.2}
              max={2}
            />
            <DragInput
              label="Noise Strength"
              value={ribbons.noiseStrength}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("ribbons", {
                  noiseStrength: clamp(value, 0, 1),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={1}
            />
          </div>
        );
      }
      case "nebula": {
        const nebula = presets.nebula;
        return (
          <div className="grid grid-cols-1 gap-3">
            <DragInput
              label="Noise Scale"
              value={nebula.noiseScale}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("nebula", {
                  noiseScale: clamp(value, 0.1, 2),
                })
              }
              step={0.02}
              precision={2}
              min={0.1}
              max={2}
            />
            <DragInput
              label="Drift Speed"
              value={nebula.driftSpeed}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("nebula", {
                  driftSpeed: clamp(value, 0, 1),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={1}
            />
            <DragInput
              label="Curl Strength"
              value={nebula.curlStrength}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("nebula", {
                  curlStrength: clamp(value, 0, 1.5),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={1.5}
            />
            <DragInput
              label="Shimmer"
              value={nebula.shimmer}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("nebula", {
                  shimmer: clamp(value, 0, 1.5),
                })
              }
              step={0.02}
              precision={2}
              min={0}
              max={1.5}
            />
            <DragInput
              label="Fade"
              value={nebula.fade}
              onChange={(value) =>
                visualizerActions.updateParticlePreset("nebula", {
                  fade: clamp(value, 0.2, 1.4),
                })
              }
              step={0.02}
              precision={2}
              min={0.2}
              max={1.4}
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <aside className="flex h-full w-96 flex-col border-l border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm">
      <div className="border-b border-zinc-800/60 p-5">
        <h3 className="text-lg font-semibold text-zinc-100">Visual Studio</h3>
        <p className="text-xs text-zinc-500">
          Combine geometry, shaders, and atmosphere to craft your scene.
        </p>
      </div>

      <Tabs.Root defaultValue="primitives" className="flex h-full flex-col">
        <Tabs.List className="grid grid-cols-3 gap-2 px-5 pt-4 text-xs font-medium">
          {[
            { value: "primitives", icon: Shapes, label: "Primitives" },
            { value: "shaders", icon: Sparkles, label: "Shaders" },
            { value: "world", icon: Globe2, label: "World" },
          ].map((tab) => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2 transition",
                "data-[selected=false]:border-zinc-800/60 data-[selected=false]:bg-zinc-900/40 data-[selected=false]:text-zinc-400",
                "data-[selected=true]:border-sky-500/60 data-[selected=true]:bg-sky-500/10 data-[selected=true]:text-sky-200",
              )}
            >
              <tab.icon size={14} strokeWidth={1.5} />
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel
          value="primitives"
          className="flex-1 space-y-6 overflow-y-auto px-5 pb-8 pt-4 max-h-[80dvh]"
        >
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
              label={
                visualizer.bars.scaleMode === "vertical"
                  ? "Bar Height"
                  : "Radial Length"
              }
              value={visualizer.bars.maxBarHeight}
              onChange={(value) =>
                visualizerActions.updateBars({
                  maxBarHeight: clamp(value, 1, 6),
                })
              }
              step={0.05}
              precision={2}
              min={1}
              max={6}
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
          <div className="grid grid-cols-1 gap-3 text-xs">
              <ColorSwatch
                label="Color"
                value={visualizer.bars.material.color}
                onChange={(value) =>
                  visualizerActions.updateBarMaterial({ color: value })
                }
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
                    count: Math.round(clamp(value, 200, 3000)),
                  })
                }
                step={25}
                precision={0}
                min={200}
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

            {renderParticleModeControls()}
          </SectionCard>
        </Tabs.Panel>

        <Tabs.Panel
          value="shaders"
          className="flex-1 space-y-4 overflow-y-auto px-5 pb-8 pt-4"
        >
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
        </Tabs.Panel>

        <Tabs.Panel
          value="world"
          className="flex-1 space-y-6 overflow-y-auto px-5 pb-8 pt-4"
        >
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
        </Tabs.Panel>
      </Tabs.Root>
    </aside>
  );
};
