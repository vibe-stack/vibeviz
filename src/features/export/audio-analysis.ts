import type { ExportAudioData } from "./types";

const DEFAULT_FFT_SIZE = 2048;
const MIN_DECIBELS = -100;
const MAX_DECIBELS = 0;
const SMOOTHING_TIME_CONSTANT = 0.8;
const EPSILON = 1e-12;

class FFTContext {
  private readonly size: number;
  private readonly levels: number;
  private readonly cosTable: Float32Array;
  private readonly sinTable: Float32Array;
  private readonly reverseTable: Uint32Array;

  constructor(size: number) {
    if ((size & (size - 1)) !== 0) {
      throw new Error("FFT size must be a power of two");
    }

    this.size = size;
    this.levels = Math.round(Math.log2(size));
    this.cosTable = new Float32Array(size / 2);
    this.sinTable = new Float32Array(size / 2);
    this.reverseTable = new Uint32Array(size);

    for (let i = 0; i < size / 2; i++) {
      const angle = (2 * Math.PI * i) / size;
      this.cosTable[i] = Math.cos(angle);
      this.sinTable[i] = Math.sin(angle);
    }

    for (let i = 0; i < size; i++) {
      this.reverseTable[i] = this.reverseBits(i, this.levels);
    }
  }

  forward(real: Float32Array, imag: Float32Array): void {
    const size = this.size;

    for (let i = 0; i < size; i++) {
      const j = this.reverseTable[i];
      if (j > i) {
        let tmp = real[i];
        real[i] = real[j];
        real[j] = tmp;

        tmp = imag[i];
        imag[i] = imag[j];
        imag[j] = tmp;
      }
    }

    for (let blockSize = 2; blockSize <= size; blockSize <<= 1) {
      const halfSize = blockSize >> 1;
      const tableStep = size / blockSize;

      for (let i = 0; i < size; i += blockSize) {
        let tableIndex = 0;
        for (let j = i; j < i + halfSize; j++) {
          const k = j + halfSize;
          const cos = this.cosTable[tableIndex];
          const sin = this.sinTable[tableIndex];

          const treal = cos * real[k] - sin * imag[k];
          const timag = sin * real[k] + cos * imag[k];

          real[k] = real[j] - treal;
          imag[k] = imag[j] - timag;
          real[j] += treal;
          imag[j] += timag;

          tableIndex += tableStep;
        }
      }
    }
  }

  private reverseBits(value: number, bits: number): number {
    let reversed = 0;
    for (let i = 0; i < bits; i++) {
      reversed = (reversed << 1) | (value & 1);
      value >>= 1;
    }
    return reversed;
  }
}

const fftCache = new Map<number, FFTContext>();
const windowCache = new Map<number, Float32Array>();

function getFFTContext(size: number): FFTContext {
  let context = fftCache.get(size);
  if (!context) {
    context = new FFTContext(size);
    fftCache.set(size, context);
  }
  return context;
}

function getHannWindow(size: number): Float32Array {
  let window = windowCache.get(size);
  if (!window) {
    window = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
    }
    windowCache.set(size, window);
  }
  return window;
}

export function generateExportAudioData(
  audioBuffer: AudioBuffer,
  totalFrames: number,
  frameRate: number,
  fftSize = DEFAULT_FFT_SIZE,
): ExportAudioData {
  if (totalFrames <= 0 || frameRate <= 0) {
    throw new Error("Invalid export parameters");
  }

  const binCount = fftSize / 2;
  const duration = audioBuffer.duration;
  const hopSize = audioBuffer.sampleRate / frameRate;
  const channelCount = audioBuffer.numberOfChannels;
  const inverseChannelCount = channelCount > 0 ? 1 / channelCount : 1;
  const bufferLength = audioBuffer.length;

  const channelData: Float32Array[] = [];
  for (let channel = 0; channel < channelCount; channel++) {
    channelData[channel] = audioBuffer.getChannelData(channel);
  }

  const fft = getFFTContext(fftSize);
  const window = getHannWindow(fftSize);

  const real = new Float32Array(fftSize);
  const imag = new Float32Array(fftSize);
  const smoothed = new Float32Array(binCount);
  smoothed.fill(MIN_DECIBELS);

  const smoothing = SMOOTHING_TIME_CONSTANT;
  const oneMinusSmoothing = 1 - smoothing;

  const data = new Float32Array(totalFrames * binCount);
  let peakDecibels = -Infinity;

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    const startSample = Math.floor(frameIndex * hopSize);

    for (let i = 0; i < fftSize; i++) {
      const sampleIndex = startSample + i;
      let sample = 0;

      if (sampleIndex < bufferLength) {
        for (let channel = 0; channel < channelCount; channel++) {
          sample += channelData[channel][sampleIndex];
        }
        sample *= inverseChannelCount;
      }

      real[i] = sample * window[i];
      imag[i] = 0;
    }

    fft.forward(real, imag);

    const frameOffset = frameIndex * binCount;
    for (let bin = 0; bin < binCount; bin++) {
      const re = real[bin];
      const im = imag[bin];
      const magnitude = Math.sqrt(re * re + im * im);
      const normalized = magnitude / (fftSize * 0.5);
      const db = 20 * Math.log10(Math.max(normalized, EPSILON));
      const clamped = Math.max(MIN_DECIBELS, Math.min(MAX_DECIBELS, db));
      const smoothedValue =
        smoothing * smoothed[bin] + oneMinusSmoothing * clamped;
      smoothed[bin] = smoothedValue;
      data[frameOffset + bin] = smoothedValue;
      peakDecibels = Math.max(peakDecibels, smoothedValue);
    }
  }

  // Calibrate overall loudness so offline analysis matches realtime playback intensity
  const TARGET_PEAK_DB = -8; // Aim for healthy headroom while preserving punch
  if (Number.isFinite(peakDecibels) && peakDecibels < TARGET_PEAK_DB) {
    const calibrationOffset = TARGET_PEAK_DB - peakDecibels;
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.min(MAX_DECIBELS, data[i] + calibrationOffset);
    }
  }

  return {
    frameRate,
    totalFrames,
    duration,
    binCount,
    data,
  };
}

export function getInterpolatedAudioFrame(
  audioData: ExportAudioData,
  time: number,
  destination?: Float32Array,
): Float32Array {
  const { frameRate, totalFrames, binCount, data, duration } = audioData;
  const clampedTime = Math.max(0, Math.min(time, duration));
  const exactIndex = clampedTime * frameRate;
  const baseIndex = Math.min(
    totalFrames - 1,
    Math.max(0, Math.floor(exactIndex)),
  );
  const nextIndex = Math.min(totalFrames - 1, baseIndex + 1);
  const interpolation = Math.min(1, Math.max(0, exactIndex - baseIndex));

  let output = destination;
  if (!output || output.length !== binCount) {
    output = new Float32Array(binCount);
  }

  const baseOffset = baseIndex * binCount;
  const nextOffset = nextIndex * binCount;

  if (interpolation === 0 || baseIndex === nextIndex) {
    for (let i = 0; i < binCount; i++) {
      output[i] = data[baseOffset + i];
    }
    return output;
  }

  for (let i = 0; i < binCount; i++) {
    const value0 = data[baseOffset + i];
    const value1 = data[nextOffset + i];
    output[i] = value0 + (value1 - value0) * interpolation;
  }

  return output;
}

export const AUDIO_MIN_DECIBELS = MIN_DECIBELS;
export const AUDIO_MAX_DECIBELS = MAX_DECIBELS;
