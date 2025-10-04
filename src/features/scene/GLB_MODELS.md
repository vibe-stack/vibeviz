# GLB Model Object Type

## Overview

The GLB Model object type allows you to import and animate 3D models in the GLTF/GLB format into your scene.

## Features

- **File Upload**: Upload `.glb` or `.gltf` files from your computer
- **Transform Properties**: Full control over position, rotation, and scale (all keyframeable)
- **Animation Support**: 
  - Automatically detects all animations embedded in the GLB file
  - Select which animation to play continuously
  - Keyframe animation changes to switch between animations at different points in the timeline
- **Visibility**: Toggle visibility (keyframeable)

## Usage

### Adding a GLB Model

1. Click the "GLB Model" button in the compose bar
2. A placeholder GLB object will be added to your scene
3. Select the object in the scene tree
4. Click "Upload GLB File" in the inspector panel
5. Choose a `.glb` or `.gltf` file from your computer

### Playing Animations

If your GLB file contains animations:

1. The inspector will automatically list all available animations
2. Select an animation from the dropdown to play it continuously
3. The selected animation will loop automatically

### Keyframing Animation Changes

You can change which animation plays at different points in the timeline:

1. Move the playhead to the desired time
2. Select the animation you want to play from this point
3. Click the diamond (◆) button next to the Animation dropdown
4. A keyframe will be added, switching to this animation at that time

## Technical Details

- Uses Three.js `GLTFLoader` via `@react-three/drei`'s `useGLTF` hook
- Animations are managed with Three.js `AnimationMixer`
- Animation clips are played continuously when selected
- The `activeAnimation` property uses snap interpolation (no blending between animations on keyframe transitions)

## Example Use Cases

- **Character animations**: Switch between idle, walking, running animations
- **Mechanical objects**: Trigger different mechanical movements
- **Cutscenes**: Orchestrate complex animated sequences synchronized with audio

## Limitations

- Currently supports one active animation at a time
- No animation blending between different clips
- File URLs are created as local object URLs (not persisted across sessions yet)

## Future Enhancements

- Animation blending
- Timeline scrubbing control
- Animation speed control
- Persistent file storage in project saves
