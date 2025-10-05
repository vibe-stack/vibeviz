"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ChevronDown, ChevronRight, Diamond } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { currentTimeAtom, durationAtom } from "@/features/audio/state";
import {
  keyframesAtom,
  removeKeyframeAtom,
  sceneObjectsAtom,
} from "@/features/scene/state";
import type { Keyframe } from "@/features/scene/types";
import {
  collapsedPropertyGroupsAtom,
  keyframeSnapEnabledAtom,
  keyframeSnapThresholdAtom,
  selectedKeyframeIdsAtom,
  timelineZoomAtom,
  togglePropertyGroupAtom,
} from "../state";

type PropertyNode = {
  path: string;
  label: string;
  children?: PropertyNode[];
  keyframes?: Keyframe[];
  // Group keyframes by time for grouped selection
  keyframesByTime?: Map<number, Keyframe[]>;
};

// Parse property paths into hierarchical structure
function buildPropertyTree(
  keyframes: Keyframe[],
): Record<string, PropertyNode[]> {
  const trees: Record<string, PropertyNode[]> = {};

  keyframes.forEach((kf) => {
    if (!trees[kf.objectId]) {
      trees[kf.objectId] = [];
    }

    const parts = kf.property.split(".");
    let currentLevel = trees[kf.objectId];

    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join(".");
      let node = currentLevel.find((n) => n.path === path);

      if (!node) {
        node = {
          path,
          label: part,
          children: index < parts.length - 1 ? [] : undefined,
          keyframes: index === parts.length - 1 ? [] : undefined,
          keyframesByTime: index < parts.length - 1 ? new Map() : undefined,
        };
        currentLevel.push(node);
      }

      if (index === parts.length - 1) {
        node.keyframes?.push(kf);
      } else if (node.children) {
        // Also add to parent's keyframesByTime for grouped selection
        if (node.keyframesByTime) {
          if (!node.keyframesByTime.has(kf.time)) {
            node.keyframesByTime.set(kf.time, []);
          }
          node.keyframesByTime.get(kf.time)?.push(kf);
        }
        currentLevel = node.children;
      }
    });
  });

  return trees;
}

export function TimelineTrack() {
  const objects = useAtomValue(sceneObjectsAtom);
  const keyframes = useAtomValue(keyframesAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const duration = useAtomValue(durationAtom);
  const zoom = useAtomValue(timelineZoomAtom);
  const snapEnabled = useAtomValue(keyframeSnapEnabledAtom);
  const snapThreshold = useAtomValue(keyframeSnapThresholdAtom);
  const [selectedKeyframeIds, setSelectedKeyframeIds] = useAtom(
    selectedKeyframeIdsAtom,
  );
  const collapsedGroups = useAtomValue(collapsedPropertyGroupsAtom);
  const togglePropertyGroup = useSetAtom(togglePropertyGroupAtom);
  const setKeyframes = useSetAtom(keyframesAtom);
  const removeKeyframe = useSetAtom(removeKeyframeAtom);

  const rulerRef = useRef<HTMLDivElement>(null);
  const timelineAreaRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [isDraggingKeyframes, setIsDraggingKeyframes] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const dragThreshold = 3; // pixels to move before considering it a drag
  const keyframeDragStartTimesRef = useRef<Map<string, number>>(new Map());
  const mouseDownPosRef = useRef({ x: 0, y: 0 });

  const timelineWidth = duration * zoom;
  const playheadPosition = currentTime * zoom;

  // Convert pixel X to time (relative to timeline area, accounting for scroll)
  const pixelToTime = useCallback(
    (pixelX: number, relativeToElement?: HTMLDivElement) => {
      const element = relativeToElement || timelineAreaRef.current;
      if (!element) return 0;
      const scrollLeft = element.scrollLeft || 0;
      return (scrollLeft + pixelX) / zoom;
    },
    [zoom],
  );

  // Snap time to nearest keyframe if enabled
  const snapTime = useCallback(
    (time: number) => {
      if (!snapEnabled) return time;

      // Find nearest keyframe within threshold
      let nearestTime = time;
      let minDistance = snapThreshold;

      keyframes.forEach((kf) => {
        const distance = Math.abs(kf.time - time);
        if (distance < minDistance) {
          minDistance = distance;
          nearestTime = kf.time;
        }
      });

      return nearestTime;
    },
    [snapEnabled, keyframes, snapThreshold],
  );

  // Handle ruler click/drag for seeking
  const handleRulerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!rulerRef.current || duration === 0) return;

      const rect = rulerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = snapTime(
        pixelToTime(x, timelineAreaRef.current || undefined),
      );

      setCurrentTime(Math.max(0, Math.min(duration, time)));
      setIsDraggingPlayhead(true);
    },
    [duration, pixelToTime, snapTime, setCurrentTime],
  );

  // Handle keyframe click (single or grouped)
  const handleKeyframeClick = useCallback(
    (e: React.MouseEvent, keyframeIds: string[]) => {
      e.stopPropagation();

      if (e.shiftKey) {
        // Multi-select with shift
        setSelectedKeyframeIds((prev) => {
          const newSelection = new Set(prev);
          keyframeIds.forEach((id) => {
            if (newSelection.has(id)) {
              newSelection.delete(id);
            } else {
              newSelection.add(id);
            }
          });
          return Array.from(newSelection);
        });
      } else {
        // Single select (replace selection)
        setSelectedKeyframeIds(keyframeIds);
      }
    },
    [setSelectedKeyframeIds],
  );

  // Handle keyframe mouse down (prepare for potential drag)
  const handleKeyframeMouseDown = useCallback(
    (e: React.MouseEvent, keyframeIds: string[]) => {
      e.stopPropagation();

      // Store start position
      mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
      setDragStartX(e.clientX);

      // Store start times for potential drag
      const startTimes = new Map<string, number>();

      const isDraggingSelected = keyframeIds.some((id) =>
        selectedKeyframeIds.includes(id),
      );

      const idsToMove = isDraggingSelected ? selectedKeyframeIds : keyframeIds;

      keyframes.forEach((kf) => {
        if (idsToMove.includes(kf.id)) {
          startTimes.set(kf.id, kf.time);
        }
      });

      keyframeDragStartTimesRef.current = startTimes;
      setIsDraggingKeyframes(true);
    },
    [selectedKeyframeIds, keyframes],
  );

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPlayhead && rulerRef.current && timelineAreaRef.current) {
        const rect = rulerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = snapTime(pixelToTime(x, timelineAreaRef.current));
        setCurrentTime(Math.max(0, Math.min(duration, time)));
      } else if (isDraggingKeyframes) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = Math.abs(e.clientY - mouseDownPosRef.current.y);

        // Only start dragging if we've moved beyond threshold horizontally
        if (Math.abs(deltaX) > dragThreshold || deltaY > dragThreshold) {
          const deltaTime = deltaX / zoom;

          // Update all keyframes that we stored at mouse down
          setKeyframes((prev) =>
            prev.map((kf) => {
              const startTime = keyframeDragStartTimesRef.current.get(kf.id);
              if (startTime !== undefined) {
                const newTime = Math.max(
                  0,
                  Math.min(duration, startTime + deltaTime),
                );
                return { ...kf, time: newTime };
              }
              return kf;
            }),
          );
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // If we didn't drag much, treat it as a click (handled by onClick)
      const wasDragging = isDraggingKeyframes;
      const deltaX = Math.abs(e.clientX - mouseDownPosRef.current.x);
      const deltaY = Math.abs(e.clientY - mouseDownPosRef.current.y);
      const wasActualDrag = deltaX > dragThreshold || deltaY > dragThreshold;

      setIsDraggingPlayhead(false);
      setIsDraggingKeyframes(false);
      keyframeDragStartTimesRef.current.clear();

      // If it was a drag (not a click), prevent the onClick from firing
      if (wasDragging && wasActualDrag) {
        // The click will still fire, but we can't prevent it here
        // We'll handle this in the onClick handler
      }
    };

    if (isDraggingPlayhead || isDraggingKeyframes) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    isDraggingPlayhead,
    isDraggingKeyframes,
    dragStartX,
    zoom,
    duration,
    pixelToTime,
    snapTime,
    setCurrentTime,
    setKeyframes,
  ]);

  // Handle delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedKeyframeIds.length > 0
      ) {
        for (const id of selectedKeyframeIds) {
          removeKeyframe(id);
        }
        setSelectedKeyframeIds([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedKeyframeIds, removeKeyframe, setSelectedKeyframeIds]);

  // Build property trees
  const propertyTrees = buildPropertyTree(keyframes);

  // Render property node for SIDEBAR ONLY (no keyframes)
  const renderPropertyNodeSidebar = (
    node: PropertyNode,
    objectId: string,
    depth = 0,
  ): React.ReactElement[] => {
    const isCollapsed = collapsedGroups[objectId]?.has(node.path) ?? false;
    const hasChildren = node.children && node.children.length > 0;

    const rows: React.ReactElement[] = [];

    // Render this node
    rows.push(
      <div
        key={node.path}
        className="h-6 border-b border-neutral-800/30 relative flex items-center"
      >
        {/* Property label */}
        <div
          className="flex items-center gap-1 cursor-pointer hover:bg-neutral-800/30 w-full"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() =>
            hasChildren && togglePropertyGroup(objectId, node.path)
          }
        >
          {hasChildren &&
            (isCollapsed ? (
              <ChevronRight className="w-3 h-3 text-neutral-500" />
            ) : (
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            ))}
          <span className="text-[10px] text-neutral-400 select-none">
            {node.label}
          </span>
        </div>
      </div>,
    );

    // Render children if not collapsed
    if (!isCollapsed && node.children) {
      node.children.forEach((child) => {
        rows.push(...renderPropertyNodeSidebar(child, objectId, depth + 1));
      });
    }

    return rows;
  };

  // Render property node for TIMELINE AREA (with keyframes)
  const renderPropertyNodeTimeline = (
    node: PropertyNode,
    objectId: string,
  ): React.ReactElement[] => {
    const isCollapsed = collapsedGroups[objectId]?.has(node.path) ?? false;
    const hasChildren = node.children && node.children.length > 0;

    const rows: React.ReactElement[] = [];

    // Render this row
    rows.push(
      <div
        key={node.path}
        className="h-6 border-b border-neutral-800/30 relative"
      >
        {/* Render keyframes for leaf nodes */}
        {node.keyframes?.map((kf) => {
          const position = kf.time * zoom;
          const isSelected = selectedKeyframeIds.includes(kf.id);

          return (
            <div
              key={kf.id}
              className="absolute top-1/2 cursor-pointer"
              style={{
                left: `${position}px`,
                transform: "translate(-50%, -50%)", // Center the diamond
              }}
              onMouseDown={(e) => {
                handleKeyframeMouseDown(e, [kf.id]);
              }}
              onClick={(e) => handleKeyframeClick(e, [kf.id])}
              title={`${kf.property} = ${JSON.stringify(kf.value)} @ ${kf.time.toFixed(2)}s`}
            >
              <Diamond
                className={`w-2.5 h-2.5 ${
                  isSelected
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-emerald-400 fill-emerald-400"
                }`}
              />
            </div>
          );
        })}

        {/* Render grouped keyframes for parent nodes */}
        {hasChildren &&
          node.keyframesByTime &&
          Array.from(node.keyframesByTime.entries()).map(([time, kfs]) => {
            const position = time * zoom;
            const allIds = kfs.map((kf) => kf.id);
            const isAnySelected = allIds.some((id) =>
              selectedKeyframeIds.includes(id),
            );

            return (
              <div
                key={`group-${time}`}
                className="absolute top-1/2 cursor-pointer"
                style={{
                  left: `${position}px`,
                  transform: "translate(-50%, -50%)", // Center the diamond
                }}
                onMouseDown={(e) => {
                  handleKeyframeMouseDown(e, allIds);
                }}
                onClick={(e) => handleKeyframeClick(e, allIds)}
                title={`${kfs.length} keyframes @ ${time.toFixed(2)}s`}
              >
                <Diamond
                  className={`w-2.5 h-2.5 ${
                    isAnySelected
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-blue-400 fill-blue-400"
                  }`}
                />
              </div>
            );
          })}
      </div>,
    );

    // Render children if not collapsed
    if (!isCollapsed && node.children) {
      node.children.forEach((child) => {
        rows.push(...renderPropertyNodeTimeline(child, objectId));
      });
    }

    return rows;
  };

  return (
    <div className="flex flex-col border-l border-neutral-800 bg-neutral-900/60 backdrop-blur-sm overflow-hidden h-full">
      <div className="px-4 py-2 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
        <h2 className="text-sm font-semibold text-neutral-200">Timeline</h2>
        <div className="text-xs text-neutral-500">
          {selectedKeyframeIds.length > 0 &&
            `${selectedKeyframeIds.length} keyframe${selectedKeyframeIds.length > 1 ? "s" : ""} selected`}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left sidebar - Object/Property labels */}
        <div className="w-48 flex-shrink-0 border-r border-neutral-800 overflow-y-auto bg-neutral-900/40 h-full">
          {/* Spacer for ruler */}
          <div className="h-8 border-b border-neutral-800" />

          {objects
            .filter((obj) => obj.type !== "postprocessor")
            .map((obj) => {
              const tree = propertyTrees[obj.id];
              if (!tree || tree.length === 0) return null;

              return (
                <div key={obj.id} className="border-b border-neutral-800">
                  {/* Object header */}
                  <div className="h-8 flex items-center px-2 bg-neutral-800/30">
                    <span className="text-xs font-medium text-neutral-300 truncate">
                      {obj.name}
                    </span>
                  </div>
                  {/* Property tree (sidebar - no keyframes) */}
                  {tree.map((node) => renderPropertyNodeSidebar(node, obj.id))}
                </div>
              );
            })}
        </div>

        {/* Right - Timeline area */}
        <div
          ref={timelineAreaRef}
          className="flex-1 relative overflow-x-auto overflow-y-auto h-full"
        >
          {/* Timeline content with dynamic width */}
          <div
            className="relative"
            style={{ width: `${timelineWidth}px`, minWidth: "100%" }}
          >
            {/* Ruler */}
            <div
              ref={rulerRef}
              className="sticky top-0 z-20 h-8 bg-neutral-900 border-b border-neutral-800 cursor-ew-resize select-none"
              onMouseDown={handleRulerMouseDown}
            >
              {duration > 0 &&
                (() => {
                  const tickInterval = zoom < 50 ? 5 : zoom < 100 ? 1 : 0.5;
                  const numTicks = Math.ceil(duration / tickInterval) + 1;

                  return Array.from({ length: numTicks }).map((_, i) => {
                    const time = i * tickInterval;
                    if (time > duration) return null;

                    return (
                      <div
                        key={time}
                        className="absolute top-0 bottom-0 flex items-center"
                        style={{ left: `${time * zoom}px` }}
                      >
                        <div className="w-px h-full bg-neutral-700" />
                        <span className="ml-1 text-[10px] text-neutral-400 font-mono whitespace-nowrap">
                          {time.toFixed(tickInterval < 1 ? 1 : 0)}s
                        </span>
                      </div>
                    );
                  });
                })()}
            </div>

            {/* Keyframe tracks */}
            <div className="relative">
              {objects
                .filter((obj) => obj.type !== "postprocessor")
                .map((obj) => {
                  const tree = propertyTrees[obj.id];
                  if (!tree || tree.length === 0) return null;

                  return (
                    <div key={obj.id} className="border-b border-neutral-800">
                      {/* Object spacer */}
                      <div className="h-8 bg-neutral-800/10" />
                      {/* Property rows (timeline - with keyframes) */}
                      {tree.map((node) =>
                        renderPropertyNodeTimeline(node, obj.id),
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Playhead */}
            {duration > 0 && (
              <div
                className="absolute top-0 bottom-0 w-px bg-red-500 pointer-events-none z-30"
                style={{ left: `${playheadPosition}px` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
