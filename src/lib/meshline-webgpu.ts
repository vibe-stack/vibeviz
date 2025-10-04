/**
 * MeshLine - WebGPU Compatible Version
 * Converted from three.meshline to use WebGPU Node Material System
 */

import {
  add,
  attribute,
  cameraProjectionMatrix,
  color,
  Fn,
  modelViewMatrix,
  mul,
  normalize,
  positionLocal,
  sub,
  uniform,
  vec2,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";

export class MeshLineGeometry extends THREE.BufferGeometry {
  isMeshLine = true;
  type = "MeshLine";

  positions: Float32Array = new Float32Array(0);
  previous: Float32Array = new Float32Array(0);
  next: Float32Array = new Float32Array(0);
  side: Float32Array = new Float32Array(0);
  width: Float32Array = new Float32Array(0);
  indices_array: Uint16Array = new Uint16Array(0);
  uvs: Float32Array = new Float32Array(0);
  counters: Float32Array = new Float32Array(0);
  _points: any[] = [];
  _geom: any = null;
  widthCallback: ((progress: number) => number) | null = null;
  matrixWorld = new THREE.Matrix4();

  private _attributes: any = null;
  private _pointCount = 0;
  private _staticDirty = false;
  private _pendingBounds = false;
  private _tempMin = new THREE.Vector3();
  private _tempMax = new THREE.Vector3();

  private ensureFloatArray(
    property:
      | "positions"
      | "previous"
      | "next"
      | "side"
      | "width"
      | "uvs"
      | "counters",
    size: number,
  ): Float32Array {
    let current = this[property] as Float32Array;
    if (current.length !== size) {
      current = new Float32Array(size);
      (this as unknown as Record<string, Float32Array>)[property] = current;
    }
    return current;
  }

  private ensureIndexArray(size: number): Uint16Array {
    if (this.indices_array.length !== size) {
      this.indices_array = new Uint16Array(size);
    }
    return this.indices_array;
  }

  setMatrixWorld(matrixWorld: THREE.Matrix4) {
    this.matrixWorld = matrixWorld;
  }

  setGeometry(g: THREE.BufferGeometry, c?: (progress: number) => number) {
    this._geom = g;
    const positions = g.getAttribute("position");
    this.setPoints(Array.from(positions.array as Float32Array), c);
  }

  setPoints(
    points: Float32Array | number[] | THREE.Vector3[],
    wcb?: (progress: number) => number,
  ) {
    if (!(points instanceof Float32Array) && !Array.isArray(points)) {
      console.error(
        "ERROR: The BufferArray of points is not instanced correctly.",
      );
      return;
    }

    this._points = points as any;
    this.widthCallback = wcb || null;

    const hasVectorPoints =
      Array.isArray(points) &&
      points.length > 0 &&
      points[0] instanceof THREE.Vector3;

    const pointCount = hasVectorPoints
      ? (points as THREE.Vector3[]).length
      : Math.floor((points as Float32Array | number[]).length / 3);

    if (pointCount <= 0) {
      this.positions = this.ensureFloatArray("positions", 0);
      this.counters = this.ensureFloatArray("counters", 0);
      this._pointCount = 0;
      this._staticDirty = true;
      this.process();
      return;
    }

    const positions = this.ensureFloatArray("positions", pointCount * 6);
    const counters = this.ensureFloatArray("counters", pointCount * 2);

    this._pointCount = pointCount;
    this._staticDirty = true;
    this._pendingBounds = false;

    let posOffset = 0;
    let counterOffset = 0;

    if (hasVectorPoints) {
      const vecPoints = points as THREE.Vector3[];
      const denom = vecPoints.length || 1;
      for (let j = 0; j < vecPoints.length; j++) {
        const p = vecPoints[j];
        const c = j / denom;
        positions[posOffset++] = p.x;
        positions[posOffset++] = p.y;
        positions[posOffset++] = p.z;
        positions[posOffset++] = p.x;
        positions[posOffset++] = p.y;
        positions[posOffset++] = p.z;
        counters[counterOffset++] = c;
        counters[counterOffset++] = c;
      }
    } else {
      const arr = points as Float32Array | number[];
      if (arr.length % 3 !== 0) {
        console.warn(
          "MeshLineGeometry.setPoints received array with a length not divisible by 3.",
        );
      }
      const denom = arr.length || 1;
      for (let j = 0; j < arr.length; j += 3) {
        const x = arr[j] ?? 0;
        const y = arr[j + 1] ?? 0;
        const z = arr[j + 2] ?? 0;
        const c = j / denom;
        positions[posOffset++] = x;
        positions[posOffset++] = y;
        positions[posOffset++] = z;
        positions[posOffset++] = x;
        positions[posOffset++] = y;
        positions[posOffset++] = z;
        counters[counterOffset++] = c;
        counters[counterOffset++] = c;
      }
    }

    this.process();
  }

  compareV3(a: number, b: number): boolean {
    const aa = a * 6;
    const ab = b * 6;
    return (
      this.positions[aa] === this.positions[ab] &&
      this.positions[aa + 1] === this.positions[ab + 1] &&
      this.positions[aa + 2] === this.positions[ab + 2]
    );
  }

  copyV3(a: number): number[] {
    const aa = a * 6;
    return [this.positions[aa], this.positions[aa + 1], this.positions[aa + 2]];
  }

  process(skipStatic = false) {
    const l = this.positions.length / 6;

    if (this._pointCount !== l) {
      this._pointCount = l;
      this._staticDirty = true;
    }

    const previous = this.ensureFloatArray("previous", this.positions.length);
    const next = this.ensureFloatArray("next", this.positions.length);
    const side = this.ensureFloatArray("side", l * 2);
    const width = this.ensureFloatArray("width", l * 2);
    const uvs = this.ensureFloatArray("uvs", l * 4);
    const indices = this.ensureIndexArray(Math.max(0, (l - 1) * 6));
    const counters = this.counters;

    const shouldUpdateStatic = this._staticDirty || !skipStatic;

    const copyPair = (
      sourceIndex: number,
      target: Float32Array,
      offset: number,
    ): number => {
      const src = sourceIndex * 6;
      target[offset] = this.positions[src];
      target[offset + 1] = this.positions[src + 1];
      target[offset + 2] = this.positions[src + 2];
      target[offset + 3] = this.positions[src + 3];
      target[offset + 4] = this.positions[src + 4];
      target[offset + 5] = this.positions[src + 5];
      return offset + 6;
    };

    let prevOffset = 0;
    let nextOffset = 0;
    let sideOffset = 0;
    let widthOffset = 0;
    let uvOffset = 0;
    let indexOffset = 0;

    const startingPrevIndex =
      l >= 2 && this.compareV3(0, l - 1) ? Math.max(l - 2, 0) : 0;
    prevOffset = copyPair(startingPrevIndex, previous, prevOffset);

    const denom = l > 1 ? l - 1 : 1;

    for (let j = 0; j < l; j++) {
      const progress = denom === 0 ? 0 : j / denom;
      if (shouldUpdateStatic) {
        side[sideOffset++] = 1;
        side[sideOffset++] = -1;

        const w = this.widthCallback ? this.widthCallback(progress) : 1;
        width[widthOffset++] = w;
        width[widthOffset++] = w;

        uvs[uvOffset++] = progress;
        uvs[uvOffset++] = 0;
        uvs[uvOffset++] = progress;
        uvs[uvOffset++] = 1;
      }

      if (j < l - 1) {
        prevOffset = copyPair(j, previous, prevOffset);

        if (shouldUpdateStatic) {
          const n = j * 2;
          indices[indexOffset++] = n;
          indices[indexOffset++] = n + 1;
          indices[indexOffset++] = n + 2;
          indices[indexOffset++] = n + 2;
          indices[indexOffset++] = n + 1;
          indices[indexOffset++] = n + 3;
        }
      }

      if (j > 0) {
        nextOffset = copyPair(j, next, nextOffset);
      }
    }

    const endingNextIndex =
      l >= 2 && this.compareV3(l - 1, 0) ? (l > 1 ? 1 : 0) : l - 1;
    nextOffset = copyPair(endingNextIndex, next, nextOffset);

    if (shouldUpdateStatic) {
      this._staticDirty = false;
    }

    const needsNewAttributes =
      !this._attributes ||
      this._attributes.position.array !== this.positions ||
      this._attributes.previous.array !== this.previous ||
      this._attributes.next.array !== this.next ||
      this._attributes.side.array !== this.side ||
      this._attributes.width.array !== this.width ||
      this._attributes.uv.array !== this.uvs ||
      this._attributes.index.array !== this.indices_array ||
      this._attributes.counters.array !== counters;

    if (needsNewAttributes) {
      this._attributes = {
        position: new THREE.BufferAttribute(this.positions, 3),
        previous: new THREE.BufferAttribute(this.previous, 3),
        next: new THREE.BufferAttribute(this.next, 3),
        side: new THREE.BufferAttribute(this.side, 1),
        width: new THREE.BufferAttribute(this.width, 1),
        uv: new THREE.BufferAttribute(this.uvs, 2),
        index: new THREE.BufferAttribute(this.indices_array, 1),
        counters: new THREE.BufferAttribute(counters, 1),
      };
    }

    this._attributes.position.needsUpdate = true;
    this._attributes.previous.needsUpdate = true;
    this._attributes.next.needsUpdate = true;
    this._attributes.counters.needsUpdate = true;
    this._attributes.side.needsUpdate = shouldUpdateStatic;
    this._attributes.width.needsUpdate = shouldUpdateStatic;
    this._attributes.uv.needsUpdate = shouldUpdateStatic;
    this._attributes.index.needsUpdate = shouldUpdateStatic;

    this.setAttribute("position", this._attributes.position);
    this.setAttribute("previous", this._attributes.previous);
    this.setAttribute("next", this._attributes.next);
    this.setAttribute("side", this._attributes.side);
    this.setAttribute("width", this._attributes.width);
    this.setAttribute("uv", this._attributes.uv);
    this.setAttribute("counters", this._attributes.counters);

    this.setIndex(this._attributes.index);

    if (shouldUpdateStatic) {
      this.computeBoundingSphere();
      this.computeBoundingBox();
    } else if (this._pendingBounds) {
      const min = this._tempMin;
      const max = this._tempMax;

      const boundingBox = this.boundingBox ?? new THREE.Box3();
      boundingBox.min.copy(min);
      boundingBox.max.copy(max);
      this.boundingBox = boundingBox;

      const centerX = (min.x + max.x) * 0.5;
      const centerY = (min.y + max.y) * 0.5;
      const centerZ = (min.z + max.z) * 0.5;

      const spanX = max.x - min.x;
      const spanY = max.y - min.y;
      const spanZ = max.z - min.z;
      const radius =
        0.5 * Math.sqrt(spanX * spanX + spanY * spanY + spanZ * spanZ);

      const boundingSphere = this.boundingSphere ?? new THREE.Sphere();
      boundingSphere.center.set(centerX, centerY, centerZ);
      boundingSphere.radius = radius;
      this.boundingSphere = boundingSphere;

      this._pendingBounds = false;
    }
  }

  dispose() {
    super.dispose();
    // Clear internal arrays to free memory
    this.positions = new Float32Array(0);
    this.previous = new Float32Array(0);
    this.next = new Float32Array(0);
    this.side = new Float32Array(0);
    this.width = new Float32Array(0);
    this.indices_array = new Uint16Array(0);
    this.uvs = new Float32Array(0);
    this.counters = new Float32Array(0);
    this._points = [];
    this._attributes = null;
    this._geom = null;
    this._pointCount = 0;
    this._staticDirty = true;
    this._pendingBounds = false;
  }

  updateFromVectorArray(points: THREE.Vector3[]) {
    if (!points.length) {
      return;
    }

    if (this._pointCount !== points.length) {
      this.setPoints(points);
      return;
    }

    const positions = this.positions;
    let posOffset = 0;
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const x = p.x;
      const y = p.y;
      const z = p.z;

      positions[posOffset++] = x;
      positions[posOffset++] = y;
      positions[posOffset++] = z;
      positions[posOffset++] = x;
      positions[posOffset++] = y;
      positions[posOffset++] = z;

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }

    this._tempMin.set(minX, minY, minZ);
    this._tempMax.set(maxX, maxY, maxZ);
    this._pendingBounds = true;

    this.process(true);
  }
}

export interface MeshLineNodeMaterialParameters {
  color?: THREE.ColorRepresentation;
  lineWidth?: number;
  opacity?: number;
  resolution?: THREE.Vector2;
  sizeAttenuation?: boolean;
  transparent?: boolean;
  depthTest?: boolean;
  dashArray?: number;
  dashRatio?: number;
  dashOffset?: number;
}

export class MeshLineNodeMaterial extends THREE.NodeMaterial {
  isMeshLineMaterial = true;
  type = "MeshLineNodeMaterial";

  private _lineWidth = 1;
  private _color = new THREE.Color(0xffffff);
  private _opacity = 1;
  private _resolution = new THREE.Vector2(1, 1);
  private _sizeAttenuation = true;
  private _dashArray = 0;
  private _dashRatio = 0.5;
  private _dashOffset = 0;

  // Uniforms as nodes - avoid name conflicts with base class
  private lineWidthNode!: ReturnType<typeof uniform<number>>;
  private materialColor!: ReturnType<typeof uniform<THREE.Color>>;
  private materialOpacity!: ReturnType<typeof uniform<number>>;
  private resolutionNode!: ReturnType<typeof uniform<THREE.Vector2>>;
  private sizeAttenuationNode!: ReturnType<typeof uniform<number>>;
  private dashArrayNode!: ReturnType<typeof uniform<number>>;
  private dashRatioNode!: ReturnType<typeof uniform<number>>;
  private dashOffsetNode!: ReturnType<typeof uniform<number>>;
  private useDashNode!: ReturnType<typeof uniform<number>>;

  constructor(parameters?: MeshLineNodeMaterialParameters) {
    super();

    this.lights = false;
    this.transparent = parameters?.transparent ?? false;
    this.depthTest = parameters?.depthTest ?? true;

    // Apply parameters to internal state first
    if (parameters) {
      if (parameters.color !== undefined)
        this._color = new THREE.Color(parameters.color);
      if (parameters.lineWidth !== undefined)
        this._lineWidth = parameters.lineWidth;
      if (parameters.opacity !== undefined) this._opacity = parameters.opacity;
      if (parameters.resolution !== undefined)
        this._resolution.copy(parameters.resolution);
      if (parameters.sizeAttenuation !== undefined)
        this._sizeAttenuation = parameters.sizeAttenuation;
      if (parameters.dashArray !== undefined)
        this._dashArray = parameters.dashArray;
      if (parameters.dashRatio !== undefined)
        this._dashRatio = parameters.dashRatio;
      if (parameters.dashOffset !== undefined)
        this._dashOffset = parameters.dashOffset;
    }

    // Create uniform nodes with current values
    this.lineWidthNode = uniform(this._lineWidth);
    this.materialColor = uniform(color(this._color));
    this.materialOpacity = uniform(this._opacity);
    this.resolutionNode = uniform(vec2(this._resolution.x, this._resolution.y));
    this.sizeAttenuationNode = uniform(this._sizeAttenuation ? 1 : 0);
    this.dashArrayNode = uniform(this._dashArray);
    this.dashRatioNode = uniform(this._dashRatio);
    this.dashOffsetNode = uniform(this._dashOffset);
    this.useDashNode = uniform(this._dashArray > 0 ? 1 : 0);

    this.setupNodeMaterial();
  }

  private setupNodeMaterial() {
    // Custom attributes
    const previousAttr = attribute("previous", "vec3");
    const nextAttr = attribute("next", "vec3");
    const sideAttr = attribute("side", "float");
    const widthAttr = attribute("width", "float");

    // Vertex shader logic using TSL
    const vertexNode = Fn(() => {
      const aspect = this.resolutionNode.x.div(this.resolutionNode.y);

      // Transform positions
      const mvMatrix = modelViewMatrix;
      const projMatrix = cameraProjectionMatrix;
      const m = mul(projMatrix, mvMatrix);

      const finalPosition = mul(m, vec4(positionLocal, 1.0));
      const prevPos = mul(m, vec4(previousAttr, 1.0));
      const nextPos = mul(m, vec4(nextAttr, 1.0));

      // Fix function
      const fix = Fn(([i, asp]: [any, any]) => {
        const res = i.xy.div(i.w);
        res.x.mulAssign(asp);
        return res;
      });

      const currentP = fix(finalPosition, aspect);
      const prevP = fix(prevPos, aspect);
      const nextP = fix(nextPos, aspect);

      const w = mul(this.lineWidthNode, widthAttr);

      // Direction calculation with edge case handling
      const dir1 = normalize(sub(currentP, prevP));
      const dir2 = normalize(sub(nextP, currentP));

      // Handle edge cases: if nextP == currentP use dir1, if prevP == currentP use dir2
      const nextEqualsCurrent = nextP.equal(currentP);
      const prevEqualsCurrent = prevP.equal(currentP);

      const dir = nextEqualsCurrent.select(
        dir1,
        prevEqualsCurrent.select(dir2, normalize(add(dir1, dir2))),
      );

      // Normal calculation
      const normal = vec4(dir.y.negate(), dir.x, 0, 1);
      normal.xy.mulAssign(mul(0.5, w));
      const normalProjected = mul(projMatrix, normal);

      // Size attenuation - only apply when sizeAttenuation == 0
      const shouldNotAttenuate = this.sizeAttenuationNode.equal(0);

      normalProjected.xy.assign(
        shouldNotAttenuate.select(
          // When sizeAttenuation == 0, apply these transformations
          normalProjected.xy
            .mul(finalPosition.w)
            .div(mul(vec4(this.resolutionNode, 0, 1), projMatrix).xy),
          // Otherwise, keep normalProjected.xy as is
          normalProjected.xy,
        ),
      );

      // Final position
      finalPosition.xy.addAssign(mul(normalProjected.xy, sideAttr));

      return finalPosition;
    });

    // Fragment shader logic - just return the color
    const fragmentColor = vec4(this.materialColor, this.materialOpacity);

    this.vertexNode = vertexNode();
    this.fragmentNode = fragmentColor;
  }

  get lineWidth(): number {
    return this._lineWidth;
  }

  set lineWidth(value: number) {
    this._lineWidth = value;
    if (this.lineWidthNode) this.lineWidthNode.value = value;
  }

  get color(): THREE.Color {
    return this._color;
  }

  set color(value: THREE.Color | THREE.ColorRepresentation) {
    if (value instanceof THREE.Color) {
      this._color.copy(value);
      if (this.materialColor) this.materialColor.value.copy(value);
    } else {
      this._color.set(value);
      if (this.materialColor) this.materialColor.value.set(value);
    }
  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
    if (this.materialOpacity) this.materialOpacity.value = value;
  }

  get resolution(): THREE.Vector2 {
    return this._resolution;
  }

  set resolution(value: THREE.Vector2) {
    this._resolution.copy(value);
    if (this.resolutionNode) this.resolutionNode.value.copy(value);
  }

  get sizeAttenuation(): boolean {
    return this._sizeAttenuation;
  }

  set sizeAttenuation(value: boolean) {
    this._sizeAttenuation = value;
    if (this.sizeAttenuationNode)
      this.sizeAttenuationNode.value = value ? 1 : 0;
  }

  get dashArray(): number {
    return this._dashArray;
  }

  set dashArray(value: number) {
    this._dashArray = value;
    if (this.dashArrayNode) this.dashArrayNode.value = value;
    if (this.useDashNode) this.useDashNode.value = value !== 0 ? 1 : 0;
  }

  get dashRatio(): number {
    return this._dashRatio;
  }

  set dashRatio(value: number) {
    this._dashRatio = value;
    if (this.dashRatioNode) this.dashRatioNode.value = value;
  }

  get dashOffset(): number {
    return this._dashOffset;
  }

  set dashOffset(value: number) {
    this._dashOffset = value;
    if (this.dashOffsetNode) this.dashOffsetNode.value = value;
  }
}

export function MeshLineRaycast(
  this: THREE.Mesh,
  raycaster: THREE.Raycaster,
  intersects: THREE.Intersection[],
) {
  const inverseMatrix = new THREE.Matrix4();
  const ray = new THREE.Ray();
  const sphere = new THREE.Sphere();
  const interRay = new THREE.Vector3();
  const geometry = this.geometry;

  if (!geometry.boundingSphere) geometry.computeBoundingSphere();
  sphere.copy(geometry.boundingSphere as THREE.Sphere);
  sphere.applyMatrix4(this.matrixWorld);

  if (raycaster.ray.intersectSphere(sphere, interRay) === null) {
    return;
  }

  inverseMatrix.copy(this.matrixWorld).invert();
  ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

  const vStart = new THREE.Vector3();
  const vEnd = new THREE.Vector3();
  const interSegment = new THREE.Vector3();
  const index = geometry.index;
  const attributes = geometry.attributes;

  if (index !== null) {
    const indices = index.array;
    const positions = attributes.position.array;
    const widths = attributes.width.array;

    for (let i = 0, l = indices.length - 1; i < l; i++) {
      const a = indices[i];
      const b = indices[i + 1];

      vStart.fromArray(positions as ArrayLike<number>, a * 3);
      vEnd.fromArray(positions as ArrayLike<number>, b * 3);
      const width =
        widths[Math.floor(i / 3)] !== undefined ? widths[Math.floor(i / 3)] : 1;
      const material = this.material as MeshLineNodeMaterial;
      const precision =
        (raycaster.params.Line?.threshold || 1) +
        (material.lineWidth * width) / 2;
      const precisionSq = precision * precision;

      const distSq = ray.distanceSqToSegment(
        vStart,
        vEnd,
        interRay,
        interSegment,
      );

      if (distSq > precisionSq) continue;

      interRay.applyMatrix4(this.matrixWorld);

      const distance = raycaster.ray.origin.distanceTo(interRay);

      if (distance < raycaster.near || distance > raycaster.far) continue;

      intersects.push({
        distance: distance,
        point: interSegment.clone().applyMatrix4(this.matrixWorld),
        index: i,
        face: null,
        faceIndex: undefined,
        object: this,
      });
      i = l;
    }
  }
}
