import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { audioPlayerAtom, currentTimeAtom } from "@/features/audio/state";
import { getInterpolatedAudioFrame } from "@/features/export/audio-analysis";
import { exportAudioDataAtom, isExportingAtom } from "@/features/export/state";

export function useShaderAudioAnalyzer() {
  const audioPlayer = useAtomValue(audioPlayerAtom);
  const isExporting = useAtomValue(isExportingAtom);
  const exportAudioData = useAtomValue(exportAudioDataAtom);
  const currentTime = useAtomValue(currentTimeAtom);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const exportFrameRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (analyzerRef.current && (isExporting || !audioPlayer)) {
      analyzerRef.current.dispose();
      analyzerRef.current = null;
    }

    if (!isExporting && audioPlayer && !analyzerRef.current) {
      const analyzer = new Tone.Analyser("fft", 64);
      audioPlayer.connect(analyzer);
      analyzerRef.current = analyzer;
    }

    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.dispose();
        analyzerRef.current = null;
      }
    };
  }, [audioPlayer, isExporting]);

  const getAudioLevel = (freqRangeStart = 0.0, freqRangeEnd = 1.0): number => {
    if (isExporting && exportAudioData) {
      exportFrameRef.current = getInterpolatedAudioFrame(
        exportAudioData,
        currentTime,
        exportFrameRef.current ?? undefined,
      );
      const frame = exportFrameRef.current;
      if (!frame || frame.length === 0) return 0;

      const values = frame;
      const startIdx = Math.floor(freqRangeStart * values.length);
      const endIdx = Math.ceil(freqRangeEnd * values.length);

      let sum = 0;
      let count = 0;
      for (let i = startIdx; i < endIdx; i++) {
        const safeIndex = Math.min(Math.max(i, 0), values.length - 1);
        sum += Math.max(0, (values[safeIndex] + 100) / 100);
        count++;
      }

      return count > 0 ? sum / count : 0;
    }

    const analyzer = analyzerRef.current;
    if (!analyzer) return 0;

    const values = analyzer.getValue() as Float32Array;
    const startIdx = Math.floor(freqRangeStart * values.length);
    const endIdx = Math.ceil(freqRangeEnd * values.length);

    let sum = 0;
    let count = 0;
    for (let i = startIdx; i < endIdx; i++) {
      const safeIndex = Math.min(Math.max(i, 0), values.length - 1);
      sum += Math.max(0, (values[safeIndex] + 100) / 100);
      count++;
    }

    return count > 0 ? sum / count : 0;
  };

  return { getAudioLevel };
}
