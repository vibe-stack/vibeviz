"use client";

import { useMemo } from "react";
import { useSnapshot } from "valtio";
import { DragInput } from "@/components/ui/drag-input";
import { cn } from "@/utils/tailwind";
import {
  visualizerActions,
  visualizerStore,
  type VisualizationMode,
  type ShaderPreset,
} from "@/state/visualizer-store";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const ModeCard = ({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full rounded-lg border px-3 py-3 text-left transition",
      "border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-600/60",
      active && "border-sky-400/70 bg-sky-500/10 shadow-inner",
    )}
  >
    <div className="font-medium text-sm text-zinc-200">{label}</div>
    <p className="mt-1 text-xs text-zinc-500">{description}</p>
  </button>
);

const ShaderCard = ({
  title,
  subtitle,
  active,
  onClick,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full rounded-lg border px-3 py-3 text-left transition",
      "border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-600/60",
      active && "border-fuchsia-400/70 bg-fuchsia-500/10 shadow-inner",
    )}
  >
    <div className="text-sm font-medium text-zinc-200">{title}</div>
    <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
  </button>
);

export const SettingsPanel = () => {
  const visualizer = useSnapshot(visualizerStore);

  const modeOptions: Array<{ mode: VisualizationMode; label: string; description: string }> =
    useMemo(
      () => [
        {
          mode: "circular" as const,
          label: "Circular Bars",
          description: "Classic radial energy bars with smooth rotation",
        },
        {
          mode: "particles" as const,
          label: "Particle Bloom",
          description: "Atmospheric particle halo reacting to bass",
        },
      ],
      [],
    );

  const shaderOptions: Array<{
    shader: ShaderPreset;
    title: string;
    subtitle: string;
  }> = useMemo(
    () => [
      { shader: "none", title: "No Shader", subtitle: "Keep the scene minimal" },
      {
        shader: "aurora",
        title: "Aurora Veil",
        subtitle: "Fluid ribbons reminiscent of classic Winamp presets",
      },
      {
        shader: "pulseGrid",
        title: "Pulse Grid",
        subtitle: "Retro synthwave grid with rhythmic pulses",
      },
    ],
    [],
  );

  return (
    <aside className="pointer-events-auto fixed right-6 top-6 z-50 w-80 rounded-2xl border border-zinc-800/70 bg-zinc-950/80 p-5 shadow-2xl backdrop-blur-xl">
      <header className="mb-5 space-y-1">
        <h3 className="text-lg font-medium text-zinc-100">Visual Studio</h3>
        <p className="text-xs text-zinc-500">
          Curate the scene by mixing physical geometry with shader-driven ambience.
        </p>
      </header>

      <section className="space-y-4">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Modes
          </h4>
          <div className="space-y-2">
            {modeOptions.map((option) => (
              <ModeCard
                key={option.mode}
                label={option.label}
                description={option.description}
                active={visualizer.mode === option.mode}
                onClick={() => visualizerActions.setMode(option.mode)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Circular Bars</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px]",
                visualizer.mode === "circular"
                  ? "bg-sky-500/20 text-sky-300"
                  : "bg-zinc-800/60 text-zinc-500",
              )}
            >
              {visualizer.mode === "circular" ? "Active" : "Idle"}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <DragInput
              label="Radius"
              value={visualizer.circular.radius}
              onChange={(value) =>
                visualizerActions.updateCircular({
                  radius: clamp(value, 3, 9),
                })
              }
              step={0.05}
              precision={2}
              min={3}
              max={9}
              suffix="u"
            />
            <DragInput
              label="Bar Height"
              value={visualizer.circular.maxBarHeight}
              onChange={(value) =>
                visualizerActions.updateCircular({
                  maxBarHeight: clamp(value, 1, 6),
                })
              }
              step={0.05}
              precision={2}
              min={1}
              max={6}
              suffix="u"
            />
            <DragInput
              label="Bar Count"
              value={visualizer.circular.barCount}
              onChange={(value) =>
                visualizerActions.updateCircular({
                  barCount: Math.round(clamp(value, 32, 128)),
                })
              }
              step={1}
              precision={0}
              min={32}
              max={128}
              suffix="bars"
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Particle Bloom</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px]",
                visualizer.mode === "particles"
                  ? "bg-sky-500/20 text-sky-300"
                  : "bg-zinc-800/60 text-zinc-500",
              )}
            >
              {visualizer.mode === "particles" ? "Active" : "Idle"}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {["sphere", "cube"].map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() =>
                    visualizerActions.updateParticles({
                      shape: shape as "sphere" | "cube",
                    })
                  }
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-xs font-medium capitalize transition",
                    "border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-600/60",
                    visualizer.particles.shape === shape &&
                      "border-amber-400/70 bg-amber-500/10 shadow-inner text-amber-200",
                  )}
                >
                  {shape}
                  <span className="block text-[10px] font-normal text-zinc-500">
                    {shape === "sphere" ? "Soft glow orbs" : "Chiseled voxels"}
                  </span>
                </button>
              ))}
            </div>
            <DragInput
              label="Particle Count"
              value={visualizer.particles.count}
              onChange={(value) =>
                visualizerActions.updateParticles({
                  count: Math.round(clamp(value, 200, 1200)),
                })
              }
              step={20}
              precision={0}
              min={200}
              max={1200}
              suffix="pts"
            />
            <DragInput
              label="Spread"
              value={visualizer.particles.spread}
              onChange={(value) =>
                visualizerActions.updateParticles({
                  spread: clamp(value, 2.5, 8),
                })
              }
              step={0.05}
              precision={2}
              min={2.5}
              max={8}
              suffix="u"
            />
            <DragInput
              label="Point Size"
              value={visualizer.particles.size}
              onChange={(value) =>
                visualizerActions.updateParticles({
                  size: clamp(value, 0.01, 0.12),
                })
              }
              step={0.002}
              precision={3}
              min={0.01}
              max={0.12}
              suffix="scale"
            />
            <DragInput
              label="Velocity"
              value={visualizer.particles.velocity}
              onChange={(value) =>
                visualizerActions.updateParticles({
                  velocity: clamp(value, 0.4, 2.5),
                })
              }
              step={0.05}
              precision={2}
              min={0.4}
              max={2.5}
            />
            <DragInput
              label="Trail"
              value={visualizer.particles.trail}
              onChange={(value) =>
                visualizerActions.updateParticles({
                  trail: clamp(value, 0.2, 1.2),
                })
              }
              step={0.02}
              precision={2}
              min={0.2}
              max={1.2}
            />
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Shader Overlays
          </h4>
          <div className="space-y-2">
            {shaderOptions.map((entry) => (
              <ShaderCard
                key={entry.shader}
                title={entry.title}
                subtitle={entry.subtitle}
                active={visualizer.shader === entry.shader}
                onClick={() => visualizerActions.setShader(entry.shader)}
              />
            ))}
          </div>

          {visualizer.shader === "aurora" && (
            <div className="mt-3 space-y-2 rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-fuchsia-200/80">
                Aurora Controls
              </div>
              <DragInput
                label="Intensity"
                value={visualizer.shaderSettings.aurora.intensity}
                onChange={(value) =>
                  visualizerActions.updateShader("aurora", {
                    intensity: clamp(value, 0.2, 1.2),
                  })
                }
                step={0.02}
                precision={2}
                min={0.2}
                max={1.2}
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
                    contrast: clamp(value, 0.4, 1.6),
                  })
                }
                step={0.02}
                precision={2}
                min={0.4}
                max={1.6}
              />
            </div>
          )}

          {visualizer.shader === "pulseGrid" && (
            <div className="mt-3 space-y-2 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-sky-200/80">
                Pulse Grid Controls
              </div>
              <DragInput
                label="Intensity"
                value={visualizer.shaderSettings.pulseGrid.intensity}
                onChange={(value) =>
                  visualizerActions.updateShader("pulseGrid", {
                    intensity: clamp(value, 0.2, 1.4),
                  })
                }
                step={0.02}
                precision={2}
                min={0.2}
                max={1.4}
              />
              <DragInput
                label="Speed"
                value={visualizer.shaderSettings.pulseGrid.speed}
                onChange={(value) =>
                  visualizerActions.updateShader("pulseGrid", {
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
                value={visualizer.shaderSettings.pulseGrid.contrast}
                onChange={(value) =>
                  visualizerActions.updateShader("pulseGrid", {
                    contrast: clamp(value, 0.4, 1.8),
                  })
                }
                step={0.02}
                precision={2}
                min={0.4}
                max={1.8}
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
            </div>
          )}
        </div>
      </section>
    </aside>
  );
};
