import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import * as Tone from "tone";
import { audioPlayerAtom, currentTimeAtom } from "@/features/audio/state";
import { getInterpolatedAudioFrame } from "@/features/export/audio-analysis";
import { exportAudioDataAtom, isExportingAtom } from "@/features/export/state";

/**
 * Hook for managing audio analysis for waveform visualizations
 * Returns analyzer and pre-allocated value arrays
 */
export function useWaveformAnalyzer(sampleCount: number) {
  const audioPlayer = useAtomValue(audioPlayerAtom);
  const isExporting = useAtomValue(isExportingAtom);
  const exportAudioData = useAtomValue(exportAudioDataAtom);
  const currentTime = useAtomValue(currentTimeAtom);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const rawValuesRef = useRef<Float32Array | null>(null);
  const smoothedValuesRef = useRef<Float32Array | null>(null);
  const exportFrameRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    rawValuesRef.current = new Float32Array(sampleCount);
    smoothedValuesRef.current = new Float32Array(sampleCount);
    return () => {
      rawValuesRef.current = null;
      smoothedValuesRef.current = null;
    };
  }, [sampleCount]);

  useEffect(() => {
    const shouldUseAnalyzer = !isExporting && audioPlayer;

    if (!shouldUseAnalyzer && analyzerRef.current) {
      analyzerRef.current.dispose();
      analyzerRef.current = null;
    }

    if (shouldUseAnalyzer && !analyzerRef.current) {
      const fftSize = 2 ** Math.ceil(Math.log2(Math.min(sampleCount, 2048)));
      const analyzer = new Tone.Analyser("fft", fftSize);
      audioPlayer!.connect(analyzer);
      analyzerRef.current = analyzer;
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
  }, [audioPlayer, isExporting, sampleCount]);

  const getFrequencyData = useCallback(() => {
    if (isExporting && exportAudioData) {
      exportFrameRef.current = getInterpolatedAudioFrame(
        exportAudioData,
        currentTime,
        exportFrameRef.current ?? undefined,
      );
      return exportFrameRef.current;
    }

    if (analyzerRef.current) {
      return analyzerRef.current.getValue() as Float32Array;
    }

    if (
      !exportFrameRef.current ||
      exportFrameRef.current.length !== sampleCount
    ) {
      exportFrameRef.current = new Float32Array(sampleCount);
      exportFrameRef.current.fill(-100);
    }

    return exportFrameRef.current;
  }, [currentTime, exportAudioData, isExporting, sampleCount]);

  return {
    analyzer: analyzerRef.current,
    rawValues: rawValuesRef.current,
    smoothedValues: smoothedValuesRef.current,
    getFrequencyData,
  };
}
