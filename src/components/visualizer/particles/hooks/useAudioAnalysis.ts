import { useCallback, useMemo, useRef } from "react";

export interface AudioBands {
  low: number;
  mid: number;
  high: number;
}

export interface AudioAnalysis {
  bands: AudioBands;
  average: number;
  peak: number;
  beat: number;
  spectrum: Uint8Array;
}

export interface AudioAnalysisConfig {
  smoothing: number;
  beatSensitivity: number;
  decay: number;
}

const DEFAULT_CONFIG: AudioAnalysisConfig = {
  smoothing: 0.65,
  beatSensitivity: 1.6,
  decay: 0.92,
};

export const useAudioAnalysis = (
  getFrequencyData: () => Uint8Array,
  config?: Partial<AudioAnalysisConfig>,
) => {
  const resolvedConfig = useMemo(
    () => ({
      ...DEFAULT_CONFIG,
      ...config,
    }),
    [config],
  );

  const stateRef = useRef({
    analysis: {
      bands: { low: 0, mid: 0, high: 0 } satisfies AudioBands,
      average: 0,
      peak: 0,
      beat: 0,
      spectrum: new Uint8Array(0),
    } satisfies AudioAnalysis,
    smoothedEnergy: 0,
    beatHold: 0,
  });

  return useCallback(() => {
    const frequency = getFrequencyData();
    const length = frequency.length;
    if (!length) {
      return stateRef.current.analysis;
    }

    if (stateRef.current.analysis.spectrum.length !== length) {
      stateRef.current.analysis.spectrum = new Uint8Array(length);
    }

    stateRef.current.analysis.spectrum.set(frequency);

    const third = Math.floor(length / 3) || 1;

    let low = 0;
    let mid = 0;
    let high = 0;
    let sum = 0;
    let peak = 0;

    for (let i = 0; i < length; i += 1) {
      const value = frequency[i] / 255;
      peak = Math.max(peak, value);
      sum += value;

      if (i < third) {
        low += value;
      } else if (i < third * 2) {
        mid += value;
      } else {
        high += value;
      }
    }

    const lowAvg = low / third;
    const midAvg = mid / third;
    const highAvg = high / Math.max(1, length - third * 2);
    const average = sum / length;

    const { smoothing, beatSensitivity, decay } = resolvedConfig;
    const smoothed =
      stateRef.current.smoothedEnergy * smoothing + average * (1 - smoothing);
    stateRef.current.smoothedEnergy = smoothed;

    const energyDelta = Math.max(0, average - smoothed * beatSensitivity);
    const beat = Math.max(energyDelta * 4, stateRef.current.beatHold * decay);
    stateRef.current.beatHold = beat;

    const next = stateRef.current.analysis;
    next.bands.low = lowAvg;
    next.bands.mid = midAvg;
    next.bands.high = highAvg;
    next.average = average;
    next.peak = peak;
    next.beat = beat;

    return next;
  }, [getFrequencyData, resolvedConfig]);
};
