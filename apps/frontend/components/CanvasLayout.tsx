"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MenuIcon,
  LockIcon,
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
  MoreDotsIcon,
  ShareIcon,
  SidebarIcon,
  UndoIcon,
  RedoIcon,
  PlusIcon,
  MinusIcon,
} from "./CanvasIcons";

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

interface CanvasLayoutProps {
  roomId?: string;
}

export default function CanvasLayout({ roomId }: CanvasLayoutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Layout & UI State
  const [activeTool, setActiveTool] = useState<ToolType>("selection");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

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
  }, [zoom, pan]);

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

    ctx.restore();
  }, [zoom, pan]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Keyboard navigation & tool shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space" && !isSpacePressed) {
        setIsSpacePressed(true);
      } else if (e.key === "1" || e.key === "v" || e.key === "V") {
        setActiveTool("selection");
      } else if (e.key === "2" || e.key === "r" || e.key === "R") {
        setActiveTool("rectangle");
      } else if (e.key === "3" || e.key === "d" || e.key === "D") {
        setActiveTool("diamond");
      } else if (e.key === "4" || e.key === "e" || e.key === "c" || e.key === "O") {
        setActiveTool("ellipse");
      } else if (e.key === "5" || e.key === "a" || e.key === "A") {
        setActiveTool("arrow");
      } else if (e.key === "6" || e.key === "l" || e.key === "L") {
        setActiveTool("line");
      } else if (e.key === "7" || e.key === "p" || e.key === "P") {
        setActiveTool("freedraw");
      } else if (e.key === "8" || e.key === "t" || e.key === "T") {
        setActiveTool("text");
      } else if (e.key === "9") {
        setActiveTool("image");
      } else if (e.key === "0" || e.key === "Delete" || e.key === "Backspace") {
        setActiveTool("eraser");
      } else if (e.key === "h" || e.key === "H") {
        setActiveTool("hand");
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
  }, [isSpacePressed]);

  // Mouse pan & zoom handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || isSpacePressed || activeTool === "hand") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 500));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 10));
  };

  const handleResetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(100);
  };

  // List of primary tools matching Excalidraw UI
  const tools = [
    { id: "lock" as ToolType, icon: <LockIcon className="w-[18px] h-[18px]" locked={isLocked} />, label: "Keep tool selected", key: "" },
    { id: "hand" as ToolType, icon: <HandIcon className="w-[18px] h-[18px]" />, label: "Hand (panning tool)", key: "H" },
    { id: "selection" as ToolType, icon: <PointerIcon className="w-[18px] h-[18px]" />, label: "Selection", key: "1" },
    { id: "rectangle" as ToolType, icon: <RectangleIcon className="w-[18px] h-[18px]" />, label: "Rectangle", key: "2" },
    { id: "diamond" as ToolType, icon: <DiamondIcon className="w-[18px] h-[18px]" />, label: "Diamond", key: "3" },
    { id: "ellipse" as ToolType, icon: <CircleIcon className="w-[18px] h-[18px]" />, label: "Ellipse", key: "4" },
    { id: "arrow" as ToolType, icon: <ArrowIcon className="w-[18px] h-[18px]" />, label: "Arrow", key: "5" },
    { id: "line" as ToolType, icon: <LineIcon className="w-[18px] h-[18px]" />, label: "Line", key: "6" },
    { id: "freedraw" as ToolType, icon: <PencilIcon className="w-[18px] h-[18px]" />, label: "Draw", key: "7" },
    { id: "text" as ToolType, icon: <TextIcon className="w-[18px] h-[18px]" />, label: "Text", key: "8" },
    { id: "image" as ToolType, icon: <ImageIcon className="w-[18px] h-[18px]" />, label: "Insert image", key: "9" },
    { id: "eraser" as ToolType, icon: <EraserIcon className="w-[18px] h-[18px]" />, label: "Eraser", key: "0" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#121212] font-sans">
      {/* Interactive Fullscreen Canvas Background */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`absolute inset-0 block w-full h-full ${
          isDragging || isSpacePressed || activeTool === "hand" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
        }`}
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

        {/* Top-Center: Main Tool Palette */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div className="flex items-center gap-1 rounded-xl bg-[#232329] p-1 shadow-lg border border-[#2e2e38]">
            {tools.map((tool) => {
              const isSelected = tool.id === "lock" ? isLocked : activeTool === tool.id;

              return (
                <button
                  key={tool.id}
                  type="button"
                  title={tool.label}
                  onClick={() => {
                    if (tool.id === "lock") {
                      setIsLocked(!isLocked);
                    } else {
                      setActiveTool(tool.id);
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

            {/* Separator */}
            <div className="h-5 w-px bg-[#363644] mx-0.5" />

            {/* More Options Button */}
            <button
              type="button"
              title="More options"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#ced2db] hover:bg-[#2e2e38] hover:text-white transition-colors"
            >
              <MoreDotsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top-Right: Actions (Share, Sidebar) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Share Collaboration Button */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            title="Live collaboration / Share"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6965db] text-white hover:bg-[#7874ea] active:scale-95 transition-all shadow-md"
          >
            <ShareIcon className="w-4 h-4" />
          </button>

          {/* Library / Sidebar Toggle */}
          <button
            type="button"
            title="Library"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#232329] text-[#ced2db] hover:bg-[#2d2d38] hover:text-white transition-colors border border-[#2e2e38]"
          >
            <SidebarIcon className="w-4 h-4" />
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
              title="Undo (Ctrl+Z)"
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#2e2e38] hover:text-white transition-colors"
            >
              <UndoIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Redo (Ctrl+Y)"
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#2e2e38] hover:text-white transition-colors"
            >
              <RedoIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>

      {/* Share / Live Collaboration Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#232329] p-6 shadow-2xl border border-[#363644] text-[#ced2db]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Live collaboration</h2>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-neutral-400 hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Invite people to collaborate live on your drawing with end-to-end encryption.
            </p>
            <div className="rounded-xl bg-[#1a1a20] p-3 border border-[#32323e] flex items-center justify-between gap-2 mb-4 font-mono text-xs text-neutral-300 truncate">
              <span className="truncate">{typeof window !== "undefined" ? window.location.href : ""}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="rounded-lg bg-[#6965db] px-3 py-1.5 text-xs font-sans font-medium text-white hover:bg-[#7874ea] shrink-0"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
