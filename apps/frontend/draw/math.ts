import { CanvasElement, Point, ResizeHandle } from "./types";

export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

export function pointNearLine(
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  threshold = 8
): boolean {
  const lineLen = Math.hypot(x2 - x1, y2 - y1);
  if (lineLen === 0) return Math.hypot(x - x1, y - y1) < threshold;

  const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (lineLen * lineLen)));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);

  return Math.hypot(x - projX, y - projY) < threshold;
}

export function getElementBounds(element: CanvasElement): { minX: number; minY: number; maxX: number; maxY: number } {
  if (element.type === "arrow" || element.type === "line") {
    const minX = Math.min(element.startX, element.endX);
    const maxX = Math.max(element.startX, element.endX);
    const minY = Math.min(element.startY, element.endY);
    const maxY = Math.max(element.startY, element.endY);
    return { minX, minY, maxX, maxY };
  }

  if (element.type === "freedraw") {
    if (element.points.length === 0) {
      return { minX: element.x, minY: element.y, maxX: element.x, maxY: element.y };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of element.points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    return { minX, minY, maxX, maxY };
  }

  if (element.type === "text") {
    const lines = (element.text || "").split("\n");
    const fontSize = element.fontSize || 20;
    const lineHeight = fontSize * 1.25;
    const height = lines.length * lineHeight;
    let maxLineLen = 0;
    lines.forEach((l) => {
      if (l.length > maxLineLen) maxLineLen = l.length;
    });
    const width = element.width || Math.max(maxLineLen * (fontSize * 0.6), 24);
    return { minX: element.x, minY: element.y, maxX: element.x + width, maxY: element.y + height };
  }

  const minX = Math.min(element.x, element.x + element.width);
  const maxX = Math.max(element.x, element.x + element.width);
  const minY = Math.min(element.y, element.y + element.height);
  const maxY = Math.max(element.y, element.y + element.height);

  return { minX, minY, maxX, maxY };
}

export function isPointInsideElement(point: Point, element: CanvasElement, threshold = 6): boolean {
  if (element.isDeleted) return false;

  const { x, y } = point;

  if (element.type === "rectangle" || element.type === "image") {
    const { minX, minY, maxX, maxY } = getElementBounds(element);
    // If background is transparent or subtle, check borders or interior
    return x >= minX - threshold && x <= maxX + threshold && y >= minY - threshold && y <= maxY + threshold;
  }

  if (element.type === "diamond") {
    const { minX, minY, maxX, maxY } = getElementBounds(element);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const w = (maxX - minX) / 2;
    const h = (maxY - minY) / 2;
    if (w === 0 || h === 0) return false;
    const norm = Math.abs(x - midX) / w + Math.abs(y - midY) / h;
    return norm <= 1.05;
  }

  if (element.type === "ellipse") {
    const { minX, minY, maxX, maxY } = getElementBounds(element);
    const rx = (maxX - minX) / 2;
    const ry = (maxY - minY) / 2;
    if (rx === 0 || ry === 0) return false;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const norm = Math.pow(x - cx, 2) / Math.pow(rx, 2) + Math.pow(y - cy, 2) / Math.pow(ry, 2);
    return norm <= 1.1;
  }

  if (element.type === "arrow" || element.type === "line") {
    return pointNearLine(x, y, element.startX, element.startY, element.endX, element.endY, threshold + element.strokeWidth);
  }

  if (element.type === "freedraw") {
    for (let i = 0; i < element.points.length - 1; i++) {
      const p1 = element.points[i];
      const p2 = element.points[i + 1];
      if (pointNearLine(x, y, p1.x, p1.y, p2.x, p2.y, threshold + element.strokeWidth)) {
        return true;
      }
    }
    return false;
  }

  if (element.type === "text") {
    const { minX, minY, maxX, maxY } = getElementBounds(element);
    return x >= minX - threshold && x <= maxX + threshold && y >= minY - threshold && y <= maxY + threshold;
  }

  return false;
}

export function getHitResizeHandle(point: Point, element: CanvasElement, handleSize = 9): ResizeHandle | null {
  const { x, y } = point;
  const hs = handleSize;

  if (element.type === "arrow" || element.type === "line") {
    if (Math.hypot(x - element.startX, y - element.startY) < hs) return "start";
    if (Math.hypot(x - element.endX, y - element.endY) < hs) return "end";
    return isPointInsideElement(point, element) ? "inside" : null;
  }

  const { minX, minY, maxX, maxY } = getElementBounds(element);

  // Corners
  if (Math.hypot(x - minX, y - minY) <= hs) return "nw";
  if (Math.hypot(x - maxX, y - minY) <= hs) return "ne";
  if (Math.hypot(x - maxX, y - maxY) <= hs) return "se";
  if (Math.hypot(x - minX, y - maxY) <= hs) return "sw";

  if (isPointInsideElement(point, element)) return "inside";

  return null;
}
