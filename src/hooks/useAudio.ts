import { useState, useRef, useCallback, useEffect } from "react";
import { AudioProcessor, type AudioData } from "../utils/audio";

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
}

export const useAudio = () => {
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoading: false,
    error: null,
  });

  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const initializeAudioProcessor = useCallback(() => {
    if (!audioProcessorRef.current) {
      audioProcessorRef.current = new AudioProcessor();
    }
    return audioProcessorRef.current;
  }, []);

  const loadAudio = useCallback(
    async (file: File) => {
      setAudioState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const processor = initializeAudioProcessor();
        const data = await processor.loadAudioFile(file);

        setAudioData(data);
        setAudioState((prev) => ({
          ...prev,
          duration: data.duration,
          isLoading: false,
        }));
      } catch (error) {
        setAudioState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to load audio",
          isLoading: false,
        }));
      }
    },
    [initializeAudioProcessor],
  );

  const updateCurrentTime = useCallback(() => {
    if (audioState.isPlaying && audioProcessorRef.current) {
      const elapsed =
        audioProcessorRef.current.context.currentTime -
        startTimeRef.current +
        pauseTimeRef.current;

      if (elapsed >= audioState.duration) {
        setAudioState((prev) => ({
          ...prev,
          isPlaying: false,
          currentTime: audioState.duration,
        }));
        return;
      }

      setAudioState((prev) => ({ ...prev, currentTime: elapsed }));
      animationFrameRef.current = requestAnimationFrame(updateCurrentTime);
    }
  }, [audioState.isPlaying, audioState.duration]);

  const play = useCallback(() => {
    if (!audioData || !audioProcessorRef.current) return;

    // Stop existing source
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
    }

    const source = audioProcessorRef.current.context.createBufferSource();
    source.buffer = audioData.buffer;

    // Create gain node for volume control if it doesn't exist
    if (!gainNodeRef.current) {
      gainNodeRef.current = audioProcessorRef.current.context.createGain();
      gainNodeRef.current.connect(
        audioProcessorRef.current.context.destination,
      );
    }

    // Set volume
    gainNodeRef.current.gain.value = audioState.volume;

    // Connect source -> analyser -> gain -> destination for real-time frequency data
    source.connect(audioProcessorRef.current.analyserNode);
    audioProcessorRef.current.analyserNode.connect(gainNodeRef.current);

    startTimeRef.current = audioProcessorRef.current.context.currentTime;
    source.start(0, pauseTimeRef.current);

    sourceRef.current = source;
    setAudioState((prev) => ({ ...prev, isPlaying: true }));

    updateCurrentTime();
  }, [audioData, audioState.volume, updateCurrentTime]);

  const pause = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    pauseTimeRef.current = audioState.currentTime;
    setAudioState((prev) => ({ ...prev, isPlaying: false }));
  }, [audioState.currentTime]);

  const seek = useCallback(
    (time: number) => {
      const wasPlaying = audioState.isPlaying;

      if (wasPlaying) {
        pause();
      }

      pauseTimeRef.current = Math.max(0, Math.min(time, audioState.duration));
      setAudioState((prev) => ({ ...prev, currentTime: pauseTimeRef.current }));

      if (wasPlaying) {
        setTimeout(play, 0);
      }
    },
    [audioState.isPlaying, audioState.duration, pause, play],
  );

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setAudioState((prev) => ({ ...prev, volume: clampedVolume }));

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clampedVolume;
    }
  }, []);

  const getFrequencyData = useCallback(() => {
    return audioProcessorRef.current?.getFrequencyData() || new Uint8Array(256);
  }, []);

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    audioData,
    audioState,
    loadAudio,
    play,
    pause,
    seek,
    setVolume,
    getFrequencyData,
  };
};
