import { CanvasElement } from "./types";
import { getElementBounds } from "./math";

export function renderElement(ctx: CanvasRenderingContext2D, element: CanvasElement) {
  if (element.isDeleted) return;

  ctx.save();
  ctx.globalAlpha = element.opacity ?? 1;
  ctx.strokeStyle = element.strokeColor || "#ffffff";
  ctx.fillStyle = element.backgroundColor || "transparent";
  ctx.lineWidth = element.strokeWidth || 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (element.strokeStyle === "dashed") {
    ctx.setLineDash([8, 8]);
  } else if (element.strokeStyle === "dotted") {
    ctx.setLineDash([3, 5]);
  } else {
    ctx.setLineDash([]);
  }

  switch (element.type) {
    case "rectangle": {
      const minX = Math.min(element.x, element.x + element.width);
      const minY = Math.min(element.y, element.y + element.height);
      const width = Math.abs(element.width);
      const height = Math.abs(element.height);

      if (element.backgroundColor && element.backgroundColor !== "transparent") {
        ctx.fillRect(minX, minY, width, height);
      }
      ctx.strokeRect(minX, minY, width, height);
      break;
    }

    case "diamond": {
      const minX = Math.min(element.x, element.x + element.width);
      const minY = Math.min(element.y, element.y + element.height);
      const width = Math.abs(element.width);
      const height = Math.abs(element.height);
      const midX = minX + width / 2;
      const midY = minY + height / 2;

      ctx.beginPath();
      ctx.moveTo(midX, minY);
      ctx.lineTo(minX + width, midY);
      ctx.lineTo(midX, minY + height);
      ctx.lineTo(minX, midY);
      ctx.closePath();

      if (element.backgroundColor && element.backgroundColor !== "transparent") {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case "ellipse": {
      const minX = Math.min(element.x, element.x + element.width);
      const minY = Math.min(element.y, element.y + element.height);
      const width = Math.abs(element.width);
      const height = Math.abs(element.height);
      const cx = minX + width / 2;
      const cy = minY + height / 2;
      const rx = width / 2;
      const ry = height / 2;

      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(rx, 0.1), Math.max(ry, 0.1), 0, 0, 2 * Math.PI);

      if (element.backgroundColor && element.backgroundColor !== "transparent") {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case "arrow": {
      const { startX, startY, endX, endY } = element;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Render crisp arrowhead
      const angle = Math.atan2(endY - startY, endX - startX);
      const arrowLength = 14 + element.strokeWidth * 1.5;
      const arrowAngle = Math.PI / 6;

      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle - arrowAngle),
        endY - arrowLength * Math.sin(angle - arrowAngle)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle + arrowAngle),
        endY - arrowLength * Math.sin(angle + arrowAngle)
      );
      ctx.stroke();
      break;
    }

    case "line": {
      const { startX, startY, endX, endY } = element;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      break;
    }

    case "freedraw": {
      const points = element.points;
      if (points.length < 2) break;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }

      if (points.length >= 2) {
        const last = points[points.length - 1];
        ctx.lineTo(last.x, last.y);
      }
      ctx.stroke();
      break;
    }

    case "text": {
      ctx.font = `${element.fontSize || 20}px ${element.fontFamily || "sans-serif"}`;
      ctx.fillStyle = element.strokeColor || "#ffffff";
      ctx.textBaseline = "top";
      const lines = (element.text || "").split("\n");
      const lineHeight = (element.fontSize || 20) * 1.25;
      lines.forEach((line: string, index: number) => {
        ctx.fillText(line, element.x, element.y + index * lineHeight);
      });
      break;
    }

    case "image": {
      if (element.image && element.image.complete) {
        ctx.drawImage(element.image, element.x, element.y, element.width, element.height);
      }
      break;
    }
  }

  ctx.restore();
}

export function renderSelectionBox(ctx: CanvasRenderingContext2D, element: CanvasElement, zoom: number) {
  if (element.isDeleted) return;

  ctx.save();
  ctx.strokeStyle = "#6965db";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 1.5 / (zoom / 100);
  ctx.setLineDash([5 / (zoom / 100), 5 / (zoom / 100)]);

  const { minX, minY, maxX, maxY } = getElementBounds(element);
  const pad = 6 / (zoom / 100);
  const hs = 6 / (zoom / 100);

  ctx.strokeRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2);

  // Draw 4 corner handles
  ctx.setLineDash([]);
  const corners = [
    { x: minX - pad, y: minY - pad },
    { x: maxX + pad, y: minY - pad },
    { x: maxX + pad, y: maxY + pad },
    { x: minX - pad, y: maxY + pad },
  ];

  corners.forEach((c) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, hs, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}
