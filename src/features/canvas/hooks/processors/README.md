# Postprocessor Functions

This directory contains all postprocessing effect implementations used by the `use-postprocessing` hook.

## Structure

Each processor has its own file with two main functions:

1. **`apply[EffectName]`**: Creates and initializes the effect
2. **`update[EffectName]`**: Updates effect parameters when controls change

## Adding a New Processor

### 1. Create a new file

Create a file named after your effect (e.g., `myEffect.ts`):

```typescript
import { myEffectNode } from "three/addons/tsl/display/MyEffectNode.js";
import type { PostprocessorObject } from "@/features/scene/types";

export function applyMyEffect(outputNode: any, processor: PostprocessorObject) {
  // Get control values with defaults
  const param1 = (processor.controls.param1 as number) ?? 0.5;
  
  // Create and configure the effect
  const effect = myEffectNode(outputNode);
  effect.param1.value = param1;

  return {
    effectNode: effect,
    outputNode: effect, // or transform outputNode as needed
  };
}

export function updateMyEffect(effectData: any, processor: PostprocessorObject) {
  const param1 = (processor.controls.param1 as number) ?? 0.5;
  
  if (effectData.param1) {
    effectData.param1.value = param1;
  }
}
```

### 2. Register in index.ts

Add your processor to the `processors` registry:

```typescript
import { applyMyEffect, updateMyEffect } from "./myEffect";

export const processors: Record<string, { apply: ApplyProcessorFn; update: UpdateProcessorFn }> = {
  // ... existing processors
  myEffect: {
    apply: applyMyEffect,
    update: updateMyEffect,
  },
};
```

### 3. Create a factory function

In `src/features/scene/factories/postprocessor-factory.ts`:

```typescript
export const createMyEffect = (name?: string): PostprocessorObject => ({
  id: nanoid(),
  name: name || "My Effect",
  type: "postprocessor",
  effectType: "myEffect",
  enabled: true,
  controls: {
    param1: 0.5,
  },
});
```

### 4. Add UI controls

In `src/features/inspector/components/postprocessor-inspector.tsx`, add a section for your effect controls.

### 5. Add to compose bar (optional)

In `src/features/compose/compose-bar.tsx`, add a button to create your effect.

## Available Processors

- **bloom**: Bloom/glow effect with threshold, strength, and radius controls
- **dotScreen**: Dot screen halftone effect with scale control and customizable colors
- **chromaticAberration**: RGB color separation effect with strength, center, and scale controls
- **afterImage**: Motion blur/trail effect that blends previous frames with a damping factor

## Notes

- All processors receive the current `outputNode` and must return both `effectNode` and the new `outputNode`
- The `effectNode` is stored for later parameter updates
- The `outputNode` becomes the input for the next processor in the chain
- Parameters should have sensible defaults
- Use TypeScript types from `@/features/scene/types`
