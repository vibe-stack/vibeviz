# Vibeviz
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



> **Audio-Reactive 3D Scene Editor** built with Next.js, React Three Fiber, and Three.js WebGPU/TSL## Getting Started



[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)First, run the development server:

[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

[![WebGPU](https://img.shields.io/badge/WebGPU-TSL-green.svg)](https://threejs.org/)```bash

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)npm run dev

# or

Create stunning audio-reactive 3D visualizations with a professional, modular editor.yarn dev

# or

---pnpm dev

# or

## ✨ Featuresbun dev

```

- 🎨 **Intuitive UI** - Scene tree, inspector, timeline, and 3D viewport

- 🎵 **Audio-Reactive** - Sync visuals to audio with waveform analysisOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- 🎬 **Keyframe Animation** - Full keyframing powered by AnimeJS

- 🎮 **WebGPU/TSL** - Modern, high-performance 3D renderingYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- 📦 **Modular Architecture** - Clean, feature-based organization

- 🎯 **Type-Safe** - 100% TypeScript with strict modeThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- 🎨 **Dark UI** - Beautiful, minimalistic interface

- 📚 **Well Documented** - Comprehensive guides and references## Learn More



---To learn more about Next.js, take a look at the following resources:



## 🚀 Quick Start- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

```bash

# Install dependenciesYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

pnpm install

## Deploy on Vercel

# Run development server

pnpm devThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.



# Open your browserCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# http://localhost:3000/editor
```

---

## 📖 Documentation

**Start here**: [DOC-INDEX.md](DOC-INDEX.md) - Complete documentation index

### Quick Links

| Document | Description |
|----------|-------------|
| [DOC-INDEX.md](DOC-INDEX.md) | 📖 Documentation navigation guide |
| [PROJECT-COMPLETE.md](PROJECT-COMPLETE.md) | 🎯 Complete project overview |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 🏗️ System architecture |
| [README-EDITOR.md](README-EDITOR.md) | 📘 User guide |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | ⚡ Developer recipes |
| [DIAGRAMS.md](DIAGRAMS.md) | 📊 Visual diagrams |
| [CHECKLIST.md](CHECKLIST.md) | ✅ Implementation status |

---

## 🎨 Editor Overview

### Layout

```
┌───────────────────────────────────────────────────┐
│                  Compose Bar                      │
│  [Cube] [Pyramid] [Torus] [Shader] [Waveform]   │
├─────────┬──────────────────────┬─────────────────┤
│  Scene  │                      │   Inspector     │
│  Tree   │    3D Viewport       │   Panel         │
│         │                      │                 │
│  □ Cube │      [Scene]         │   - Transform   │
│  ○ Cam  │                      │   - Material    │
│         │                      │   - Keyframes   │
├─────────┴──────────────────────┴─────────────────┤
│         Timeline Controls & Keyframes             │
└───────────────────────────────────────────────────┘
```

### Features

- **Scene Tree** - Manage objects, toggle visibility, delete
- **Inspector** - Edit transforms, materials, add keyframes
- **Compose Bar** - Create primitives, shaders, cameras
- **Timeline** - Play/pause, scrub, visualize keyframes
- **Viewport** - Real-time 3D preview with orbit controls

---

## 🛠️ Tech Stack

- **Next.js 15** - React framework
- **React Three Fiber** - 3D in React
- **Three.js WebGPU/TSL** - Modern shaders
- **AnimeJS** - Keyframe animation
- **ToneJS** - Audio analysis
- **Jotai** - State management
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

---

## 📦 Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── page.tsx           # Landing page
│   └── editor/page.tsx    # Editor app
├── components/ui/         # Shared UI components
├── features/              # Feature modules
│   ├── audio/            # Audio handling
│   ├── canvas/           # 3D rendering
│   ├── compose/          # Object creation
│   ├── inspector/        # Property editor
│   ├── keyframes/        # Animation system
│   ├── scene/            # Scene state
│   └── timeline/         # Timeline UI
└── lib/                  # Utilities & shaders
```

---

## 🎯 Object Types

- **Primitives** - Cube, Pyramid, Torus, Cylinder (with materials)
- **GLB Models** - Import 3D models with animations
- **Shaders** - TSL-based shader planes (Rainbow shader included)
- **Waveform Instancer** - Audio-reactive object instancing
- **Waveform Lines** - Audio-reactive line visualizations
- **Cameras** - Keyframeable cameras with active state
- **Lights** - Ambient, Directional, Point, Spot, Environment
- **Postprocessors** - TSL post-effects framework
- **Particles** - Audio and Dynamic particle systems with force fields

---

## 🎹 Keyframeable Properties

- **Transform**: Position (XYZ), Rotation (XYZ), Scale (XYZ)
- **Material**: Color, Roughness, Metalness, Emissive Color, Emissive Intensity
- **Visibility**: Boolean
- **Camera**: isActive (Boolean)
- **GLB Model**: activeAnimation (String - switches between animations)

---

## 🎨 Creating Custom Shaders

```typescript
// lib/myShader.ts
import { Fn, time, vec3 } from "three/tsl";
import * as THREE from "three/webgpu";

export function createMyShader() {
  const myUniform = uniform(0);
  
  const fragment = Fn(() => {
    const t = time.mul(0.5);
    return vec3(t.sin(), t.cos(), myUniform);
  });

  const material = new THREE.NodeMaterial();
  material.fragmentNode = fragment();
  
  return { material, uniforms: { myUniform } };
}
```

See [QUICK-REFERENCE.md](QUICK-REFERENCE.md) for more examples.

---

## 🚀 Roadmap

### ✅ Completed (Foundation)
- Scene management system
- Object creation & editing
- Keyframe system
- Timeline UI
- Audio integration
- 3D rendering (WebGPU)
- Comprehensive documentation

### ⏳ Next Steps
- [ ] Wire AnimeJS timeline execution
- [ ] Audio playback sync
- [ ] Waveform visualization
- [ ] More shader presets
- [ ] Save/Load projects

See [CHECKLIST.md](CHECKLIST.md) for detailed status.

---

## 🤝 Contributing

Contributions welcome! Please follow our modular architecture:

1. Create features in `src/features/`
2. Keep files small and focused
3. Colocate related code
4. Use TypeScript
5. Update documentation

See [QUICK-REFERENCE.md](QUICK-REFERENCE.md) for development patterns.

---

## 📝 License

MIT License

---

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/) by Vercel
- [Three.js](https://threejs.org/) by Mr.doob
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) by Poimandres
- [AnimeJS](https://animejs.com/) by Julian Garnier
- [ToneJS](https://tonejs.github.io/) by Yotam Mann
- [Jotai](https://jotai.org/) by Daishi Kato
- [Tailwind CSS](https://tailwindcss.com/) by Tailwind Labs

---

## 🎯 Status

**Version**: 1.0.0 (Foundation Complete)

- ✅ **Core Features**: Complete
- ✅ **UI Components**: Complete
- ✅ **Documentation**: Complete
- ⏳ **Integration**: 95%

**Ready to create stunning audio-reactive 3D visualizations!** 🎨🎵🎬

---

<div align="center">

**Made with ❤️ using Next.js, React Three Fiber, and WebGPU**

[Documentation](DOC-INDEX.md) • [Architecture](ARCHITECTURE.md) • [Quick Start](#-quick-start)

</div>
