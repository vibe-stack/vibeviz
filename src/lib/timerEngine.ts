/** biome-ignore-all lint/suspicious/noExplicitAny: For now keep the anys */
import { createTimeline, remove, type Timeline } from "animejs";
import * as Tone from "tone";

type TimerEngineState = "idle" | "playing" | "paused";

export interface TimerEngineCallbacks {
  onTimeUpdate?: (time: number) => void;
  onStateChange?: (state: TimerEngineState) => void;
  onComplete?: () => void;
}

/**
 * Unified timer engine that synchronizes AnimeJS, ToneJS, and R3F.
 * AnimeJS timeline is the single source of truth for all timing.
 */
export class TimerEngine {
  private timeline: Timeline | null = null;
  private tonePlayer: Tone.Player | null = null;
  private duration = 0;
  private state: TimerEngineState = "idle";
  private callbacks: TimerEngineCallbacks = {};

  constructor(callbacks?: TimerEngineCallbacks) {
    this.callbacks = callbacks || {};
  }

  /**
   * Initialize the engine with audio and create the master timeline
   */
  async init(audioUrl: string, timelineDuration?: number): Promise<void> {
    this.dispose();

    // Setup audio player
    const player = new Tone.Player({ autostart: false });
    player.toDestination();

    await player.load(audioUrl);
    this.tonePlayer = player;

    // Use provided duration or buffer duration
    this.duration = timelineDuration || player.buffer?.duration || 0;

    if (this.duration <= 0) {
      throw new Error("Invalid duration");
    }

    // Create master timeline
    this.timeline = createTimeline({
      autoplay: false,
      duration: this.duration * 1000, // AnimeJS uses milliseconds
      playbackEase: "linear",
    });

    // Sync ToneJS player to timeline
    player.sync().start(0);

    this.setState("idle");
  }

  /**
   * Add animation targets to the timeline
   */
  add(target: any, params: any, position?: string | number): Timeline | null {
    if (!this.timeline) {
      console.warn("Timeline not initialized");
      return null;
    }
    return this.timeline.add(target, params, position);
  }

  /**
   * Remove animation targets from memory
   */
  removeTarget(target: any): void {
    remove(target);
  }

  /**
   * Play from current position
   */
  async play(): Promise<void> {
    if (!this.timeline || !this.tonePlayer) {
      console.warn("Engine not initialized");
      return;
    }

    await Tone.start();
    Tone.Transport.start();
    this.timeline.play();
    this.setState("playing");
  }

  /**
   * Pause at current position
   */
  pause(): void {
    if (!this.timeline) return;

    Tone.Transport.pause();
    this.timeline.pause();
    this.setState("paused");
  }

  /**
   * Stop and reset to beginning
   */
  stop(): void {
    if (!this.timeline) return;

    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
    this.timeline.seek(0);
    this.setState("idle");

    if (this.callbacks.onTimeUpdate) {
      this.callbacks.onTimeUpdate(0);
    }
  }

  /**
   * Seek to a specific time in seconds
   */
  seek(time: number): void {
    if (!this.timeline) return;

    const clampedTime = Math.max(0, Math.min(time, this.duration));
    const wasPlaying = this.state === "playing";

    // Pause everything
    if (wasPlaying) {
      Tone.Transport.pause();
    }

    // Seek both systems
    Tone.Transport.seconds = clampedTime;
    this.timeline.seek(clampedTime * 1000);

    // Resume if was playing
    if (wasPlaying) {
      Tone.Transport.start();
    }

    if (this.callbacks.onTimeUpdate) {
      this.callbacks.onTimeUpdate(clampedTime);
    }
  }

  /**
   * Update loop - call this from your render loop (R3F's useFrame)
   * This syncs everything to Tone.Transport and triggers callbacks
   */
  update(): number {
    if (!this.timeline || this.duration <= 0) {
      return 0;
    }

    const currentTime = Tone.Transport.seconds;

    // Sync timeline to transport
    const clampedTime = Math.min(currentTime, this.duration);
    this.timeline.seek(clampedTime * 1000);

    // Check for completion
    if (currentTime >= this.duration && this.state === "playing") {
      this.handleComplete();
    }

    // Trigger time update callback
    if (this.callbacks.onTimeUpdate) {
      this.callbacks.onTimeUpdate(clampedTime);
    }

    return clampedTime;
  }

  /**
   * Get current playback time in seconds
   */
  getCurrentTime(): number {
    return Tone.Transport.seconds;
  }

  /**
   * Get total duration in seconds
   */
  getDuration(): number {
    return this.duration;
  }

  /**
   * Get current state
   */
  getState(): TimerEngineState {
    return this.state;
  }

  /**
   * Get the timeline instance for direct manipulation
   */
  getTimeline(): Timeline | null {
    return this.timeline;
  }

  /**
   * Get the Tone player for additional audio analysis
   */
  getPlayer(): Tone.Player | null {
    return this.tonePlayer;
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    if (this.timeline) {
      this.timeline.pause();
      this.timeline = null;
    }

    if (this.tonePlayer) {
      this.tonePlayer.dispose();
      this.tonePlayer = null;
    }

    this.duration = 0;
    this.setState("idle");
  }

  private handleComplete(): void {
    this.stop();
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete();
    }
  }

  private setState(newState: TimerEngineState): void {
    if (this.state !== newState) {
      this.state = newState;
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(newState);
      }
    }
  }
}
