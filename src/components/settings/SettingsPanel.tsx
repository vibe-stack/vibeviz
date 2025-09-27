"use client";

import { Tabs } from "@base-ui-components/react/tabs";
import { Globe2, Shapes, Sparkles } from "lucide-react";
import { cn } from "@/utils/tailwind";
import { BarsSection } from "./BarsSection";
import { ParticlesSection } from "./ParticlesSection";
import { ShadersSection } from "./ShadersSection";
import { ShapesSection } from "./ShapesSection";
import { WorldSection } from "./WorldSection";

export const SettingsPanel = () => {
  return (
    <aside className="flex h-full w-96 flex-col border-l border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm">
      <div className="border-b border-zinc-800/60 p-5">
        <h3 className="text-lg font-semibold text-zinc-100">Visual Studio</h3>
        <p className="text-xs text-zinc-500">
          Combine geometry, shaders, and atmosphere to craft your scene.
        </p>
      </div>

      <Tabs.Root defaultValue="primitives" className="flex h-full flex-col">
        <Tabs.List className="grid grid-cols-3 gap-2 px-5 pt-4 text-xs font-medium">
          {[
            { value: "primitives", icon: Shapes, label: "Primitives" },
            { value: "shaders", icon: Sparkles, label: "Shaders" },
            { value: "world", icon: Globe2, label: "World" },
          ].map((tab) => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2 transition",
                "data-[selected=false]:border-zinc-800/60 data-[selected=false]:bg-zinc-900/40 data-[selected=false]:text-zinc-400",
                "data-[selected=true]:border-sky-500/60 data-[selected=true]:bg-sky-500/10 data-[selected=true]:text-sky-200",
              )}
            >
              <tab.icon size={14} strokeWidth={1.5} />
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel
          value="primitives"
          className="flex-1 space-y-6 overflow-y-auto px-5 pb-8 pt-4 max-h-[80dvh]"
        >
          <ShapesSection />
          <BarsSection />
          <ParticlesSection />
        </Tabs.Panel>

        <Tabs.Panel
          value="shaders"
          className="flex-1 space-y-4 overflow-y-auto px-5 pb-8 pt-4"
        >
          <ShadersSection />
        </Tabs.Panel>

        <Tabs.Panel
          value="world"
          className="flex-1 space-y-6 overflow-y-auto px-5 pb-8 pt-4"
        >
          <WorldSection />
        </Tabs.Panel>
      </Tabs.Root>
    </aside>
  );
};
