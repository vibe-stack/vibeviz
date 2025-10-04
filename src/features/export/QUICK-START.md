# Export Feature - Quick Start Guide

## What You Can Do

Export your audiovisual compositions as high-quality MP4 video files, directly in your browser!

## Basic Usage

### 1. Create Your Composition
- Load an audio file using the Upload button
- Add objects (primitives, shaders, lights, etc.)
- Add keyframe animations
- Add audio-reactive effects (waveforms)

### 2. Export Your Video
1. Click the **Export** button in the top bar (blue button with download icon)
2. Configure your export settings:
   - **Resolution**: Choose from 720p, 1080p, 1440p, or 2K
   - **Framerate**: 30 FPS (recommended) or 60 FPS for smoother motion
   - **Bitrate**: 8 Mbps (recommended), or 1 Mbps (smaller files) / 20 Mbps (highest quality)
   - **Quality**: 100% (recommended)
3. Click **Export**
4. Choose where to save your file (or it will auto-download)
5. Wait for the export to complete (you'll see progress)

### Settings Explained

- **Resolution**:
  - 720p: 1280x720 - Good quality, smaller files
  - 1080p: 1920x1080 - High quality, standard for most platforms ⭐ Recommended
  - 1440p: 2560x1440 - Very high quality
  - 2K: 2048x1080 - Cinema standard
  - *Note: Canvas aspect ratio is maintained when scaling*

- **Framerate (FPS)**:
  - 30 FPS: Standard video framerate, smaller file size
  - 60 FPS: Smoother motion, larger file size, takes longer to export

- **Bitrate (Mbps)**:
  - 1 Mbps: Lower quality, smallest file (~7.5 MB per minute)
  - 8 Mbps: High quality, medium file (~60 MB per minute) ⭐ Recommended
  - 20 Mbps: Highest quality, largest file (~150 MB per minute)

- **Quality (%)**:
  - Lower values can speed up export slightly
  - 100% recommended for best results
  - Timing accuracy is maintained at all quality levels

## Tips

### For Best Results
- Use 1080p and 8 Mbps for most projects
- Use 720p for faster exports or smaller files
- Only use 60 FPS if you need very smooth motion
- Keep quality at 100% for final exports

### Performance
- Longer compositions take longer to export (obvious, but worth noting!)
- Complex scenes (many objects, shaders) will export slower
- The export happens in real-time: a 60-second video at 30 FPS takes ~60 seconds to render frames + encoding time

### Timing Accuracy
The export system is designed to ensure **perfect synchronization**:
- Audio and animations will be frame-perfect
- No drift or sync issues, even for long videos
- Each frame is rendered at the exact timestamp it should appear

## Troubleshooting

### Export Button is Disabled
- Make sure you've loaded an audio file first
- The canvas must be available (it usually is)

### Export Failed
- Check browser console for error details
- Try a shorter duration first (test with 5-10 seconds)
- Close other tabs to free up memory
- Try a lower framerate (30 FPS instead of 60)

### File Size Too Large
- Reduce bitrate (try 1 Mbps)
- Use 30 FPS instead of 60 FPS
- Shorten your composition

### Export is Slow
- This is normal - exports happen in real-time due to audio playback
- A 60-second video takes 60+ seconds to export
- Close other applications to free up CPU
- Use a simpler scene with fewer objects
- Consider using 30 FPS instead of 60 FPS

## Current Limitations

1. **Export Speed**: Exports happen in real-time
   - A 60-second video takes ~60 seconds to export (plus encoding)
   - This is because audio needs to play in real-time
   - Be patient with longer compositions!

2. **Canvas Resolution**: The video uses your canvas's current size
   - The export resolution matches the viewport
   - This is intentional to maintain aspect ratio and avoid scaling artifacts

3. **Browser Requirements**: You need a modern browser with:
   - File System Access API (Chrome, Edge) - or use auto-download fallback
   - WebCodecs support
   - WebGPU support

## What's Next?

Once your export is complete:
1. The file is saved to your chosen location (includes video + audio!)
2. You can open it in any video player
3. Edit it in video editing software if needed (add titles, effects, etc.)
4. Share it on social media, YouTube, etc.

## Example Workflow

1. Load `audio.mp3` (3 minutes long)
2. Create a simple scene with a rotating cube
3. Add keyframe animations for the cube's rotation
4. Add a bloom postprocessor for glow
5. Click Export
6. Set: 30 FPS, 8 Mbps, 100% quality
7. Save as `my-video.mp4`
8. Wait ~3 minutes for rendering + encoding
9. Open video and enjoy!

---

**Need Help?** Check the full README.md in the export feature folder for technical details.
