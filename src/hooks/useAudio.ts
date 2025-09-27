import { useCallback, useEffect, useRef } from "react";
import { useSnapshot, snapshot as getSnapshot } from "valtio";
import { AudioProcessor } from "@/utils/audio";
import { audioActions, audioStore } from "@/state/audio-store";
import { usePlaybackTimeRef } from "@/context/playback-time-context";

export const useAudio = () => {
  const snapshot = useSnapshot(audioStore);
  const playbackTimeRef = usePlaybackTimeRef();

  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserConnectedRef = useRef(false);
  const startTimeRef = useRef(0);
  const pauseTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const frequencyArrayRef = useRef(new Uint8Array(256));

  const initializeAudioProcessor = useCallback(() => {
    if (!audioProcessorRef.current) {
      audioProcessorRef.current = new AudioProcessor();
      frequencyArrayRef.current = new Uint8Array(
        audioProcessorRef.current.analyserNode.frequencyBinCount,
      );
    }

    return audioProcessorRef.current;
  }, []);

  const stopSource = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (error) {
        // ignore
      }
      sourceRef.current.disconnect();
      sourceRef.current.onended = null;
      sourceRef.current = null;
    }
  }, []);

  const cancelLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const updateLoop = useCallback(() => {
    const processor = audioProcessorRef.current;
    if (!processor) return;

    const state = getSnapshot(audioStore);
    if (!state.isPlaying) return;

    const current =
      processor.context.currentTime - startTimeRef.current + pauseTimeRef.current;
    const clamped = Math.min(current, state.duration || 0);

    audioActions.setCurrentTime(clamped);
    playbackTimeRef.current = clamped;

    if (current >= (state.duration || 0)) {
      audioActions.setPlaying(false);
      pauseTimeRef.current = 0;
      stopSource();
      cancelLoop();
      return;
    }

    animationFrameRef.current = requestAnimationFrame(updateLoop);
  }, [cancelLoop, playbackTimeRef, stopSource]);

  const loadAudio = useCallback(
    async (file: File) => {
      const processor = initializeAudioProcessor();
      cancelLoop();
      stopSource();
      audioActions.setLoading(true);
      audioActions.setError(null);
      audioActions.setPlaying(false);

      try {
        const data = await processor.loadAudioFile(file);
        frequencyArrayRef.current = new Uint8Array(
          processor.analyserNode.frequencyBinCount,
        );

        audioActions.setData(data);
        audioActions.setCurrentTime(0);
        playbackTimeRef.current = 0;
        pauseTimeRef.current = 0;
      } catch (error) {
        audioActions.setError(
          error instanceof Error ? error.message : "Failed to load audio",
        );
      } finally {
        audioActions.setLoading(false);
      }
    },
    [cancelLoop, initializeAudioProcessor, playbackTimeRef, stopSource],
  );

  const play = useCallback(() => {
    const data = getSnapshot(audioStore).data;
    const processor = initializeAudioProcessor();
    if (!data || !processor) return;

    void processor.context.resume();

    cancelLoop();
    stopSource();

    const source = processor.context.createBufferSource();
    source.buffer = data.buffer;

    source.onended = () => {
      audioActions.setPlaying(false);
      const { duration } = getSnapshot(audioStore);
      const endTime = duration || 0;
      audioActions.setCurrentTime(endTime);
      playbackTimeRef.current = endTime;
      pauseTimeRef.current = 0;
      stopSource();
      cancelLoop();
    };

    if (!gainNodeRef.current) {
      gainNodeRef.current = processor.context.createGain();
      gainNodeRef.current.connect(processor.context.destination);
    }

    const volume = getSnapshot(audioStore).volume;
    gainNodeRef.current.gain.value = volume;

    source.connect(processor.analyserNode);

    if (gainNodeRef.current && !analyserConnectedRef.current) {
      processor.analyserNode.connect(gainNodeRef.current);
      analyserConnectedRef.current = true;
    }

    startTimeRef.current = processor.context.currentTime;
    source.start(0, pauseTimeRef.current);

    sourceRef.current = source;
    audioActions.setPlaying(true);
    animationFrameRef.current = requestAnimationFrame(updateLoop);
  }, [cancelLoop, initializeAudioProcessor, playbackTimeRef, stopSource, updateLoop]);

  const pause = useCallback(() => {
    const state = getSnapshot(audioStore);
    if (!state.isPlaying) return;

    pauseTimeRef.current = state.currentTime;
    stopSource();
    cancelLoop();
    audioActions.setPlaying(false);
  }, [cancelLoop, stopSource]);

  const seek = useCallback(
    (time: number) => {
      const state = getSnapshot(audioStore);
      const clamped = Math.max(0, Math.min(time, state.duration || 0));

      pauseTimeRef.current = clamped;
      audioActions.setCurrentTime(clamped);
      playbackTimeRef.current = clamped;

      if (state.isPlaying) {
        stopSource();
        play();
      }
    },
    [play, playbackTimeRef, stopSource],
  );

  const setVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    audioActions.setVolume(clamped);

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clamped;
    }
  }, []);

  const getFrequencyData = useCallback(() => {
    if (!audioProcessorRef.current) {
      return frequencyArrayRef.current;
    }

    const data = audioProcessorRef.current.getFrequencyData();
    if (data.length !== frequencyArrayRef.current.length) {
      frequencyArrayRef.current = new Uint8Array(data.length);
    }

    frequencyArrayRef.current.set(data);
    return frequencyArrayRef.current;
  }, []);

  useEffect(() => {
    return () => {
      stopSource();
      cancelLoop();
    };
  }, [cancelLoop, stopSource]);

  return {
    audio: snapshot,
    loadAudio,
    play,
    pause,
    seek,
    setVolume,
    getFrequencyData,
  };
};
