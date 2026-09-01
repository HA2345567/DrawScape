export type ToolType =
  | "lock"
  | "hand"
  | "selection"
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "arrow"
  | "line"
  | "freedraw"
  | "text"
  | "image"
  | "eraser";

export type StrokeStyle = "solid" | "dashed" | "dotted";

export type StrokeWidth = 1 | 2 | 4 | 6;

export interface Point {
  x: number;
  y: number;
}

export interface BaseElement {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: StrokeWidth;
  strokeStyle: StrokeStyle;
  opacity: number;
  isDeleted?: boolean;
}

export interface RectangleElement extends BaseElement {
  type: "rectangle";
  borderRadius?: number;
}

export interface DiamondElement extends BaseElement {
  type: "diamond";
}

export interface EllipseElement extends BaseElement {
  type: "ellipse";
}

export interface ArrowElement extends BaseElement {
  type: "arrow";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface LineElement extends BaseElement {
  type: "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface FreeDrawElement extends BaseElement {
  type: "freedraw";
  points: Point[];
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  image?: HTMLImageElement;
}

export type CanvasElement =
  | RectangleElement
  | DiamondElement
  | EllipseElement
  | ArrowElement
  | LineElement
  | FreeDrawElement
  | TextElement
  | ImageElement;

export type ResizeHandle =
  | "nw"
  | "ne"
  | "se"
  | "sw"
  | "n"
  | "s"
  | "e"
  | "w"
  | "start"
  | "end"
  | "inside";
