"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MenuIcon,
  HandIcon,
  PointerIcon,
  RectangleIcon,
  DiamondIcon,
  CircleIcon,
  ArrowIcon,
  LineIcon,
  PencilIcon,
  TextIcon,
  ImageIcon,
  EraserIcon,
  ShareIcon,
  UndoIcon,
  RedoIcon,
  PlusIcon,
  MinusIcon,
} from "./CanvasIcons";
import { CanvasElement, Point, ResizeHandle } from "@/draw/types";
import { renderElement, renderSelectionBox } from "@/draw/renderer";
import { isPointInsideElement, getHitResizeHandle } from "@/draw/math";
import { useCollaboration, applyShape } from "@/draw/useCollaboration";

export type ToolType =
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

interface CanvasLayoutProps {
  roomId?: string;
}

export default function CanvasLayout({ roomId }: CanvasLayoutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drawing & Canvas Elements State
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Selection & Resize State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectionDrag, setSelectionDrag] = useState<{
    handle: ResizeHandle;
    startPoint: Point;
    initialElement: CanvasElement;
  } | null>(null);
  const [cursorStyle, setCursorStyle] = useState<string>("default");

  // Text Tool Inline Input State
  const [textEditing, setTextEditing] = useState<{
    worldX: number;
    worldY: number;
    screenX: number;
    screenY: number;
    text: string;
  } | null>(null);

  // Layout & UI State
  const [activeTool, setActiveTool] = useState<ToolType>("selection");
  const [zoom, setZoom] = useState<number>(100);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Convert screen coordinates to world coordinates
  const toWorldPoint = useCallback(
    (clientX: number, clientY: number): Point => {
      const scale = zoom / 100;
      return {
        x: (clientX - (window.innerWidth / 2 + pan.x)) / scale,
        y: (clientY - (window.innerHeight / 2 + pan.y)) / scale,
      };
    },
    [zoom, pan]
  );

  // Main canvas render loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark canvas background
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply zoom & pan transformations
    ctx.scale(dpr, dpr);
    ctx.translate(window.innerWidth / 2 + pan.x, window.innerHeight / 2 + pan.y);
    ctx.scale(zoom / 100, zoom / 100);

    // Render committed elements
    elements.forEach((el) => renderElement(ctx, el));

    // Render active drawing preview
    if (currentElement) {
      renderElement(ctx, currentElement);
    }

    // Render interactive selection box on selected element
    if (selectedId && activeTool === "selection") {
      const selected = elements.find((el) => el.id === selectedId);
      if (selected) {
        renderSelectionBox(ctx, selected, zoom);
      }
    }

    ctx.restore();
  }, [zoom, pan, elements, currentElement, selectedId, activeTool]);

  // Resize handler for responsive full screen canvas
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("drawscape:image-loaded", handleResize);
    return () => { window.removeEventListener("resize", handleResize); window.removeEventListener("drawscape:image-loaded", handleResize); };
  }, [handleResize]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const onInitial = useCallback((loaded: CanvasElement[]) => {
    setHistory([loaded]);
    setHistoryIndex(0);
  }, []);
  const onRemote = useCallback((shape: CanvasElement) => {
    setHistory(previous => previous.map(snapshot => applyShape(snapshot, shape)));
  }, []);
  const { ready, status } = useCollaboration(roomId, elements, setElements, onInitial, onRemote);

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
      setSelectedId(null);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
      setSelectedId(null);
    }
  }, [history, historyIndex]);

  // Delete selected element
  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return;
    setElements((prev) => {
      const remaining = prev.filter((el) => el.id !== selectedId);
      setHistory((h) => [...h.slice(0, historyIndex + 1), remaining]);
      setHistoryIndex((i) => i + 1);
      return remaining;
    });
    setSelectedId(null);
  }, [selectedId, historyIndex]);

  // Continuous eraser helper
  const eraseAt = useCallback(
    (x: number, y: number) => {
      setElements((prev) => {
        const remaining = prev.filter((el) => !isPointInsideElement({ x, y }, el, 14));
        if (remaining.length !== prev.length) {
          setHistory((h) => [...h.slice(0, historyIndex + 1), remaining]);
          setHistoryIndex((i) => i + 1);
          return remaining;
        }
        return prev;
      });
      setSelectedId(null);
    },
    [historyIndex]
  );

  // Commit text element
  const commitText = useCallback(
    (editing: { worldX: number; worldY: number; text: string }) => {
      const trimmed = editing.text.trim();
      if (!trimmed) {
        setTextEditing(null);
        return;
      }

      const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const textEl: CanvasElement = {
        id: newId,
        type: "text",
        x: editing.worldX,
        y: editing.worldY,
        text: trimmed,
        fontSize: 22,
        fontFamily: "Inter, sans-serif",
        width: 0,
        height: 0,
        strokeColor: "#A3A3A3",
        backgroundColor: "transparent",
        strokeWidth: 2,
        strokeStyle: "solid",
        opacity: 1,
      };

      const newElements = [...elements, textEl];
      setElements(newElements);
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), newElements]);
      setHistoryIndex((prev) => prev + 1);



      setTextEditing(null);
      setActiveTool("selection");
      setSelectedId(newId);
    },
    [elements, historyIndex]
  );

  // Add uploaded image to canvas
  const addImageToCanvas = useCallback(
    (src: string) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const maxWidth = 380;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const width = img.width * scale;
        const height = img.height * scale;
        const center = toWorldPoint(window.innerWidth / 2, window.innerHeight / 2);

        const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const imageEl: CanvasElement = {
          id: newId,
          type: "image",
          src,
          image: img,
          x: center.x - width / 2,
          y: center.y - height / 2,
          width,
          height,
          strokeColor: "transparent",
          backgroundColor: "transparent",
          strokeWidth: 1,
          strokeStyle: "solid",
          opacity: 1,
        };

        const newElements = [...elements, imageEl];
        setElements(newElements);
        setHistory((prev) => [...prev.slice(0, historyIndex + 1), newElements]);
        setHistoryIndex((prev) => prev + 1);



        setActiveTool("selection");
        setSelectedId(newId);
      };
    },
    [elements, historyIndex, toWorldPoint]
  );

  // File input change handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 1400000 || !/^image\/(png|jpeg|webp|gif)$/.test(file.type)) { alert("Choose a PNG, JPEG, WebP, or GIF smaller than 1.4 MB."); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        addImageToCanvas(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Drag and drop image files onto canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.size <= 1400000 && /^image\/(png|jpeg|webp|gif)$/.test(file.type)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          addImageToCanvas(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 10, 500));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 10, 10));
  }, []);

  const handleResetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(100);
  }, []);

  // Keyboard navigation & tool shortcuts exactly as requested
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.code === "Space" && !isSpacePressed) {
        setIsSpacePressed(true);
      } else if (e.key === "a" || e.key === "A") {
        setActiveTool("selection");
      } else if (e.key === "s" || e.key === "S") {
        setActiveTool("rectangle");
      } else if (e.key === "d" || e.key === "D") {
        setActiveTool("diamond");
      } else if (e.key === "f" || e.key === "F") {
        setActiveTool("ellipse");
      } else if (e.key === "j" || e.key === "J") {
        setActiveTool("arrow");
      } else if (e.key === "k" || e.key === "K") {
        setActiveTool("line");
      } else if (e.key === "l" || e.key === " L" || e.key === "L") {
        setActiveTool("freedraw");
      } else if (e.key === "n" || e.key === "N") {
        setActiveTool("text");
      } else if (e.key === "c" || e.key === "C") {
        setActiveTool("image");
        fileInputRef.current?.click();
      } else if (e.key === "0") {
        setActiveTool("eraser");
      } else if (e.key === "1") {
        setActiveTool("hand");
      } else if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteSelected();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    isSpacePressed,
    handleUndo,
    handleRedo,
    handleDeleteSelected,
    handleZoomIn,
    handleZoomOut,
  ]);

  // Mouse pan, zoom, draw, select & resize handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || isSpacePressed || activeTool === "hand") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return;

    const { x, y } = toWorldPoint(e.clientX, e.clientY);

    // SELECTION & RESIZE INTERACTION
    if (activeTool === "selection") {
      const selected = elements.find((el) => el.id === selectedId);

      // Check if clicking handle or body of currently selected element
      if (selected) {
        const handle = getHitResizeHandle({ x, y }, selected, 12 / (zoom / 100));
        if (handle) {
          setSelectionDrag({
            handle,
            startPoint: { x, y },
            initialElement: JSON.parse(JSON.stringify(selected)),
          });
          return;
        }
      }

      // Check if clicking another element (top-most first)
      const hit = [...elements].reverse().find((el) => isPointInsideElement({ x, y }, el, 8));
      if (hit) {
        setSelectedId(hit.id);
        const handle = getHitResizeHandle({ x, y }, hit, 12 / (zoom / 100)) || "inside";
        setSelectionDrag({
          handle,
          startPoint: { x, y },
          initialElement: JSON.parse(JSON.stringify(hit)),
        });
        return;
      }

      // Clicked on empty canvas -> deselect
      setSelectedId(null);
      return;
    }

    // ERASER
    if (activeTool === "eraser") {
      setIsErasing(true);
      eraseAt(x, y);
      return;
    }

    // TEXT TOOL
    if (activeTool === "text") {
      if (textEditing && textEditing.text.trim()) {
        commitText(textEditing);
      }
      setTextEditing({
        worldX: x,
        worldY: y,
        screenX: e.clientX,
        screenY: e.clientY,
        text: "",
      });
      return;
    }

    // DRAWING NEW SHAPES
    setIsDrawing(true);
    setSelectedId(null);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (activeTool === "rectangle" || activeTool === "diamond" || activeTool === "ellipse") {
      setCurrentElement({
        id,
        type: activeTool,
        x,
        y,
        width: 0,
        height: 0,
        ...(activeTool === "rectangle" ? { borderRadius: 12 } : {}),
        strokeColor: "#A3A3A3",
        backgroundColor: "transparent",
        strokeWidth: 2,
        strokeStyle: "solid",
        opacity: 1,
      });
    } else if (activeTool === "arrow" || activeTool === "line") {
      setCurrentElement({
        id,
        type: activeTool,
        x,
        y,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        width: 0,
        height: 0,
        strokeColor: "#A3A3A3",
        backgroundColor: "transparent",
        strokeWidth: 2,
        strokeStyle: "solid",
        opacity: 1,
      });
    } else if (activeTool === "freedraw") {
      setCurrentElement({
        id,
        type: "freedraw",
        x,
        y,
        width: 0,
        height: 0,
        points: [{ x, y }],
        strokeColor: "#A3A3A3",
        backgroundColor: "transparent",
        strokeWidth: 2,
        strokeStyle: "solid",
        opacity: 1,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    const { x, y } = toWorldPoint(e.clientX, e.clientY);

    // DRAGGING / RESIZING SELECTED ELEMENT
    if (selectionDrag && selectedId) {
      const { handle, startPoint, initialElement: init } = selectionDrag;
      const dx = x - startPoint.x;
      const dy = y - startPoint.y;

      let updated: CanvasElement = { ...init };

      if (handle === "inside") {
        if (init.type === "arrow" || init.type === "line") {
          updated = {
            ...init,
            startX: init.startX + dx,
            startY: init.startY + dy,
            endX: init.endX + dx,
            endY: init.endY + dy,
          };
        } else if (init.type === "freedraw") {
          updated = {
            ...init,
            points: init.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
          };
        } else {
          updated = {
            ...init,
            x: init.x + dx,
            y: init.y + dy,
          };
        }
      } else if (handle === "start" && (init.type === "arrow" || init.type === "line")) {
        updated = {
          ...init,
          startX: init.startX + dx,
          startY: init.startY + dy,
        };
      } else if (handle === "end" && (init.type === "arrow" || init.type === "line")) {
        updated = {
          ...init,
          endX: init.endX + dx,
          endY: init.endY + dy,
        };
      } else {
        // Corner resize handles for rectangle, diamond, ellipse, image
        let newX = init.x;
        let newY = init.y;
        let newW = init.width;
        let newH = init.height;

        if (handle === "se") {
          newW = init.width + dx;
          newH = init.height + dy;
        } else if (handle === "nw") {
          newX = init.x + dx;
          newY = init.y + dy;
          newW = init.width - dx;
          newH = init.height - dy;
        } else if (handle === "ne") {
          newY = init.y + dy;
          newW = init.width + dx;
          newH = init.height - dy;
        } else if (handle === "sw") {
          newX = init.x + dx;
          newW = init.width - dx;
          newH = init.height + dy;
        }

        if (init.type === "text") {
          const newSize = Math.max(12, Math.round(init.fontSize * (1 + dy / 100)));
          updated = { ...init, fontSize: newSize };
        } else {
          updated = {
            ...init,
            x: newX,
            y: newY,
            width: newW,
            height: newH,
          };
        }
      }

      setElements((prev) => prev.map((el) => (el.id === selectedId ? updated : el)));
      return;
    }

    // UPDATE HOVER CURSOR IN SELECTION MODE
    if (activeTool === "selection") {
      const selected = elements.find((el) => el.id === selectedId);
      if (selected) {
        const handle = getHitResizeHandle({ x, y }, selected, 12 / (zoom / 100));
        if (handle === "nw" || handle === "se") {
          setCursorStyle("nwse-resize");
        } else if (handle === "ne" || handle === "sw") {
          setCursorStyle("nesw-resize");
        } else if (handle === "start" || handle === "end" || handle === "inside") {
          setCursorStyle("move");
        } else {
          const hit = elements.some((el) => isPointInsideElement({ x, y }, el, 6));
          setCursorStyle(hit ? "move" : "default");
        }
      } else {
        const hit = elements.some((el) => isPointInsideElement({ x, y }, el, 6));
        setCursorStyle(hit ? "move" : "default");
      }
    }

    if (isErasing && activeTool === "eraser") {
      eraseAt(x, y);
      return;
    }

    // ACTIVE DRAWING
    if (isDrawing && currentElement) {
      if (
        currentElement.type === "rectangle" ||
        currentElement.type === "diamond" ||
        currentElement.type === "ellipse"
      ) {
        setCurrentElement({
          ...currentElement,
          width: x - currentElement.x,
          height: y - currentElement.y,
        });
      } else if (currentElement.type === "arrow" || currentElement.type === "line") {
        setCurrentElement({
          ...currentElement,
          endX: x,
          endY: y,
          width: x - currentElement.startX,
          height: y - currentElement.startY,
        });
      } else if (currentElement.type === "freedraw") {
        setCurrentElement({
          ...currentElement,
          points: [...currentElement.points, { x, y }],
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }

    if (isErasing) {
      setIsErasing(false);
    }

    // Complete selection drag/resize
    if (selectionDrag) {
      setSelectionDrag(null);
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), elements]);
      setHistoryIndex((prev) => prev + 1);


      return;
    }

    // Complete shape drawing
    if (isDrawing && currentElement) {
      setIsDrawing(false);
      const newElements = [...elements, currentElement];
      setElements(newElements);
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), newElements]);
      setHistoryIndex((prev) => prev + 1);



      setCurrentElement(null);
      setActiveTool("selection");
      setSelectedId(currentElement.id);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((prev) => Math.min(Math.max(Math.round(prev * zoomFactor), 10), 500));
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Primary tools with alphabet shortcut badges matching requested mapping
  const tools = [
    { id: "hand" as ToolType, icon: <HandIcon className="w-[18px] h-[18px]" />, label: "Hand (panning tool)", key: "1" },
    { id: "selection" as ToolType, icon: <PointerIcon className="w-[18px] h-[18px]" />, label: "Selection", key: "A" },
    { id: "rectangle" as ToolType, icon: <RectangleIcon className="w-[18px] h-[18px]" />, label: "Rectangle", key: "S" },
    { id: "diamond" as ToolType, icon: <DiamondIcon className="w-[18px] h-[18px]" />, label: "Diamond", key: "D" },
    { id: "ellipse" as ToolType, icon: <CircleIcon className="w-[18px] h-[18px]" />, label: "Ellipse", key: "F" },
    { id: "arrow" as ToolType, icon: <ArrowIcon className="w-[18px] h-[18px]" />, label: "Arrow", key: "J" },
    { id: "line" as ToolType, icon: <LineIcon className="w-[18px] h-[18px]" />, label: "Line", key: "K" },
    { id: "freedraw" as ToolType, icon: <PencilIcon className="w-[18px] h-[18px]" />, label: "Draw", key: "L" },
    { id: "text" as ToolType, icon: <TextIcon className="w-[18px] h-[18px]" />, label: "Text", key: "N" },
    { id: "image" as ToolType, icon: <ImageIcon className="w-[18px] h-[18px]" />, label: "Insert image", key: "C" },
    { id: "eraser" as ToolType, icon: <EraserIcon className="w-[18px] h-[18px]" />, label: "Eraser", key: "0" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#121212] font-sans">
      <div aria-live="polite" className="absolute bottom-4 left-4 z-40 max-w-sm rounded-lg bg-[#232329] px-3 py-2 text-xs text-white">{status}</div>
      {!ready && <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#121212] text-white"><p>{status}</p><button type="button" onClick={() => window.location.reload()} className="rounded-lg border px-4 py-2">Retry</button></div>}
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Inline Text Input Overlay */}
      {textEditing && (
        <textarea
          autoFocus
          rows={1}
          value={textEditing.text}
          placeholder="Type here..."
          onChange={(e) => setTextEditing({ ...textEditing, text: e.target.value })}
          onBlur={() => commitText(textEditing)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commitText(textEditing);
            } else if (e.key === "Escape") {
              setTextEditing(null);
            }
          }}
          className="fixed z-50 bg-[#1c1c24]/90 text-[#A3A3A3] font-sans text-[20px] outline-none border border-[#533afd] rounded px-2 py-1 shadow-2xl backdrop-blur-sm resize-none"
          style={{
            left: `${textEditing.screenX}px`,
            top: `${textEditing.screenY}px`,
            minWidth: "120px",
          }}
        />
      )}

      {/* Interactive Fullscreen Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          cursor:
            isDragging || isSpacePressed || activeTool === "hand"
              ? "grab"
              : activeTool === "selection"
              ? cursorStyle
              : activeTool === "text"
              ? "text"
              : activeTool === "eraser"
              ? "crosshair"
              : "crosshair",
        }}
        className="absolute inset-0 block w-full h-full"
      />

      {/* TOP BAR / NAVIGATION LAYER */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-3.5">
        {/* Top-Left: Menu Button */}
        <div className="pointer-events-auto relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Main menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#232329] text-[#ced2db] transition-colors hover:bg-[#2d2d38] hover:text-white active:scale-95 shadow-sm border border-[#2e2e38]"
          >
            <MenuIcon className="w-4 h-4" />
          </button>

          {/* Hamburger Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute left-0 top-11 z-50 w-56 rounded-xl bg-[#232329] p-1.5 shadow-2xl border border-[#32323e] text-xs text-[#ced2db] animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {roomId ? `Room: ${roomId}` : "Achilles Canvas"}
              </div>
              <div className="h-px bg-[#32323e] my-1" />
              <button
                type="button"
                onClick={() => {
                  handleResetView();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#2d2d38] hover:text-white transition-colors"
              >
                <span>Reset view</span>
                <span className="text-neutral-500 font-mono text-[10px]">Shift+1</span>
              </button>
            </div>
          )}
        </div>

        {/* Top-Center: Main Tool Palette (Lock & Three Dots removed) */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div className="flex items-center gap-1 rounded-xl bg-[#232329] p-1 shadow-lg border border-[#2e2e38]">
            {tools.map((tool) => {
              const isSelected = activeTool === tool.id;

              return (
                <button
                  key={tool.id}
                  type="button"
                  title={tool.label}
                  onClick={() => {
                    if (tool.id === "image") {
                      setActiveTool("image");
                      fileInputRef.current?.click();
                    } else {
                      setActiveTool(tool.id);
                      if (tool.id !== "selection") {
                        setSelectedId(null);
                      }
                    }
                  }}
                  className={`group relative flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                    isSelected
                      ? "bg-[#403b6e] text-[#a8a5ff]"
                      : "text-[#ced2db] hover:bg-[#2e2e38] hover:text-white"
                  }`}
                >
                  {tool.icon}
                  {tool.key && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[9px] font-mono leading-none ${
                        isSelected ? "text-[#a8a5ff]/80" : "text-neutral-500 group-hover:text-neutral-300"
                      }`}
                    >
                      {tool.key}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top-Right: Share Collaboration Button (Library Sidebar removed) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            title="Live collaboration / Share"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6965db] text-white hover:bg-[#7874ea] active:scale-95 transition-all shadow-md"
          >
            <ShareIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* BOTTOM CONTROLS LAYER */}
      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-3.5">
        {/* Bottom-Left: Zoom & Undo/Redo */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex h-9 items-center rounded-lg bg-[#232329] px-1 border border-[#2e2e38] text-xs text-[#ced2db]">
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom out"
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#2e2e38] hover:text-white transition-colors"
            >
              <MinusIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              title="Reset zoom"
              className="px-2 font-mono text-[11px] font-medium hover:text-white transition-colors"
            >
              {zoom}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom in"
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#2e2e38] hover:text-white transition-colors"
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex h-9 items-center rounded-lg bg-[#232329] p-1 border border-[#2e2e38] text-[#ced2db]">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              title="Undo (Ctrl+Z)"
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#2e2e38] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <UndoIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#2e2e38] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <RedoIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>

      {/* Share / Live Collaboration Modal with 1-Click Copy */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#232329] p-6 shadow-2xl border border-[#363644] text-[#ced2db]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Share canvas</h2>
              <button
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  setCopied(false);
                }}
                className="text-neutral-400 hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Anyone with this link can view and collaborate live in this canvas session.
            </p>
            <div className="rounded-xl bg-[#1a1a20] p-3 border border-[#32323e] flex items-center justify-between gap-2 mb-4 font-mono text-xs text-neutral-300 truncate">
              <span className="truncate">{typeof window !== "undefined" ? window.location.href : ""}</span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-sans font-medium transition-colors shrink-0 ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-[#6965db] text-white hover:bg-[#7874ea]"
                }`}
              >
                {copied ? "Copied! ✓" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
