# Export Feature

## Overview

The export feature allows users to render and export their audiovisual compositions as MP4 video files. It uses **Mediabunny**, a cutting-edge w### Limitations

1. **Browser Support**: Requires modern browser with:
   - WebCodecs API (used by Mediabunny)
   - WebGPU (for Three.js rendering)
   - File System Access API preferred but not required (fallback available)
   
2. **Export Speed**: Exports happen in real-time (due to audio playback)
   - A 60-second video takes ~60 seconds to export frames + encoding time
   - Cannot be faster than real-time when audio is includedencoding library, to generate high-quality videos directly in the browser.

## Features

- **Video Export**: Export compositions as MP4 files
- **Audio Export**: Audio is captured and synchronized with video ✨
- **Resolution Scaling**: Scale to 720p, 1080p, 1440p, or 2K while maintaining aspect ratio
- **Customizable Settings**:
  - **Resolution**: 720p, 1080p, 1440p, 2K (default: 720p)
  - **Framerate**: 30 FPS or 60 FPS (default: 30)
  - **Bitrate**: 1, 8, or 20 Mbps (default: 8)
  - **Quality**: 20-100% (default: 100%)
- **Frame-Perfect Timing**: Ensures audio and animations are perfectly synchronized
- **Progress Tracking**: Real-time progress updates during export
- **Browser-Native**: Uses File System Access API when available, falls back to download
- **Smart Scaling**: Maintains canvas aspect ratio when scaling to target resolution

## How It Works

### Key Design Decisions

1. **Frame-Perfect Synchronization**
   - Each frame is rendered at its exact timestamp
   - Double animation frame wait ensures React + Three.js updates complete
   - No audio/animation drift, even for long videos

2. **Smart Resolution Scaling**
   - Canvas is scaled to target resolution (720p, 1080p, etc.)
   - Aspect ratio is always maintained
   - Uses high-quality 2D context scaling
   - Fits within target resolution bounds

3. **Browser Compatibility**
   - Uses File System Access API when available (Chrome, Edge)
   - Falls back to automatic download in other browsers
   - No loss of functionality in fallback mode

4. **Fragmented MP4**
   - Uses fragmented MP4 format for efficient encoding
   - No packet buffering required
   - Streams directly to disk or buffer

5. **Audio Export**
   - Audio is captured from Tone.js Destination node
   - Routed through MediaStreamDestination
   - Encoded as AAC at 128 kbps
   - Synchronized with video frames

### Export Process

```
User clicks Export → Settings Dialog
                    ↓
         Choose Resolution & Settings
                    ↓
    File Save Dialog (or auto-download fallback)
                    ↓
         Create Offscreen Canvas (scaled)
                    ↓
         Setup Audio Capture (MediaStreamDestination)
                    ↓
         Create Mediabunny Output (Video + Audio tracks)
                    ↓
         Start Audio Playback
                    ↓
         For each frame:
           - Sync Tone.js Transport to frame time
           - Set currentTime to exact frame timestamp
           - Wait for React + Three.js updates
           - Draw source canvas to scaled canvas
           - Capture scaled canvas to video encoder
           - Audio is captured in real-time from Tone.js
           - Update progress
                    ↓
         Stop Audio Playback
                    ↓
         Finalize and save/download
```

### Architecture

```
ExportDialog (UI)
    ↓
ExportManager (Core Logic)
    ↓
Mediabunny (Encoding)
    ├─ CanvasSource (Video)
    ├─ Mp4OutputFormat (Container)
    └─ StreamTarget (File Writing)
```

## Usage

### For Users

1. Load an audio file
2. Create your composition with objects, animations, and effects
3. Click the **Export** button in the top bar
4. Configure settings:
   - Choose framerate (30 or 60 FPS)
   - Select bitrate (higher = better quality, larger file)
   - Adjust quality (100% recommended)
5. Click **Export** and choose where to save the file
6. Wait for rendering to complete (progress shown)

### For Developers

#### Adding Export to a Component

```tsx
import { useState, useRef } from "react";
import { ExportDialog } from "@/features/export";
import { Viewport } from "@/features/canvas/components/viewport";

function MyComponent() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <>
      <button onClick={() => setIsExportOpen(true)}>
        Export
      </button>
      
      <Viewport 
        onCanvasReady={(canvas) => canvasRef.current = canvas} 
      />
      
      <ExportDialog
        canvas={canvasRef.current}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </>
  );
}
```

#### Programmatic Export

```tsx
import { ExportManager } from "@/features/export";

const manager = new ExportManager((progress) => {
  console.log(`Progress: ${progress.progress}%`);
});

await manager.export(
  canvasElement,
  {
    resolution: "1080p",
    framerate: 30,
    bitrate: 8,
    quality: 100,
  },
  durationInSeconds,
  audioPlayer,
  (time) => {
    // Update scene to this time
    setCurrentTime(time);
  }
);
```

## Technical Details

### Mediabunny Integration

- **Output Format**: MP4 with H.264 (AVC) video codec
- **Fragmented MP4**: Uses fragmented mode for efficient streaming and encoding
- **Canvas Source**: Directly captures WebGL canvas frames
- **File System API**: Writes directly to disk without loading entire file in memory

### Performance Considerations

- **Quality Setting**: Lower quality can speed up export by reducing overhead, but timing remains accurate
- **Framerate**: 60 FPS exports take twice as long as 30 FPS
- **Bitrate**: Higher bitrates produce larger files but don't significantly slow down export
- **Browser Performance**: Export speed depends on scene complexity and browser performance

### Limitations

1. **Audio Export**: Currently, audio export is not implemented
   - Video-only exports are supported
   - Audio can be added in post-production
   - Future enhancement: Direct audio integration

2. **Resolution**: The exported video uses the canvas's current resolution
   - The resolution setting in the UI is for reference
   - To change output resolution, the canvas size would need to be changed (not recommended)

3. **Browser Support**: Requires modern browser with:
   - File System Access API
   - WebCodecs API (used by Mediabunny)
   - WebGPU (for Three.js rendering)

## File Structure

```
src/features/export/
├── components/
│   └── export-dialog.tsx      # UI for export settings
├── export-manager.ts          # Core export logic
├── state.ts                   # Jotai atoms for export state
├── types.ts                   # TypeScript types
└── index.ts                   # Public API
```

## Future Enhancements

- [ ] Export presets (e.g., "YouTube", "Instagram", "Twitter")
- [ ] Batch export (multiple compositions)
- [ ] Export queue (export in background)
- [ ] Export with alpha channel (transparent background)
- [ ] WebM format support
- [ ] Image sequence export
- [ ] Export cancel/pause/resume
- [ ] Custom resolution input (beyond presets)
- [ ] Offline rendering (faster than real-time, no audio playback needed)

## Credits

- **Mediabunny**: Fast, modern media encoding library - [mediabunny.dev](https://mediabunny.dev)
- **Three.js**: 3D rendering engine
- **Tone.js**: Audio framework
- **React Three Fiber**: React renderer for Three.js
