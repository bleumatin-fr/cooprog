interface Point {
  x: number;
  y: number;
}

interface Circle extends Point {
  r: number;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function circleFromTwoPoints(A: Point, B: Point): Circle {
  const cx = (A.x + B.x) / 2;
  const cy = (A.y + B.y) / 2;
  const r = distance(A, B) / 2;
  return { x: cx, y: cy, r };
}

function circleFromThreePoints(A: Point, B: Point, C: Point): Circle {
  const D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  if (D === 0) throw new Error("Collinear points");

  const ux =
    ((A.x ** 2 + A.y ** 2) * (B.y - C.y) +
      (B.x ** 2 + B.y ** 2) * (C.y - A.y) +
      (C.x ** 2 + C.y ** 2) * (A.y - B.y)) /
    D;

  const uy =
    ((A.x ** 2 + A.y ** 2) * (C.x - B.x) +
      (B.x ** 2 + B.y ** 2) * (A.x - C.x) +
      (C.x ** 2 + C.y ** 2) * (B.x - A.x)) /
    D;

  const center: Point = { x: ux, y: uy };
  return { ...center, r: distance(center, A) };
}

function isInside(circle: Circle, point: Point): boolean {
  return distance(circle, point) <= circle.r;
}

function welzl(points: Point[], boundary: Point[] = []): Circle {
  if (points.length === 0 || boundary.length === 3) {
    if (boundary.length === 0) {
      return { x: 0, y: 0, r: 0 };
    } else if (boundary.length === 1) {
      return { ...boundary[0], r: 0 };
    } else if (boundary.length === 2) {
      return circleFromTwoPoints(boundary[0], boundary[1]);
    } else {
      return circleFromThreePoints(boundary[0], boundary[1], boundary[2]);
    }
  }

  const idx = Math.floor(Math.random() * points.length);
  const p = points[idx];
  points.splice(idx, 1);

  const circle = welzl(points, boundary);

  if (isInside(circle, p)) {
    points.push(p);
    return circle;
  }

  boundary.push(p);
  const newCircle = welzl(points, boundary);
  boundary.pop();
  points.push(p);
  return newCircle;
}

export default function enclosingCircle(points: readonly Point[]): Circle {
  const uniquePoints = [...points].filter(
    (point, index, arr) =>
      arr.findIndex((p) => p.x === point.x && p.y === point.y) === index
  );
  return welzl(uniquePoints);
}
