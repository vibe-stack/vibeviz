# Timer Engine

A unified timer engine that synchronizes **AnimeJS**, **ToneJS**, and **React Three Fiber** together, with AnimeJS as the single source of truth.

## Features

- 🎬 **AnimeJS Timeline** as the master clock
- 🎵 **ToneJS** audio playback synchronized to timeline
- 🎨 **React Three Fiber** animations driven by AnimeJS values
- 🔄 **Unified API** for play, pause, stop, and seek operations
- 📊 **Real-time sync** between all three systems
- 🎯 **Type-safe** with full TypeScript support

## Architecture

```
┌─────────────────────────────────────────┐
│         TimerEngine (Master)            │
│  ┌────────────────────────────────┐    │
│  │  AnimeJS Timeline (Source)     │    │
│  │  - Playback control            │    │
│  │  - Seeking                     │    │
│  │  - Animation values            │    │
│  └────────────────────────────────┘    │
│           ↓           ↓                  │
│  ┌─────────────┐  ┌──────────────┐     │
│  │   ToneJS    │  │ Animation    │     │
│  │   Transport │  │ Targets      │     │
│  └─────────────┘  └──────────────┘     │
│         ↓              ↓                 │
│    Audio Output    R3F Meshes           │
└─────────────────────────────────────────┘
```

## Basic Usage

### 1. Create the Engine

```typescript
import { TimerEngine } from "@/lib/timerEngine";

const engine = new TimerEngine({
  onTimeUpdate: (time) => console.log("Current time:", time),
  onStateChange: (state) => console.log("State:", state),
  onComplete: () => console.log("Playback complete"),
});
```

### 2. Initialize with Audio

```typescript
await engine.init("/path/to/audio.mp3");
```

### 3. Create Animation Targets

```typescript
const targets = {
  cube: { y: 0, rotation: 0, scale: 1 },
  sphere: { x: 0, opacity: 1 },
};
```

### 4. Add Animations to Timeline

```typescript
const timeline = engine.getTimeline();

// Simple animation
timeline.add(targets.cube, {
  y: 2,
  rotation: Math.PI * 2,
  duration: 2000,
});

// Keyframe animation
timeline.add(targets.sphere, {
  x: [
    { value: 2, duration: 1000, ease: "out(3)" },
    { value: -2, duration: 1000, ease: "in(3)" },
  ],
  opacity: [1, 0.5, 1],
  duration: 2000,
}, 0); // Start at time 0
```

### 5. Update in Render Loop (R3F)

```typescript
import { useFrame } from "@react-three/fiber";

function Scene({ engine, targets }) {
  const meshRef = useRef();

  useFrame(() => {
    // Update the engine (syncs everything)
    engine.update();

    // Apply animation values to meshes
    if (meshRef.current) {
      meshRef.current.position.y = targets.cube.y;
      meshRef.current.rotation.y = targets.cube.rotation;
    }
  });

  return <mesh ref={meshRef} />;
}
```

### 6. Playback Control

```typescript
// Play
await engine.play();

// Pause
engine.pause();

// Stop (resets to start)
engine.stop();

// Seek to 5 seconds
engine.seek(5.0);

// Get current time
const time = engine.getCurrentTime();

// Get duration
const duration = engine.getDuration();
```

## Advanced Example: Audio-Reactive Animations

Combine AnimeJS timeline animations with real-time audio analysis:

```typescript
import * as Tone from "tone";

// Setup waveform analyzer
const player = engine.getPlayer();
const waveform = new Tone.Waveform(1024);
player.connect(waveform);

// In render loop
useFrame(() => {
  engine.update();

  // Get audio level
  const waveformData = waveform.getValue();
  const audioLevel = waveformData.reduce((sum, val) => sum + Math.abs(val), 0) / waveformData.length;

  // Combine timeline animation with audio
  if (meshRef.current) {
    // Base position from timeline
    const baseY = targets.cube.y;
    // Audio reactive boost
    const audioBounce = audioLevel * 0.5;
    meshRef.current.position.y = baseY + audioBounce;

    // Base scale from timeline
    const baseScale = targets.cube.scale;
    // Audio reactive pulse
    const audioScale = 1 + audioLevel * 0.3;
    meshRef.current.scale.setScalar(baseScale * audioScale);
  }
});
```

## API Reference

### Constructor

```typescript
new TimerEngine(callbacks?: TimerEngineCallbacks)
```

**Callbacks:**
- `onTimeUpdate?(time: number)` - Called when playback time updates
- `onStateChange?(state: 'idle' | 'playing' | 'paused')` - Called when state changes
- `onComplete?()` - Called when playback completes

### Methods

#### `async init(audioUrl: string, duration?: number): Promise<void>`
Initialize with audio source. Duration is optional and will be auto-detected from audio file.

#### `add(target: any, params: any, position?: string | number): Timeline | null`
Add animation to the timeline. Returns the timeline for chaining.

#### `removeTarget(target: any): void`
Remove animation target from AnimeJS memory.

#### `async play(): Promise<void>`
Start playback from current position.

#### `pause(): void`
Pause at current position.

#### `stop(): void`
Stop and reset to beginning.

#### `seek(time: number): void`
Seek to specific time in seconds.

#### `update(): number`
Update all systems. Call this in your render loop. Returns current time.

#### `getCurrentTime(): number`
Get current playback time in seconds.

#### `getDuration(): number`
Get total duration in seconds.

#### `getState(): 'idle' | 'playing' | 'paused'`
Get current playback state.

#### `getTimeline(): Timeline | null`
Get the AnimeJS timeline instance for direct manipulation.

#### `getPlayer(): Tone.Player | null`
Get the ToneJS player for audio analysis.

#### `dispose(): void`
Clean up all resources.

## Why AnimeJS as the Source of Truth?

1. **Robust Timer Engine**: AnimeJS v4 has the most sophisticated timer system with:
   - Precise seeking capabilities
   - Linear playback easing for accurate sync
   - Timeline composition and nesting
   - Label-based positioning

2. **Keyframe Control**: Complex keyframe animations with multiple easing functions per property

3. **Timeline Flexibility**: Easy to add, remove, sync, and manipulate animations

4. **Performance**: Optimized for real-time updates without blocking

5. **Predictability**: Timeline state is deterministic and can be scrubbed accurately

## Best Practices

1. **Single Engine Instance**: Create one engine per audio track
2. **Cleanup**: Always call `dispose()` when unmounting
3. **Seek Performance**: Use `pause()` before seeking if currently playing
4. **Audio Analysis**: Connect ToneJS analyzers (Waveform, FFT, Meter) for reactive effects
5. **Target References**: Use `useRef` in React to maintain stable object references
6. **Update Frequency**: Call `engine.update()` in `useFrame()` for smooth synchronization

## Example Project Structure

```
src/
├── lib/
│   ├── timerEngine.ts       # The engine
│   └── rainbowMaterial.ts   # Custom materials
├── components/
│   └── Scene.tsx            # R3F scene component
└── app/
    └── page.tsx             # Main app with controls
```

## Troubleshooting

**Audio not playing?**
- Ensure `Tone.start()` is called (handled by `engine.play()`)
- Check browser autoplay policies

**Timeline not syncing?**
- Make sure `engine.update()` is called every frame
- Verify timeline duration matches audio duration

**Seeking jumps around?**
- Check if you're calling `seek()` during playback
- Use `pause()` first for more accurate seeking

**Memory leaks?**
- Call `engine.dispose()` in cleanup
- Call `removeTarget()` for removed animation targets

## License

MIT
