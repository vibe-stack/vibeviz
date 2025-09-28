import {
  Output,
  Mp4OutputFormat,
  BufferTarget,
  MediaStreamVideoTrackSource,
  AudioBufferSource,
  QUALITY_MEDIUM,
} from "mediabunny";

interface ExportOptions {
  canvas: HTMLCanvasElement;
  audioBuffer: AudioBuffer;
  duration: number;
  frameRate?: number;
  bitrate?: number;
  onProgress?: (frame: number, totalFrames: number) => void;
  onStartPlayback?: () => void | Promise<void>;
  onStopPlayback?: () => void | Promise<void>;
}
export class VideoExporter {
  private output: Output | null = null;
  private videoSource: MediaStreamVideoTrackSource | null = null;
  private audioSource: AudioBufferSource | null = null;
  private isExporting = false;
  private frameCount = 0;
  private captureTrack: MediaStreamTrack | null = null;
  private progressTimer: ReturnType<typeof setInterval> | null = null;

  async exportVideo({
    canvas,
    audioBuffer,
    duration,
    frameRate = 30,
    bitrate = 2e6,
    onProgress,
    onStartPlayback,
    onStopPlayback,
  }: ExportOptions): Promise<void> {
    if (this.isExporting) {
      throw new Error("Export already in progress");
    }

    this.isExporting = true;
    this.frameCount = 0;

    const cleanupProgressTimer = () => {
      if (this.progressTimer !== null) {
        clearInterval(this.progressTimer);
        this.progressTimer = null;
      }
    };

  let playbackStarted = false;
  let playbackStopped = false;

  try {
      this.output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget(),
      });

      const captureStream = canvas.captureStream(frameRate);
      const [track] = captureStream.getVideoTracks();

      if (!track) {
        throw new Error("Failed to obtain video track from canvas");
      }

      const settings = track.getSettings();
      const effectiveFrameRate = settings.frameRate ?? frameRate;
      const totalFrames = Math.ceil(duration * effectiveFrameRate);

      this.captureTrack = track;
      this.videoSource = new MediaStreamVideoTrackSource(track, {
        codec: "avc",
        bitrate,
      });

      this.audioSource = new AudioBufferSource({
        codec: "aac",
        bitrate: QUALITY_MEDIUM,
      });

      this.output.addVideoTrack(this.videoSource, { frameRate: effectiveFrameRate });
      this.output.addAudioTrack(this.audioSource);

      await this.output.start();

      await this.audioSource.add(audioBuffer);
      this.audioSource.close();

      let captureStart = performance.now();
      const updateProgress = () => {
        const elapsedMs = Math.min(performance.now() - captureStart, duration * 1000);
        const estimatedFrames = Math.min(
          totalFrames,
          Math.round((elapsedMs / 1000) * effectiveFrameRate),
        );

        this.frameCount = estimatedFrames;
        onProgress?.(estimatedFrames, totalFrames);
      };

      if (onProgress) {
        this.progressTimer = setInterval(updateProgress, 250);
      }

      if (onStartPlayback) {
        await onStartPlayback();
        playbackStarted = true;
      }

      captureStart = performance.now();
      updateProgress();

  const captureDurationMs = Math.ceil(duration * 1000 + 1000 / effectiveFrameRate);
      await new Promise((resolve) => setTimeout(resolve, captureDurationMs));
      updateProgress();

      if (onStopPlayback) {
        await onStopPlayback();
        playbackStopped = true;
      }

      if (this.captureTrack) {
        this.captureTrack.stop();
        this.captureTrack = null;
      }

      if (this.videoSource) {
        this.videoSource.close();
        this.videoSource = null;
      }

      cleanupProgressTimer();

      await this.output.finalize();

      const bufferTarget = this.output.target as BufferTarget;
      this.downloadFile(bufferTarget.buffer, "vibeviz-export.mp4");

      console.log("Export completed successfully");
    } catch (error) {
      console.error("Export failed:", error);
      cleanupProgressTimer();
      if (this.output) {
        await this.output.cancel();
      }
      throw error;
    } finally {
      cleanupProgressTimer();
      if (playbackStarted && !playbackStopped && onStopPlayback) {
        try {
          await onStopPlayback();
        } catch (stopError) {
          console.warn("Failed to stop playback after export:", stopError);
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
    
    // Clean up the object URL
    URL.revokeObjectURL(url);
  }

  private cleanup(): void {
    this.isExporting = false;
    this.output = null;
    if (this.videoSource) {
      this.videoSource.close();
      this.videoSource = null;
    }
    this.audioSource = null;
    this.frameCount = 0;
    if (this.captureTrack) {
      this.captureTrack.stop();
      this.captureTrack = null;
    }
    if (this.progressTimer !== null) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  cancel(): void {
    this.isExporting = false;
    if (this.progressTimer !== null) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
    if (this.captureTrack) {
      this.captureTrack.stop();
      this.captureTrack = null;
    }
    if (this.videoSource) {
      this.videoSource.close();
      this.videoSource = null;
    }
    if (this.output) {
      this.output.cancel();
    }
  }

  get progress(): number {
    return this.frameCount;
  }
}

export const createVideoExporter = () => new VideoExporter();