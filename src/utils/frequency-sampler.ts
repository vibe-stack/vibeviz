import FFT from "fft.js";

export interface FrequencySamplerOptions {
  fftSize?: number;
  smoothing?: number;
  minDecibels?: number;
  maxDecibels?: number;
  windowFunction?: "hann" | "hamming";
}

export interface FrequencySamplerFrame {
  time: number;
  data: Uint8Array;
}

export interface FrequencySampler {
  readonly binCount: number;
  sample(time: number): Uint8Array;
  reset(): void;
}

const DEFAULT_OPTIONS: Required<Omit<FrequencySamplerOptions, "windowFunction">> & {
  windowFunction: "hann" | "hamming";
} = {
  fftSize: 512,
  smoothing: 0.8,
  minDecibels: -100,
  maxDecibels: -30,
  windowFunction: "hann",
};

const EPSILON = 1e-12;

const createWindow = (fftSize: number, type: "hann" | "hamming"): Float32Array => {
  const window = new Float32Array(fftSize);
  const denom = fftSize - 1;

  for (let i = 0; i < fftSize; i += 1) {
    if (type === "hann") {
      window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / denom));
    } else {
      window[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / denom);
    }
  }

  return window;
};

const clamp = (value: number, min: number, max: number) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

export const createFrequencySampler = (
  audioBuffer: AudioBuffer,
  options: FrequencySamplerOptions = {},
): FrequencySampler => {
  const { fftSize, smoothing, minDecibels, maxDecibels, windowFunction } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  if ((fftSize & (fftSize - 1)) !== 0) {
    throw new Error("fftSize must be a power of two");
  }

  const binCount = fftSize / 2;

  const fft = new FFT(fftSize);
  const spectrum = fft.createComplexArray();
  const input = new Float64Array(fftSize);
  const window = createWindow(fftSize, windowFunction);

  const smoothedMagnitudes = new Float32Array(binCount);
  const output = new Uint8Array(binCount);

  const channelCount = audioBuffer.numberOfChannels;
  const channelData: Float32Array[] = new Array(channelCount);

  for (let channel = 0; channel < channelCount; channel += 1) {
    channelData[channel] = audioBuffer.getChannelData(channel);
  }

  const sampleRate = audioBuffer.sampleRate;
  const totalSamples = audioBuffer.length;
  const duration = audioBuffer.duration;

  const pullSample = (index: number) => {
    if (index < 0 || index >= totalSamples) {
      return 0;
    }

    if (channelCount === 1) {
      return channelData[0][index];
    }

    let sum = 0;
    for (let channel = 0; channel < channelCount; channel += 1) {
      sum += channelData[channel][index];
    }
    return sum / channelCount;
  };

  const reset = () => {
    smoothedMagnitudes.fill(0);
    output.fill(0);
  };

  const sample = (time: number) => {
    const clampedTime = clamp(time, 0, duration);
    const endSampleIndex = Math.floor(clampedTime * sampleRate);
    const startIndex = endSampleIndex - fftSize;

    for (let i = 0; i < fftSize; i += 1) {
      const sampleIndex = startIndex + i;
      input[i] = pullSample(sampleIndex) * window[i];
    }

    fft.realTransform(spectrum, input);
    fft.completeSpectrum(spectrum);

    for (let bin = 0; bin < binCount; bin += 1) {
      const real = spectrum[bin * 2];
      const imaginary = spectrum[bin * 2 + 1];
      let magnitude = Math.sqrt(real * real + imaginary * imaginary);
      magnitude = magnitude / (fftSize / 2);

      let decibels = 20 * Math.log10(magnitude + EPSILON);
      decibels = clamp(decibels, minDecibels, maxDecibels);

      const normalized = (decibels - minDecibels) / (maxDecibels - minDecibels);
      const smoothed = smoothedMagnitudes[bin] * smoothing + normalized * (1 - smoothing);

      smoothedMagnitudes[bin] = smoothed;
      output[bin] = Math.max(0, Math.min(255, Math.round(smoothed * 255)));
    }

    return output;
  };

  return {
    binCount,
    sample,
    reset,
  };
};
