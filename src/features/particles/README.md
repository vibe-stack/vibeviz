# Particle Systems

This feature adds comprehensive particle system capabilities to the editor, including audio-reactive particles and physics-based dynamic particles.

## Object Types

### 1. Audio Particles (`audioParticle`)

Audio particles follow predetermined paths while reacting to audio input, similar to waveform instancers but with more complex movement patterns.

**Properties:**
- `targetPrimitiveId`: The primitive object to use as the particle template
- `particleCount`: Number of particles (1-500)
- `pathType`: Movement pattern - "orbit", "wave", "spiral", or "linear"
- `pathScale`: Size of the path
- `pathSpeed`: Animation speed along the path
- `baseSize`: Base particle size
- `dynamicSize`: Additional size from audio reactivity
- `audioReactivity`: How much audio affects the path
- `audioGain`: Audio input amplification
- `audioThreshold`: Minimum audio level to react
- `freqRangeStart/End`: Frequency range to analyze (0-1)
- `smoothing`: Audio smoothing factor (0-1)
- `emissiveBoost`: Emissive intensity boost from audio
- `colorVariation`: Color randomization amount

**Path Types:**
- **Orbit**: Circular 3D orbit around center
- **Wave**: Sinusoidal wave pattern
- **Spiral**: Expanding spiral outward
- **Linear**: Straight line with subtle movement

### 2. Dynamic Particles (`dynamicParticle`)

Full physics-based particle system with emission, forces, gravity, and wind.

**Properties:**

**Emission:**
- `emitterObjectId`: Scene object to emit from (any object with transform)
- `particleObjectId`: Primitive to use as particle
- `emissionRate`: Particles spawned per second
- `capacity`: Maximum active particles (10-10,000)
- `spawnMode`: "point" or "volume" emission
- `spawnPositionJitter`: Random spawn offset (XYZ)

**Motion:**
- `velocity`: Initial particle velocity (XYZ)
- `velocityJitter`: Random velocity variation (XYZ)
- `angularVelocity`: Rotation speed (XYZ)

**Physics:**
- `gravity`: Downward acceleration
- `wind`: Constant force direction (XYZ)

**Particle Properties:**
- `lifetime`: Seconds before particle dies
- `minScale/maxScale`: Size range for particles
- `seed`: Random seed for deterministic behavior

**Force Field Interaction:**
Dynamic particles are affected by all visible force fields in the scene. Forces are calculated based on distance, with falloff over the field's radius.

### 3. Force Fields (`forceField`)

Invisible fields that apply forces to dynamic particles.

**Properties:**
- `forceFieldType`: "attractor" or "repulsor"
- `strength`: Force magnitude
- `radius`: Sphere of influence
- `falloff`: How force decreases with distance (0-1)
  - 0 = constant force throughout radius
  - 1 = sharp falloff at edges

**Types:**
- **Attractor**: Pulls particles toward center (blue visualization)
- **Repulsor**: Pushes particles away from center (red visualization)

## Usage

### Adding Particles to Scene

Use the Compose Bar "Particles" menu:
1. **Audio Particles** - Add audio-reactive particle system
2. **Dynamic Particles** - Add physics-based particles
3. **Attractor** - Add attraction force field
4. **Repulsor** - Add repulsion force field

### Workflow

**Audio Particles:**
1. Add a primitive to use as particle template
2. Add Audio Particles
3. Select the Audio Particles in the scene tree
4. In inspector, set Target Primitive
5. Configure path type and audio reactivity
6. Adjust size, speed, and audio frequency range

**Dynamic Particles:**
1. Add a primitive for the emitter (e.g., cube)
2. Add a primitive for the particle (e.g., small sphere)
3. Add Dynamic Particles
4. Select Dynamic Particles in scene tree
5. Set Emitter Object and Particle Primitive
6. Configure emission rate, velocity, and physics
7. (Optional) Add force fields for attraction/repulsion

### Tips

- **Audio Particles** are great for audio visualization with controlled, predictable patterns
- **Dynamic Particles** excel at chaotic, organic effects like fire, smoke, or explosions
- Combine multiple force fields for complex motion
- Use low emission rates with long lifetimes for ambient effects
- Use high emission rates with short lifetimes for bursts
- Adjust the random seed for different but repeatable variations

## Architecture

### Components
- `audio-particle-renderer.tsx` - Renders audio-reactive particles with path animation
- `dynamic-particle-renderer.tsx` - Manages particle lifecycle and physics simulation
- `force-field-renderer.tsx` - Visualizes force field influence areas

### State Management
- `activeParticlesAtom` - Tracks live particles for each system
- `particlePoolsAtom` - Reserved for future particle pooling optimization
- `lastEmissionTimeAtom` - Tracks emission timing for each system

### Factories
- `createAudioParticle()` - Creates audio particle with default settings
- `createDynamicParticle()` - Creates dynamic particle system
- `createForceField(type)` - Creates attractor or repulsor

## Performance

- Audio particles use instanced rendering (tested up to 500 particles)
- Dynamic particles use instance pools (capacity up to 10,000)
- Inactive particles are hidden by setting scale to 0
- Force field calculations use distance squared for efficiency
- Audio analysis uses shared Tone.js analyzer

## Future Enhancements

- Particle trails/motion blur
- Particle size over lifetime curves
- Color gradients over lifetime
- Collision detection with scene objects
- Particle pooling for better memory efficiency
- Texture/sprite support for particles
- Emission from surface vertices (volume spawn mode)
- Vortex and turbulence force fields
