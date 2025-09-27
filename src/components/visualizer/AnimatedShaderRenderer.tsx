"use client";

import type { ReactNode } from "react";
import { memo } from "react";
import { AuroraShader } from "./shaders/AuroraShader";
import { PulseGridShader } from "./shaders/PulseGridShader";
import { FragmentsShader } from "./shaders/FragmentsShader";
import { SmokeShader } from "./shaders/SmokeShader";
import type { ShaderPreset, VisualizerStore } from "@/state/visualizer-store";

interface AnimatedShaderRendererProps {
  shader: ShaderPreset;
  getFrequencyData: () => Uint8Array;
  settings: VisualizerStore["shaderSettings"];
}

const AnimatedShaderRendererComponent = ({
  shader,
  getFrequencyData,
  settings,
}: AnimatedShaderRendererProps) => {
  if (shader === "none") {
    return null;
  }

  let node: ReactNode = null;

  switch (shader) {
    case "aurora": {
      node = (
        <AuroraShader
          getFrequencyData={getFrequencyData}
          settings={settings.aurora}
        />
      );
      break;
    }
    case "pulseGrid": {
      node = (
        <PulseGridShader
          getFrequencyData={getFrequencyData}
          settings={settings.pulseGrid}
        />
      );
      break;
    }
    case "fragments": {
      node = (
        <FragmentsShader
          getFrequencyData={getFrequencyData}
          settings={settings.fragments}
        />
      );
      break;
    }
    case "smoke": {
      node = (
        <SmokeShader
          getFrequencyData={getFrequencyData}
          settings={settings.smoke}
        />
      );
      break;
    }
    default: {
      node = null;
    }
  }

  if (!node) {
    return null;
  }

  return <group scale={[4, 4, 1]}>{node}</group>;
};

export const AnimatedShaderRenderer = memo(AnimatedShaderRendererComponent);
