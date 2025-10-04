import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { audioPlayerAtom } from "@/features/audio/state";

export function useShaderAudioAnalyzer() {
  const audioPlayer = useAtomValue(audioPlayerAtom);
  const analyzerRef = useRef<Tone.Analyser | null>(null);

  useEffect(() => {
    if (audioPlayer && !analyzerRef.current) {
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
  }, [audioPlayer]);

  const getAudioLevel = (freqRangeStart = 0.0, freqRangeEnd = 1.0): number => {
    const analyzer = analyzerRef.current;
    if (!analyzer) return 0;

    const values = analyzer.getValue() as Float32Array;
    const startIdx = Math.floor(freqRangeStart * values.length);
    const endIdx = Math.ceil(freqRangeEnd * values.length);

    let sum = 0;
    let count = 0;
    for (let i = startIdx; i < endIdx; i++) {
      sum += Math.max(0, (values[i] + 100) / 100);
      count++;
    }

    return count > 0 ? sum / count : 0;
  };

  return { getAudioLevel };
}
