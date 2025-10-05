"use client";

import { useRef, useState } from "react";
import { useAudioPlayback } from "@/features/audio/hooks/use-audio-playback";
import { Viewport } from "@/features/canvas/components/viewport";
import { ComposeBar } from "@/features/compose/compose-bar";
import { ExportDialog } from "@/features/export";
import { InspectorPanel } from "@/features/inspector/components/inspector-panel";
import { useKeyframeApplicator } from "@/features/keyframes/hooks/use-keyframe-applicator";
import { SceneTree } from "@/features/scene/components/scene-tree";
import { EasingEditor } from "@/features/timeline/components/easing-editor";
import { TimelineControls } from "@/features/timeline/components/timeline-controls";
import { TimelineTrack } from "@/features/timeline/components/timeline-track";
import { useProjectManager } from "@/features/project";
import { SaveDialog } from "@/features/project/components/save-dialog";

function EditorContent() {
  // Apply keyframes to objects based on current time
  useKeyframeApplicator();

  // Handle audio playback
  useAudioPlayback();

  // Project management
  const { currentProjectMetadata, saveProject, exportProject } =
    useProjectManager();

  // Export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleSave = async (projectName: string) => {
    await saveProject(projectName, canvasRef.current);
  };

  const handleExportZip = async () => {
    const projectName = currentProjectMetadata?.name || "Untitled Project";
    await exportProject(projectName, canvasRef.current);
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-50 overflow-hidden flex flex-col px-2 gap-2">
      {/* Top bar - Compose */}
      <div className="flex-shrink-0">
        <ComposeBar
          onExport={() => setIsExportDialogOpen(true)}
          onSave={() => setIsSaveDialogOpen(true)}
          onExportZip={handleExportZip}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-2 min-h-0">
        {/* Left sidebar - Scene tree */}
        <div className="w-64 flex-shrink-0">
          <SceneTree />
        </div>

        {/* Center - Viewport */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <Viewport
              onCanvasReady={(canvas: HTMLCanvasElement) => {
                canvasRef.current = canvas;
              }}
            />
          </div>
        </div>

        {/* Right sidebar - Inspector */}
        <div className="w-80 flex-shrink-0">
          <InspectorPanel />
        </div>
      </div>

      {/* Bottom area - Timeline */}
      {/* Give the timeline a fixed-ish height on desktop (lg = 1024px) so the viewport can grow vertically */}
      <div className="flex-none flex gap-0 h-60 lg:h-60 xl:h-80">
        <div className="flex-1 min-w-0 flex flex-col gap-0">
          <div className="flex-shrink-0">
            <TimelineControls />
          </div>
          <div className="flex-1 min-h-0 w-full max-w-full overflow-x-auto">
            <TimelineTrack />
          </div>
        </div>
        <EasingEditor />
      </div>

      {/* Export Dialog */}
      <ExportDialog
        canvas={canvasRef.current}
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />

      {/* Save Dialog */}
      <SaveDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSave}
        currentProjectName={currentProjectMetadata?.name}
      />
    </div>
  );
}
export default function EditorPage() {
  return <EditorContent />;
}
