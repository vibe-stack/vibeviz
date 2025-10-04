"use client";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Clock, Trash2, Play, Upload } from "lucide-react";
import Image from "next/image";
import { recentProjectsAtom } from "@/features/project/state";
import { useProjectManager } from "@/features/project";

function ProjectCard({
  name,
  updatedAt,
  thumbnail,
  onLoad,
  onDelete,
}: {
  name: string;
  updatedAt: string;
  thumbnail?: string;
  onLoad: () => void;
  onDelete: () => void;
}) {
  const formattedDate = new Date(updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="group relative bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-emerald-600/50 transition-all">
      {/* Thumbnail */}
      <div className="aspect-video bg-neutral-950 relative overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={name}
            width={400}
            height={225}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-700">
            <div className="text-center">
              <div className="text-4xl mb-2">🎨</div>
              <div className="text-xs">No preview</div>
            </div>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            type="button"
            onClick={onLoad}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            Open
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-neutral-100 truncate mb-2">{name}</h3>
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
            title="Delete project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const recentProjects = useAtomValue(recentProjectsAtom);
  const { loadProject, deleteProject, loadRecentProjects, importProject } = useProjectManager();
  const importFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRecentProjects();
  }, [loadRecentProjects]);

  const handleLoadProject = async (projectId: string) => {
    const loaded = await loadProject(projectId);
    if (!loaded) {
      alert("Failed to load project. It may have been removed or corrupted.");
      return;
    }
    router.push("/editor");
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      void deleteProject(projectId);
    }
  };

  const handleImportClick = () => {
    importFileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const success = await importProject(file);
    if (success) {
      router.push("/editor");
    } else {
      alert("Failed to import project. Please check the file format.");
    }
    
    // Reset input
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-900 bg-neutral-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            Vibeviz
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400">
            Audio-reactive 3D scene editor
          </div>
          <div className="space-y-6 mb-8">
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Create stunning audio-reactive 3D visualizations with keyframe animation, 
              particles, shaders, and post-processing effects.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/editor"
              className="inline-block px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-lg shadow-emerald-600/20"
            >
              New Project
            </Link>
            <button
              type="button"
              onClick={handleImportClick}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-semibold transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import ZIP
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={importFileInputRef}
          type="file"
          accept=".zip"
          onChange={handleImportFile}
          className="hidden"
        />

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-neutral-100 mb-6">
              Recent Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  name={project.name}
                  updatedAt={project.updatedAt}
                  thumbnail={project.thumbnail}
                  onLoad={() => {
                    void handleLoadProject(project.id);
                  }}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
