import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { audioClipAtom } from "@/features/audio/state";

/**
 * Hook to create and manage a Tone.js waveform analyzer
 */
export function useWaveformAnalyzer(fftSize = 1024) {
  const audioClip = useAtomValue(audioClipAtom);
  const waveformRef = useRef<Tone.Waveform | null>(null);
  const playerRef = useRef<Tone.Player | null>(null);

  useEffect(() => {
    if (!audioClip) {
      if (waveformRef.current) {
        waveformRef.current.dispose();
        waveformRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
      return;
    }

    // Create player and waveform analyzer
    const player = new Tone.Player(audioClip.url).toDestination();
    const waveform = new Tone.Waveform(fftSize);
    player.connect(waveform);

    playerRef.current = player;
    waveformRef.current = waveform;

    return () => {
      waveform.dispose();
      player.dispose();
    };
  }, [audioClip, fftSize]);

  return waveformRef.current;
}
