# VibeViz - Music Visualizer

A modern, interactive music visualizer built with React Three Fiber that creates stunning 3D visualizations from your MP3 files.

## Features

- **3D Circular Visualization**: Audio frequencies rendered as animated bars arranged in a circle
- **Real-time Audio Processing**: Dynamic visualization synchronized with audio playback
- **Interactive Timeline**: Waveform display with click-to-seek functionality
- **Volume Control**: iOS-style volume slider with intuitive drag/click interaction
- **Customizable Settings**: Adjust circle radius and maximum bar height in real-time
- **Drag & Drop Upload**: Simply drag MP3 files or click to browse
- **Responsive Design**: Dark, minimalistic UI that works on all screen sizes

## Technology Stack

- **Next.js 15** - React framework with Turbopack
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Web Audio API** - Real-time audio processing and analysis

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd vibeviz
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Audio**: Drag and drop an MP3 file onto the upload area or click to browse
2. **Playback Controls**: Use the play/pause button to control audio playback
3. **Volume Control**: Adjust volume using the slider next to the play button - click or drag to set level
4. **Timeline Navigation**: Click anywhere on the waveform timeline to seek to that position
5. **Customize Visualization**: Use the settings panel on the right to adjust:
   - Circle radius (3-8 units)
   - Maximum bar height (1-6 units)
6. **3D Navigation**: Use mouse to orbit around the visualization (powered by OrbitControls)

## Architecture

The app follows a feature-based folder structure:

```
src/
├── components/
│   ├── audio/           # File upload components
│   ├── visualizer/      # 3D visualization components
│   ├── timeline/        # Timeline and playback controls
│   └── settings/        # Settings panel
├── hooks/               # Custom React hooks
└── utils/              # Audio processing utilities
```

### Key Components

- **MusicVisualizer**: Main component that orchestrates all features
- **AudioProcessor**: Handles MP3 loading, waveform extraction, and frequency analysis
- **CircularVisualizer**: 3D visualization with animated bars
- **Timeline**: Interactive waveform timeline with seek functionality
- **SettingsPanel**: Real-time visualization controls

## Audio Processing

The app uses the Web Audio API to:
- Decode MP3 files into audio buffers
- Extract waveform data for timeline visualization
- Analyze frequency data in real-time for 3D bars
- Maintain audio-visual synchronization

## Browser Compatibility

- Chrome 66+
- Firefox 60+
- Safari 14+
- Edge 79+

*Note: Web Audio API support required*

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Performance

The visualizer is optimized for smooth performance:
- Efficient Three.js rendering with React Three Fiber
- Minimal re-renders using React hooks
- Optimized audio processing with Web Audio API
- 60fps animations with requestAnimationFrame
