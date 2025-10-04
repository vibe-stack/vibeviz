"use client";

import { Menu } from "@base-ui-components/react";
import { useSetAtom } from "jotai";
import {
  Activity,
  ActivityIcon,
  Box,
  Boxes,
  Camera,
  Circle,
  Cylinder,
  Download,
  Layers,
  Lightbulb,
  Rocket,
  Sparkles,
  Stars,
  Sun,
  Triangle,
  Waves,
  Zap,
  Wind,
  Home,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { useRef } from "react";
import { createShaderObject } from "@/features/shaders/factories/shader-factory";
import {
  createCamera,
  createPrimitive,
  createWaveformInstancer,
  createWaveformLines,
} from "../scene/defaults";
import { createLight } from "../scene/factories/light-factory";
import { createGLB } from "../scene/factories/glb-factory";
import {
  createAfterImage,
  createBloom,
  createChromaticAberration,
  createDotScreen,
} from "../scene/factories/postprocessor-factory";
import {
  createAudioParticle,
  createDynamicParticle,
  createForceField,
} from "../particles/factories";
import { addObjectAtom } from "../scene/state";

interface ComposeBarProps {
  onExport: () => void;
  onSave: () => void;
  onExportZip: () => void;
}

function ChevronDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" {...props}>
      <title>Chevron Down Icon</title>
      <path d="M1 3.5L5 7.5L9 3.5" stroke="currentcolor" strokeWidth="1.5" />
    </svg>
  );
}

const menuTriggerClass =
  "flex h-8 items-center justify-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 text-xs font-medium text-neutral-200 select-none hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-purple-500 active:bg-neutral-700 data-[popup-open]:bg-neutral-700 transition-colors";

const menuPopupClass =
  "origin-[var(--transform-origin)] rounded-lg bg-neutral-900 border border-neutral-700 py-1 text-neutral-200 shadow-lg shadow-black/50 outline-none transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 min-w-[160px]";

const menuItemClass =
  "flex items-center gap-2 cursor-default py-2 px-3 text-xs leading-4 outline-none select-none data-[highlighted]:bg-neutral-800 data-[highlighted]:text-purple-300 transition-colors";

export function ComposeBar({ onExport, onSave, onExportZip }: ComposeBarProps) {
  const addObject = useSetAtom(addObjectAtom);
  const glbFileInputRef = useRef<HTMLInputElement>(null);

  const handleGLBFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a local URL for the file
    const url = URL.createObjectURL(file);
    
    // Create GLB object with the file URL
    const glbObject = createGLB(file.name.replace(/\.(glb|gltf)$/i, ""));
    addObject({
      ...glbObject,
      url,
    });

    // Reset the input so the same file can be selected again
    event.target.value = "";
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
      {/* Home Link */}
      <Link
        href="/"
        className="flex h-8 items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3 text-xs font-medium text-neutral-200 select-none hover:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-purple-500 active:bg-neutral-700 transition-colors"
        title="Back to Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      <div className="w-px h-6 bg-neutral-700" />
      
      <span className="text-xs text-neutral-400 mr-2">Add:</span>
      
      {/* Hidden file input for GLB */}
      <input
        ref={glbFileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleGLBFileSelect}
        className="hidden"
      />

      {/* Primitives Menu */}
      <Menu.Root>
        <Menu.Trigger className={menuTriggerClass}>
          Primitives <ChevronDownIcon className="-mr-1" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="outline-none z-50" sideOffset={8}>
            <Menu.Popup className={menuPopupClass}>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createPrimitive("cube"))}
              >
                <Box className="w-3.5 h-3.5" />
                Cube
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createPrimitive("pyramid"))}
              >
                <Triangle className="w-3.5 h-3.5" />
                Pyramid
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createPrimitive("torus"))}
              >
                <Circle className="w-3.5 h-3.5" />
                Torus
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createPrimitive("cylinder"))}
              >
                <Cylinder className="w-3.5 h-3.5" />
                Cylinder
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {/* GLB Model */}
      <button
        type="button"
        onClick={() => glbFileInputRef.current?.click()}
        className={menuTriggerClass}
      >
        <Boxes className="w-3.5 h-3.5" />
        GLB Model
      </button>

      {/* Shaders Menu */}
      <Menu.Root>
        <Menu.Trigger className={menuTriggerClass}>
          Shaders <ChevronDownIcon className="-mr-1" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="outline-none z-50" sideOffset={8}>
            <Menu.Popup className={menuPopupClass}>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createShaderObject("starryNight"))}
              >
                <Stars className="w-3.5 h-3.5" />
                Starry Night
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createShaderObject("galaxyTravel"))}
              >
                <Rocket className="w-3.5 h-3.5" />
                Galaxy Travel
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createShaderObject("rainbow"))}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Rainbow
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() =>
                  addObject(createShaderObject("supernovaRemnant"))
                }
              >
                <ActivityIcon className="w-3.5 h-3.5" />
                Supernova Remnant
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {/* Waveform Menu */}
      <Menu.Root>
        <Menu.Trigger className={menuTriggerClass}>
          Waveform <ChevronDownIcon className="-mr-1" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="outline-none z-50" sideOffset={8}>
            <Menu.Popup className={menuPopupClass}>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createWaveformInstancer())}
              >
                <Waves className="w-3.5 h-3.5" />
                Instancer
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createWaveformLines())}
              >
                <Activity className="w-3.5 h-3.5" />
                Lines
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {/* Particles Menu */}
      <Menu.Root>
        <Menu.Trigger className={menuTriggerClass}>
          Particles <ChevronDownIcon className="-mr-1" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="outline-none z-50" sideOffset={8}>
            <Menu.Popup className={menuPopupClass}>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createAudioParticle())}
              >
                <Zap className="w-3.5 h-3.5" />
                Audio Particles
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createDynamicParticle())}
              >
                <Wind className="w-3.5 h-3.5" />
                Dynamic Particles
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createForceField("attractor"))}
              >
                <Circle className="w-3.5 h-3.5" />
                Attractor
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createForceField("repulsor"))}
              >
                <Circle className="w-3.5 h-3.5" />
                Repulsor
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {/* Effects Menu */}
      <Menu.Root>
        <Menu.Trigger className={menuTriggerClass}>
          Effects <ChevronDownIcon className="-mr-1" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="outline-none z-50" sideOffset={8}>
            <Menu.Popup className={menuPopupClass}>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createBloom())}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Bloom
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createDotScreen())}
              >
                <Layers className="w-3.5 h-3.5" />
                Dot Screen
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createChromaticAberration())}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Chromatic Aberration
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createAfterImage())}
              >
                <Waves className="w-3.5 h-3.5" />
                After Image
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {/* Camera (single button) */}
      <button
        type="button"
        onClick={() => addObject(createCamera())}
        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors border border-neutral-700"
      >
        <Camera className="w-3.5 h-3.5" />
        Camera
      </button>

      {/* Lights Menu */}
      <Menu.Root>
        <Menu.Trigger className={menuTriggerClass}>
          Lights <ChevronDownIcon className="-mr-1" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="outline-none z-50" sideOffset={8}>
            <Menu.Popup className={menuPopupClass}>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createLight("ambient"))}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Ambient
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createLight("directional"))}
              >
                <Sun className="w-3.5 h-3.5" />
                Directional
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createLight("point"))}
              >
                <Zap className="w-3.5 h-3.5" />
                Point
              </Menu.Item>
              <Menu.Item
                className={menuItemClass}
                onClick={() => addObject(createLight("spot"))}
              >
                <Triangle className="w-3.5 h-3.5" />
                Spot
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {/* Export & Save Buttons */}
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className="flex h-8 items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-4 text-xs font-medium text-white select-none hover:bg-emerald-700 hover:border-emerald-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-emerald-500 active:bg-emerald-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Save
        </button>
        <button
          type="button"
          onClick={onExportZip}
          className="flex h-8 items-center justify-center gap-2 rounded-lg border border-purple-600 bg-purple-600 px-4 text-xs font-medium text-white select-none hover:bg-purple-700 hover:border-purple-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-purple-500 active:bg-purple-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export ZIP
        </button>
        <button
          type="button"
          onClick={onExport}
          className="flex h-8 items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 text-xs font-medium text-white select-none hover:bg-blue-700 hover:border-blue-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-500 active:bg-blue-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export Video
        </button>
      </div>
    </div>
  );
}
