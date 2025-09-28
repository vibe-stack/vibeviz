export interface AudioData {
  buffer: AudioBuffer;
  duration: number;
  waveform: Float32Array;
  frequencyData: Float32Array;
}

export class AudioProcessor {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;

  constructor() {
    this.audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;
    this.analyser.minDecibels = -100;
    this.analyser.maxDecibels = -30;
    this.dataArray = new Uint8Array(
      new ArrayBuffer(this.analyser.frequencyBinCount),
    );
  }

  async loadAudioFile(file: File): Promise<AudioData> {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    const waveform = this.extractWaveform(audioBuffer);
    const frequencyData = new Float32Array(this.analyser.frequencyBinCount);

    return {
      buffer: audioBuffer,
      duration: audioBuffer.duration,
      waveform,
      frequencyData,
    };
  }

  private extractWaveform(
    audioBuffer: AudioBuffer,
    samples = 1000,
  ): Float32Array {
    const channelData = audioBuffer.getChannelData(0);
    const samplesPerChunk = Math.floor(channelData.length / samples);
    const waveform = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const start = i * samplesPerChunk;
      const end = start + samplesPerChunk;
      let sum = 0;

      for (let j = start; j < end; j++) {
        sum += Math.abs(channelData[j]);
      }

      waveform[i] = sum / samplesPerChunk;
    }

    return waveform;
  }

  getFrequencyData(): Uint8Array {
    // @ts-ignore - TypeScript issue with Web Audio API types
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  get context() {
    return this.audioContext;
  }

  get analyserNode() {
    return this.analyser;
  }
}
