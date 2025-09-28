import { useSnapshot } from "valtio";
import { DragInput } from "@/components/ui/drag-input";
import { visualizerActions, visualizerStore } from "@/state/visualizer-store";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const ParticleModeControls = () => {
  const visualizer = useSnapshot(visualizerStore);
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
          <DragInput
            label="Impact"
            value={nebula.impact}
            onChange={(value) =>
              visualizerActions.updateParticlePreset("nebula", {
                impact: clamp(value, 0, 2),
              })
            }
            step={0.02}
            precision={2}
            min={0}
            max={2}
          />
          <DragInput
            label="Smoothing"
            value={nebula.smoothing}
            onChange={(value) =>
              visualizerActions.updateParticlePreset("nebula", {
                smoothing: clamp(value, 0, 1),
              })
            }
            step={0.01}
            precision={2}
            min={0}
            max={1}
          />
        </div>
      );
    }
    default:
      return null;
  }
};
