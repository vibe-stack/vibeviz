import { proxy, ref } from "valtio";
import type { AudioData } from "@/utils/audio";

export interface AudioStore {
  data: AudioData | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  error: string | null;
}

export const audioStore = proxy<AudioStore>({
  data: null,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  error: null,
});

export const audioActions = {
  setData(data: AudioData | null) {
    audioStore.data = data
      ? {
          ...data,
          buffer: ref(data.buffer),
          waveform: ref(data.waveform),
          frequencyData: ref(data.frequencyData),
        }
      : null;
    audioStore.duration = data?.duration ?? 0;
    if (!data) {
      audioStore.currentTime = 0;
      audioStore.isPlaying = false;
    }
  },
  setLoading(value: boolean) {
    audioStore.isLoading = value;
  },
  setError(message: string | null) {
    audioStore.error = message;
  },
  setPlaying(value: boolean) {
    audioStore.isPlaying = value;
  },
  setCurrentTime(time: number) {
    audioStore.currentTime = time;
  },
  setVolume(volume: number) {
    audioStore.volume = volume;
  },
  resetPlayback() {
    audioStore.currentTime = 0;
    audioStore.isPlaying = false;
  },
};
