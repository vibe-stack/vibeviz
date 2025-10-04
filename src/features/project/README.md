# Project Management Feature

This feature allows users to save, load, and manage their Vibeviz projects.

## Features

### 1. Save Project Locally
- Projects are saved in browser's localStorage
- Includes all scene data, keyframes, and metadata
- Automatically captures a thumbnail of the current viewport
- Updates existing projects or creates new ones

### 2. Export Project as ZIP
- Exports complete project including:
  - `project.json` - Scene data and keyframes
  - `audio/` - Audio file (if present)
  - `glb/` - All GLB model files used in the scene
- Can be shared or backed up externally

### 3. Recent Projects View
- Home page displays all saved projects
- Shows project thumbnail, name, and last updated date
- Quick access to load or delete projects

## Usage

### In the Editor

**Save Button (Green)**
- Click to save current project
- Enter project name in dialog
- Project is saved to localStorage with a thumbnail

**Export Button (Blue)**
- Opens export dialog for video rendering
- Separate from project saving functionality

### On Home Page

**New Project**
- Click to start a fresh project in the editor

**Recent Projects Grid**
- Hover over a project card to see "Open" button
- Click "Open" to load the project
- Click trash icon to delete the project

## Technical Details

### Data Structure

```typescript
type ProjectData = {
  metadata: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    thumbnail?: string; // Base64 image
  };
  scene: {
    objects: SceneObject[];
    keyframes: Keyframe[];
  };
  audio: {
    clip: AudioClip | null;
  };
  assets: {
    glbFiles: Record<string, string>; // URL -> data URL mapping
  };
};
```

### Storage

- Projects stored in `localStorage` under key `vibeviz_projects`
- Thumbnails stored as base64-encoded JPEG images (320x180)
- Maximum storage depends on browser limits (~5-10MB)

### Components

- `SaveDialog` - Modal for entering project name
- `ProjectCard` - Display component for project preview
- `useProjectManager` - Hook for all project operations

## Limitations

- LocalStorage has size limits (browser-dependent)
- Large projects with many GLB files may hit storage limits
- Projects are browser-specific (not synced across devices)
- Use Export to ZIP for backups and sharing

## Future Enhancements

- Cloud sync via external storage
- Project import from ZIP
- Project templates
- Auto-save functionality
- Project versioning
