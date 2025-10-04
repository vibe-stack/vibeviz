import {
  Output,
  Mp4OutputFormat,
  StreamTarget,
  CanvasSource,
  AudioBufferSource,
} from "mediabunny";
import type { BufferTarget } from "mediabunny";
import type { AudioClip } from "@/features/audio/types";
import * as Tone from "tone";
import type { ExportSettings, ExportProgress } from "./types";
import { RESOLUTION_MAP } from "./types";

export class ExportManager {
  private output: Output | null = null;
  private videoSource: CanvasSource | null = null;
  private audioSource: AudioBufferSource | null = null;
  private onProgress: ((progress: ExportProgress) => void) | null = null;
  private aborted = false;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenContext: CanvasRenderingContext2D | null = null;

  constructor(onProgress?: (progress: ExportProgress) => void) {
    this.onProgress = onProgress || null;
  }

  /**
   * Start the export process
   */
  async export(
    canvas: HTMLCanvasElement,
    settings: ExportSettings,
    duration: number,
    audioPlayer: Tone.Player | null,
    onTimeUpdate: (time: number) => void,
    audioClip: AudioClip | null,
    onAudioPlayerChange?: (player: Tone.Player | null) => void
  ): Promise<Uint8Array | null> {
    this.aborted = false;

    const framerate = settings.framerate;
    const totalFrames = Math.ceil(duration * framerate);
    const originalPlayer = audioPlayer;
    let exportPlayer: Tone.Player | null = null;
    let tempPlayerCreated = false;
    let preparedAudioBuffer: AudioBuffer | null = null;
    let hasAudio = false;

    try {
      // Update progress
      this.updateProgress({
        state: "rendering",
        currentFrame: 0,
        totalFrames,
        progress: 0,
      });

      // Get target resolution
      const targetResolution = RESOLUTION_MAP[settings.resolution];
      
      // Calculate scaled dimensions maintaining aspect ratio
      const sourceAspect = canvas.width / canvas.height;
      const targetAspect = targetResolution.width / targetResolution.height;
      
      let scaledWidth = targetResolution.width;
      let scaledHeight = targetResolution.height;
      
      // Maintain aspect ratio - fit within target resolution
      if (sourceAspect > targetAspect) {
        // Source is wider - fit to width
        // Round to nearest even number (required for video codecs)
        scaledHeight = Math.round(targetResolution.width / sourceAspect / 2) * 2;
      } else {
        // Source is taller - fit to height
        // Round to nearest even number (required for video codecs)
        scaledWidth = Math.round(targetResolution.height * sourceAspect / 2) * 2;
      }

      // Create offscreen canvas for scaling
      this.offscreenCanvas = document.createElement("canvas");
      this.offscreenCanvas.width = scaledWidth;
      this.offscreenCanvas.height = scaledHeight;
      this.offscreenContext = this.offscreenCanvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      });

      if (!this.offscreenContext) {
        throw new Error("Failed to create 2D context for scaling");
      }

      // Prepare audio data upfront (used for both visuals and final muxing)
      preparedAudioBuffer = await this.prepareAudioBuffer(audioClip, audioPlayer);

      if (preparedAudioBuffer) {
        exportPlayer = new Tone.Player(preparedAudioBuffer);
        exportPlayer.fadeIn = 0;
        exportPlayer.fadeOut = 0;
        exportPlayer.loop = false;
        tempPlayerCreated = true;
        hasAudio = true;
      }

      // Check for File System Access API support
      const useFileSystemAPI = "showSaveFilePicker" in window;
      let writableStream: WritableStream | null = null;
      let bufferTarget: BufferTarget | null = null;

      if (useFileSystemAPI) {
        // Use File System Access API
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `export_${Date.now()}.mp4`,
          types: [
            {
              description: "MP4 Video",
              accept: { "video/mp4": [".mp4"] },
            },
          ],
        });
        writableStream = await fileHandle.createWritable();
      } else {
        // Fallback to BufferTarget
        bufferTarget = new (await import("mediabunny")).BufferTarget();
      }

      // Create output with MP4 format
      this.output = new Output({
        format: new Mp4OutputFormat({
          fastStart: "fragmented",
        }),
        target: writableStream ? new StreamTarget(writableStream) : bufferTarget!,
      });

      // Create video source from scaled canvas
      const bitrateBps = settings.bitrate * 1_000_000; // Convert Mbps to bps
      
      this.videoSource = new CanvasSource(this.offscreenCanvas, {
        codec: "avc",
        bitrate: bitrateBps,
      } as any);

      // Add video track
      this.output.addVideoTrack(this.videoSource, {
        frameRate: framerate,
      });

      // Add audio track if available (but don't add data yet)
      if (hasAudio) {
        try {
          this.audioSource = new AudioBufferSource({
            codec: "aac",
            bitrate: 128_000,
          });
          this.output.addAudioTrack(this.audioSource);
          console.log("✅ Audio track configured for export");
        } catch (error) {
          console.warn("Could not configure audio track:", error);
          this.audioSource = null;
          hasAudio = false;
        }
      }

      // Start the output (after adding all tracks!)
      await this.output.start();

      // Update audio player reference for analyzers
      if (hasAudio && exportPlayer) {
        await Tone.start();
        if (onAudioPlayerChange) {
          onAudioPlayerChange(exportPlayer);
        }
      }

      // Render video frames with audio-reactive effects
      await this.renderFrames(
        canvas,
        framerate,
        duration,
        totalFrames,
        onTimeUpdate,
        settings.quality,
        exportPlayer,
        hasAudio
      );

      if (this.aborted) {
        await this.output.cancel();
        return null;
      }

      // Now add the audio buffer data
      if (hasAudio && this.audioSource && preparedAudioBuffer) {
        console.log("🎵 Adding audio data to track...");
        try {
          await this.audioSource.add(preparedAudioBuffer);
          this.audioSource.close();
          console.log("✅ Audio data added successfully");
        } catch (error) {
          console.error("Failed to add audio data:", error);
        }
      }

      // Finalize the output
      this.updateProgress({
        state: "encoding",
        currentFrame: totalFrames,
        totalFrames,
        progress: 99,
      });

      await this.output.finalize();

      this.updateProgress({
        state: "complete",
        currentFrame: totalFrames,
        totalFrames,
        progress: 100,
      });

      // Restore audio player
      if (onAudioPlayerChange) {
        onAudioPlayerChange(originalPlayer ?? null);
      }

      // If using buffer target, download the file
      if (bufferTarget?.buffer) {
        this.downloadBuffer(bufferTarget.buffer, `export_${Date.now()}.mp4`);
        return new Uint8Array(bufferTarget.buffer);
      }

      return null;
    } catch (error) {
      console.error("Export error:", error);
      this.updateProgress({
        state: "error",
        currentFrame: 0,
        totalFrames,
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      
      // Restore audio player
      if (onAudioPlayerChange) {
        onAudioPlayerChange(audioPlayer);
      }
      
      throw error;
    } finally {
      if (tempPlayerCreated && exportPlayer) {
        exportPlayer.dispose();
      }
      this.cleanup();
    }
  }

  /**
   * Load the audio buffer from either the active player or the original clip
   */
  private async prepareAudioBuffer(
    audioClip: AudioClip | null,
    audioPlayer: Tone.Player | null,
  ): Promise<AudioBuffer | null> {
    try {
      if (audioPlayer?.buffer.loaded) {
        const playerBuffer = audioPlayer.buffer.get();
        if (playerBuffer) {
          return playerBuffer;
        }
      }

      if (audioClip?.blob) {
        const arrayBuffer = await audioClip.blob.arrayBuffer();
        const audioContext = Tone.getContext().rawContext as AudioContext;
        return await audioContext.decodeAudioData(arrayBuffer.slice(0));
      }

      if (audioClip?.url) {
        const response = await fetch(audioClip.url);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = Tone.getContext().rawContext as AudioContext;
        return await audioContext.decodeAudioData(arrayBuffer);
      }
    } catch (error) {
      console.error("Failed to prepare audio buffer:", error);
    }

    return null;
  }

  /**
   * Render all video frames with audio-reactive effects
   */
  private async renderFrames(
    sourceCanvas: HTMLCanvasElement,
    framerate: number,
    duration: number,
    totalFrames: number,
    onTimeUpdate: (time: number) => void,
    quality: number,
    audioPlayer: Tone.Player | null,
    hasAudio: boolean
  ): Promise<void> {
    const frameDuration = 1 / framerate;

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (this.aborted) {
        break;
      }

      const videoTime = frameIndex * frameDuration;
      
      if (videoTime >= duration) {
        break;
      }

      if (hasAudio && audioPlayer && audioPlayer.buffer.loaded) {
        try {
          audioPlayer.stop();
          audioPlayer.seek(videoTime);
          audioPlayer.start("+0", videoTime);

          await new Promise((resolve) => setTimeout(resolve, 35));
        } finally {
          audioPlayer.stop();
        }
      }

      // Update scene (keyframes + audio-reactive effects)
      onTimeUpdate(videoTime);

      // Wait for React and Three.js rendering
      await this.waitForFrame();
      await this.waitForFrame();

      // Scale and capture frame
      if (this.offscreenContext && this.offscreenCanvas) {
        this.offscreenContext.drawImage(
          sourceCanvas,
          0,
          0,
          sourceCanvas.width,
          sourceCanvas.height,
          0,
          0,
          this.offscreenCanvas.width,
          this.offscreenCanvas.height
        );
      }

      // Add frame to video
      if (this.videoSource) {
        await this.videoSource.add(videoTime, frameDuration);
      }

      // Update progress
      const progress = ((frameIndex + 1) / totalFrames) * 98;
      this.updateProgress({
        state: "rendering",
        currentFrame: frameIndex + 1,
        totalFrames,
        progress,
      });

      if (quality < 100 && frameIndex % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    if (hasAudio && audioPlayer) {
      audioPlayer.stop();
    }
  }

  /**
   * Cancel the export
   */
  async cancel(): Promise<void> {
    this.aborted = true;
    if (this.output) {
      await this.output.cancel();
    }
  }

  /**
   * Alias used by the UI to abort the export process
   */
  async abort(): Promise<void> {
    await this.cancel();
  }

  /**
   * Wait for next animation frame
   */
  private waitForFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  /**
   * Update progress
   */
  private updateProgress(progress: ExportProgress): void {
    if (this.onProgress) {
      this.onProgress(progress);
    }
  }

  /**
   * Download buffer as file
   */
  private downloadBuffer(buffer: ArrayBuffer, filename: string): void {
    const blob = new Blob([buffer], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.audioSource = null;
    this.videoSource = null;
    this.output = null;
    this.offscreenCanvas = null;
    this.offscreenContext = null;
  }
}
