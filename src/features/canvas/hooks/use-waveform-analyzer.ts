import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { audioPlayerAtom } from "@/features/audio/state";

/**
 * Hook for managing audio analysis for waveform visualizations
 * Returns analyzer and pre-allocated value arrays
 */
export function useWaveformAnalyzer(sampleCount: number) {
  const audioPlayer = useAtomValue(audioPlayerAtom);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const rawValuesRef = useRef<Float32Array | null>(null);
  const smoothedValuesRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (audioPlayer && !analyzerRef.current) {
      // Calculate optimal FFT size (must be power of 2)
      const fftSize = 2 ** Math.ceil(Math.log2(Math.min(sampleCount, 2048)));

      // Create FFT analyzer for frequency spectrum analysis
      const analyzer = new Tone.Analyser("fft", fftSize);

      // Connect to the shared audio player
      audioPlayer.connect(analyzer);

      // Initialize analyzer and value arrays
      analyzerRef.current = analyzer;
      rawValuesRef.current = new Float32Array(sampleCount);
      smoothedValuesRef.current = new Float32Array(sampleCount);

      console.log(
        `Waveform analyzer initialized with FFT size: ${fftSize}, samples: ${sampleCount}`,
      );
    }

    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.dispose();
        analyzerRef.current = null;
      }
    };
  }, [audioPlayer, sampleCount]);

  return {
    analyzer: analyzerRef.current,
    rawValues: rawValuesRef.current,
    smoothedValues: smoothedValuesRef.current,
  };
}
