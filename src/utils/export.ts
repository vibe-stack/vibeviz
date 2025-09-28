import {
  Output,
  Mp4OutputFormat,
  BufferTarget,
  CanvasSource,
  AudioBufferSource,
  QUALITY_HIGH,
} from "mediabunny";

export interface RenderFrameInfo {
  frameIndex: number;
  totalFrames: number;
  time: number;
  delta: number;
  frameRate: number;
}

interface ExportOptions {
  canvas: HTMLCanvasElement;
  audioBuffer: AudioBuffer;
  duration: number;
  frameRate?: number;
  bitrate?: number;
  onProgress?: (frame: number, totalFrames: number) => void;
  onRenderStart?: () => void | Promise<void>;
  onRenderComplete?: () => void | Promise<void>;
  renderFrame: (info: RenderFrameInfo) => void | Promise<void>;
}

export class VideoExporter {
  private output: Output | null = null;
  private videoSource: CanvasSource | null = null;
  private audioSource: AudioBufferSource | null = null;
  private isExporting = false;
  private frameCount = 0;
  private shouldCancel = false;

  async exportVideo({
    canvas,
    audioBuffer,
    duration,
    frameRate = 60,
    bitrate = 12_000_000,
    onProgress,
    onRenderStart,
    onRenderComplete,
    renderFrame,
  }: ExportOptions): Promise<void> {
    if (this.isExporting) {
      throw new Error("Export already in progress");
    }

    if (!renderFrame) {
      throw new Error("renderFrame callback is required for exporting");
    }

    const width = canvas.width || canvas.clientWidth;
    const height = canvas.height || canvas.clientHeight;

    if (!width || !height) {
      throw new Error("Invalid canvas dimensions for export");
    }

    console.log(`Exporting at ${width}x${height} (${frameRate}fps)`);

    this.isExporting = true;
    this.shouldCancel = false;
    this.frameCount = 0;

    const totalFrames = Math.max(1, Math.ceil(duration * frameRate));
    const frameDuration = 1 / frameRate;
    let renderStarted = false;

    try {
      this.output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget(),
      });

      this.videoSource = new CanvasSource(canvas, {
        codec: "avc",
        bitrate,
        sizeChangeBehavior: "contain",
        keyFrameInterval: 5,
        // bitrateMode: "constant",
        // latencyMode: "realtime",
      });

      this.audioSource = new AudioBufferSource({
        codec: "aac",
        bitrate: QUALITY_HIGH,
      });

      this.output.addVideoTrack(this.videoSource, {
        frameRate,
        maximumPacketCount: totalFrames + 2,
      });
      this.output.addAudioTrack(this.audioSource);

      await this.output.start();

      await this.audioSource.add(audioBuffer);
      this.audioSource.close();

      if (onRenderStart) {
        await onRenderStart();
        renderStarted = true;
      }

      let previousTime = 0;

      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
        if (this.shouldCancel) {
          throw new Error("Export canceled");
        }

        const time = Math.min(frameIndex * frameDuration, duration);
        const delta = frameIndex === 0 ? 0 : time - previousTime;

        await renderFrame({
          frameIndex,
          totalFrames,
          time,
          delta,
          frameRate,
        });

        // Use requestAnimationFrame to prevent blocking the main thread
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            this.videoSource?.add(time, frameDuration).then(resolve);
          });
        });

        previousTime = time;
        this.frameCount = frameIndex + 1;
        
        // Only call onProgress every 30 frames to reduce overhead
        if (frameIndex % 30 === 0 || frameIndex === totalFrames - 1) {
          onProgress?.(this.frameCount, totalFrames);
        }
      }

      if (duration > 0 && Math.abs(duration - totalFrames * frameDuration) > 1e-4) {
        const finalTime = duration;
        const delta = finalTime - previousTime;
        if (delta > 1e-4 && !this.shouldCancel) {
          await renderFrame({
            frameIndex: totalFrames,
            totalFrames: totalFrames + 1,
            time: finalTime,
            delta,
            frameRate,
          });
          await this.videoSource.add(finalTime, frameDuration);
          this.frameCount = totalFrames + 1;
          onProgress?.(this.frameCount, totalFrames + 1);
        }
      }

      if (renderStarted && onRenderComplete) {
        await onRenderComplete();
        renderStarted = false;
      }

      await this.output.finalize();

      const bufferTarget = this.output.target as BufferTarget;
      this.downloadFile(bufferTarget.buffer, "vibeviz-export.mp4");
    } catch (error) {
      if (this.output) {
        await this.output.cancel();
      }
      throw error;
    } finally {
      if (renderStarted && onRenderComplete) {
        try {
          await onRenderComplete();
        } catch (completionError) {
          console.warn("Export cleanup failed:", completionError);
        }
      }
      
      this.cleanup();
    }
  }

  private downloadFile(buffer: ArrayBuffer | null, filename: string): void {
    if (!buffer) {
      console.error("No buffer to download");
      return;
    }

    const blob = new Blob([buffer], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }

  private cleanup(): void {
    this.isExporting = false;
    this.shouldCancel = false;

    if (this.videoSource) {
      this.videoSource.close();
      this.videoSource = null;
    }

    this.audioSource = null;

    if (this.output) {
      this.output = null;
    }

    this.frameCount = 0;
  }

  cancel(): void {
    if (!this.isExporting) {
      return;
    }

    this.shouldCancel = true;
  }

  get progress(): number {
    return this.frameCount;
  }
}

export const createVideoExporter = () => new VideoExporter();