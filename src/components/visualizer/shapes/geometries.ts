import type { BufferGeometry } from "three/webgpu";
import {
  BoxGeometry,
  ConeGeometry,
  ExtrudeGeometry,
  Shape,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
} from "three/webgpu";
import type { ShapeType } from "@/state/visualizer-store";

const bevel = (depth: number) => ({
  steps: 1,
  depth,
  bevelEnabled: true,
  bevelThickness: depth * 0.18,
  bevelSize: depth * 0.16,
  bevelSegments: 2,
});

const makeExtruded = (factory: () => Shape, depth = 0.4) => {
  const shape = factory();
  const geometry = new ExtrudeGeometry(shape, bevel(depth));
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
};

const heartShape = () => {
  const heart = new Shape();
  heart.moveTo(0, 0.5);
  heart.bezierCurveTo(-0.35, 0.92, -0.85, 0.6, -0.85, 0.08);
  heart.bezierCurveTo(-0.85, -0.38, -0.32, -0.62, 0, -0.9);
  heart.bezierCurveTo(0.32, -0.62, 0.85, -0.38, 0.85, 0.08);
  heart.bezierCurveTo(0.85, 0.6, 0.35, 0.92, 0, 0.5);
  return heart;
};

const starShape = () => {
  const star = new Shape();
  const outer = 0.9;
  const inner = 0.38;
  const points = 5;
  star.moveTo(0, outer);
  for (let i = 1; i <= points * 2; i += 1) {
    const angle = (Math.PI * i) / points;
    const radius = i % 2 === 0 ? outer : inner;
    const x = Math.sin(angle) * radius;
    const y = Math.cos(angle) * radius;
    star.lineTo(x, y);
  }
  star.closePath();
  return star;
};

const arrowShape = () => {
  const arrow = new Shape();
  arrow.moveTo(-0.8, -0.2);
  arrow.lineTo(0.15, -0.2);
  arrow.lineTo(0.15, -0.55);
  arrow.lineTo(0.85, 0);
  arrow.lineTo(0.15, 0.55);
  arrow.lineTo(0.15, 0.2);
  arrow.lineTo(-0.8, 0.2);
  arrow.closePath();
  return arrow;
};

const pyramidGeometry = () => {
  const geometry = new ConeGeometry(1, 1.1, 4, 1);
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
};

const torusGeometry = () => {
  const geometry = new TorusGeometry(0.85, 0.25, 24, 64);
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
};

export const createShapeGeometry = (type: ShapeType): BufferGeometry => {
  switch (type) {
    case "cube": {
      const geometry = new BoxGeometry(1.1, 1.1, 1.1, 1, 1, 1);
      geometry.center();
      geometry.computeVertexNormals();
      return geometry;
    }
    case "sphere": {
      const geometry = new SphereGeometry(0.9, 42, 28);
      geometry.center();
      geometry.computeVertexNormals();
      return geometry;
    }
    case "heart":
      return makeExtruded(heartShape, 0.55);
    case "star":
      return makeExtruded(starShape, 0.45);
    case "torus":
      return torusGeometry();
    case "arrow":
      return makeExtruded(arrowShape, 0.35);
    case "pyramid":
      return pyramidGeometry();
    case "tetrahedron": {
      const geometry = new TetrahedronGeometry(1);
      geometry.center();
      geometry.computeVertexNormals();
      return geometry;
    }
    default: {
      const geometry = new SphereGeometry(0.9, 32, 20);
      geometry.center();
      geometry.computeVertexNormals();
      return geometry;
    }
  }
};
