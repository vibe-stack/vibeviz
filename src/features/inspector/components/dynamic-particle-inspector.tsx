"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { DragInput } from "@/components/ui/drag-input";
import { sceneObjectsAtom, updateObjectAtom } from "@/features/scene/state";
import type { DynamicParticleObject } from "@/features/particles/types";
import { TransformSection } from "./transform-section";

type DynamicParticleInspectorProps = {
  object: DynamicParticleObject;
};

export function DynamicParticleInspector({
  object,
}: DynamicParticleInspectorProps) {
  const updateObject = useSetAtom(updateObjectAtom);
  const allObjects = useAtomValue(sceneObjectsAtom);

  const sceneObjects = allObjects.filter(
    (obj) => obj.type !== "postprocessor" && obj.id !== object.id,
  );
  const primitives = allObjects.filter((obj) => obj.type === "primitive");

  return (
    <>
      <TransformSection objectId={object.id} transform={object.transform} />
      <div className="space-y-3 p-3 rounded-lg bg-neutral-800/30">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Dynamic Particles
        </h3>

        <div className="space-y-2">
          <span className="text-xs text-neutral-400">Emitter Object</span>
          <select
            value={object.emitterObjectId || ""}
            onChange={(e) =>
              updateObject(object.id, {
                emitterObjectId: e.target.value || null,
              })
            }
            className="w-full px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-300"
          >
            <option value="">None</option>
            {sceneObjects.map((obj) => (
              <option key={obj.id} value={obj.id}>
                {obj.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <span className="text-xs text-neutral-400">Particle Primitive</span>
          <select
            value={object.particleObjectId || ""}
            onChange={(e) =>
              updateObject(object.id, {
                particleObjectId: e.target.value || null,
              })
            }
            className="w-full px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-300"
          >
            <option value="">None</option>
            {primitives.map((prim) => (
              <option key={prim.id} value={prim.id}>
                {prim.name}
              </option>
            ))}
          </select>
        </div>

        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pt-2">
          Emission
        </h4>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-32">Emission Rate</span>
          <DragInput
            value={object.emissionRate}
            onChange={(v) => updateObject(object.id, { emissionRate: v })}
            step={0.5}
            precision={1}
            min={0.1}
            max={100}
            compact
          />
          <span className="text-xs text-neutral-500">p/s</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-32">Capacity</span>
          <DragInput
            value={object.capacity}
            onChange={(v) =>
              updateObject(object.id, { capacity: Math.round(v) })
            }
            step={10}
            precision={0}
            min={10}
            max={10000}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-32">Spawn Mode</span>
          <select
            value={object.spawnMode}
            onChange={(e) =>
              updateObject(object.id, {
                spawnMode: e.target.value as "point" | "volume",
              })
            }
            className="flex-1 px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-300"
          >
            <option value="point">Point</option>
            <option value="volume">Volume</option>
          </select>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-neutral-400">Spawn Jitter</span>
          <div className="grid grid-cols-3 gap-1">
            <DragInput
              value={object.spawnPositionJitter.x}
              onChange={(v) =>
                updateObject(object.id, {
                  spawnPositionJitter: {
                    ...object.spawnPositionJitter,
                    x: v,
                  },
                })
              }
              step={0.01}
              precision={2}
              min={0}
              max={10}
              compact
              label="X"
            />
            <DragInput
              value={object.spawnPositionJitter.y}
              onChange={(v) =>
                updateObject(object.id, {
                  spawnPositionJitter: {
                    ...object.spawnPositionJitter,
                    y: v,
                  },
                })
              }
              step={0.01}
              precision={2}
              min={0}
              max={10}
              compact
              label="Y"
            />
            <DragInput
              value={object.spawnPositionJitter.z}
              onChange={(v) =>
                updateObject(object.id, {
                  spawnPositionJitter: {
                    ...object.spawnPositionJitter,
                    z: v,
                  },
                })
              }
              step={0.01}
              precision={2}
              min={0}
              max={10}
              compact
              label="Z"
            />
          </div>
        </div>

        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pt-2">
          Motion
        </h4>

        <div className="space-y-1">
          <span className="text-xs text-neutral-400">Velocity</span>
          <div className="grid grid-cols-3 gap-1">
            <DragInput
              value={object.velocity.x}
              onChange={(v) =>
                updateObject(object.id, {
                  velocity: { ...object.velocity, x: v },
                })
              }
              step={0.1}
              precision={2}
              min={-50}
              max={50}
              compact
              label="X"
            />
            <DragInput
              value={object.velocity.y}
              onChange={(v) =>
                updateObject(object.id, {
                  velocity: { ...object.velocity, y: v },
                })
              }
              step={0.1}
              precision={2}
              min={-50}
              max={50}
              compact
              label="Y"
            />
            <DragInput
              value={object.velocity.z}
              onChange={(v) =>
                updateObject(object.id, {
                  velocity: { ...object.velocity, z: v },
                })
              }
              step={0.1}
              precision={2}
              min={-50}
              max={50}
              compact
              label="Z"
            />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-neutral-400">Velocity Jitter</span>
          <div className="grid grid-cols-3 gap-1">
            <DragInput
              value={object.velocityJitter.x}
              onChange={(v) =>
                updateObject(object.id, {
                  velocityJitter: { ...object.velocityJitter, x: v },
                })
              }
              step={0.1}
              precision={2}
              min={0}
              max={20}
              compact
              label="X"
            />
            <DragInput
              value={object.velocityJitter.y}
              onChange={(v) =>
                updateObject(object.id, {
                  velocityJitter: { ...object.velocityJitter, y: v },
                })
              }
              step={0.1}
              precision={2}
              min={0}
              max={20}
              compact
              label="Y"
            />
            <DragInput
              value={object.velocityJitter.z}
              onChange={(v) =>
                updateObject(object.id, {
                  velocityJitter: { ...object.velocityJitter, z: v },
                })
              }
              step={0.1}
              precision={2}
              min={0}
              max={20}
              compact
              label="Z"
            />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-neutral-400">Angular Velocity</span>
          <div className="grid grid-cols-3 gap-1">
            <DragInput
              value={object.angularVelocity.x}
              onChange={(v) =>
                updateObject(object.id, {
                  angularVelocity: { ...object.angularVelocity, x: v },
                })
              }
              step={0.1}
              precision={2}
              min={-10}
              max={10}
              compact
              label="X"
            />
            <DragInput
              value={object.angularVelocity.y}
              onChange={(v) =>
                updateObject(object.id, {
                  angularVelocity: { ...object.angularVelocity, y: v },
                })
              }
              step={0.1}
              precision={2}
              min={-10}
              max={10}
              compact
              label="Y"
            />
            <DragInput
              value={object.angularVelocity.z}
              onChange={(v) =>
                updateObject(object.id, {
                  angularVelocity: { ...object.angularVelocity, z: v },
                })
              }
              step={0.1}
              precision={2}
              min={-10}
              max={10}
              compact
              label="Z"
            />
          </div>
        </div>

        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pt-2">
          Physics
        </h4>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-32">Gravity</span>
          <DragInput
            value={object.gravity}
            onChange={(v) => updateObject(object.id, { gravity: v })}
            step={0.1}
            precision={2}
            min={-50}
            max={50}
            compact
          />
        </div>

        <div className="space-y-1">
          <span className="text-xs text-neutral-400">Wind</span>
          <div className="grid grid-cols-3 gap-1">
            <DragInput
              value={object.wind.x}
              onChange={(v) =>
                updateObject(object.id, {
                  wind: { ...object.wind, x: v },
                })
              }
              step={0.1}
              precision={2}
              min={-20}
              max={20}
              compact
              label="X"
            />
            <DragInput
              value={object.wind.y}
              onChange={(v) =>
                updateObject(object.id, {
                  wind: { ...object.wind, y: v },
                })
              }
              step={0.1}
              precision={2}
              min={-20}
              max={20}
              compact
              label="Y"
            />
            <DragInput
              value={object.wind.z}
              onChange={(v) =>
                updateObject(object.id, {
                  wind: { ...object.wind, z: v },
                })
              }
              step={0.1}
              precision={2}
              min={-20}
              max={20}
              compact
              label="Z"
            />
          </div>
        </div>

        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pt-2">
          Particle Properties
        </h4>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-32">Lifetime</span>
          <DragInput
            value={object.lifetime}
            onChange={(v) => updateObject(object.id, { lifetime: v })}
            step={0.1}
            precision={2}
            min={0.1}
            max={60}
            compact
          />
          <span className="text-xs text-neutral-500">s</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-32">Min Scale</span>
          <DragInput
            value={object.minScale}
            onChange={(v) => updateObject(object.id, { minScale: v })}
            step={0.01}
            precision={2}
            min={0.01}
            max={10}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-32">Max Scale</span>
          <DragInput
            value={object.maxScale}
            onChange={(v) => updateObject(object.id, { maxScale: v })}
            step={0.01}
            precision={2}
            min={0.01}
            max={10}
            compact
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-32">Random Seed</span>
          <DragInput
            value={object.seed}
            onChange={(v) =>
              updateObject(object.id, { seed: Math.round(v) })
            }
            step={1}
            precision={0}
            min={0}
            max={99999}
            compact
          />
        </div>
      </div>
    </>
  );
}
