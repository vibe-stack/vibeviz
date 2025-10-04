import type { PostprocessorObject } from "@/features/scene/types";
import { applyAfterImage, updateAfterImage } from "./afterImage";
import { applyBloom, updateBloom } from "./bloom";
import {
  applyChromaticAberration,
  updateChromaticAberration,
} from "./chromaticAberration";
import { applyDotScreen, updateDotScreen } from "./dotScreen";

export type ProcessorResult = {
  effectNode: any;
  outputNode: any;
};

export type ApplyProcessorFn = (
  outputNode: any,
  processor: PostprocessorObject,
) => ProcessorResult;

export type UpdateProcessorFn = (
  effectData: any,
  processor: PostprocessorObject,
) => void;

export const processors: Record<
  string,
  {
    apply: ApplyProcessorFn;
    update: UpdateProcessorFn;
  }
> = {
  bloom: {
    apply: applyBloom,
    update: updateBloom,
  },
  dotScreen: {
    apply: applyDotScreen,
    update: updateDotScreen,
  },
  chromaticAberration: {
    apply: applyChromaticAberration,
    update: updateChromaticAberration,
  },
  afterImage: {
    apply: applyAfterImage,
    update: updateAfterImage,
  },
};
