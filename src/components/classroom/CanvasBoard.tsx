"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import getStroke from "perfect-freehand";
import type { CanvasTool, BrushSize } from "./CanvasToolbar";

export interface CanvasPath {
  points: [number, number][];
  color: string;
  size: number;
  tool: "pen" | "text" | "eraser";
}

type Props = {
  paths: CanvasPath[];
  onPathAdd: (path: CanvasPath) => void;
  onPathsReplace: (paths: CanvasPath[]) => void;
  activeTool: CanvasTool;
  color: string;
  brushSize: BrushSize;
  zoom: number;
  isPrivate: boolean;
  role: "TEACHER" | "STUDENT";
};

const BRUSH_PX: Record<BrushSize, number> = { S: 3, M: 6, L: 12 };

function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";
  const d: string[] = [];
  d.push(`M ${stroke[0][0].toFixed(2)} ${stroke[0][1].toFixed(2)}`);
  for (let i = 1; i < stroke.length; i++) {
    const [x, y] = stroke[i];
    d.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  d.push("Z");
  return d.join(" ");
}

function drawPaths(ctx: CanvasRenderingContext2D, paths: CanvasPath[], w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  for (const path of paths) {
    if (path.points.length < 2) continue;
    const stroke = getStroke(path.points, {
      size: path.size,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });
    const svgPath = getSvgPathFromStroke(stroke);
    if (!svgPath) continue;
    const path2d = new Path2D(svgPath);
    ctx.fillStyle = path.tool === "eraser" ? "#FFFFFF" : path.color;
    ctx.fill(path2d);
  }
}

export default function CanvasBoard({
  paths,
  onPathAdd,
  onPathsReplace,
  activeTool,
  color,
  brushSize,
  zoom,
  isPrivate,
  role,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const currentPoints = useRef<[number, number][]>([]);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

  // Resize
  useEffect(() => {
    function resize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ w: rect.width, h: rect.height });
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Redraw on paths/dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (isPrivate && role === "STUDENT") {
      ctx.clearRect(0, 0, dimensions.w, dimensions.h);
      return;
    }

    drawPaths(ctx, paths, dimensions.w, dimensions.h);
  }, [paths, dimensions, isPrivate, role]);

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent): [number, number] => {
      const canvas = canvasRef.current;
      if (!canvas) return [0, 0];
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      return [
        (clientX - rect.left) / zoom,
        (clientY - rect.top) / zoom,
      ];
    },
    [zoom]
  );

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (activeTool === "hand" || activeTool === "image" || activeTool === "screenshot") return;
      if (activeTool === "text") {
        const pos = getPos(e);
        const text = prompt("Enter text:");
        if (text) {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.font = `${BRUSH_PX[brushSize] * 4}px sans-serif`;
          ctx.fillStyle = color;
          ctx.fillText(text, pos[0], pos[1]);
          // Store as a single-point path with text marker
          onPathAdd({
            points: [pos],
            color,
            size: BRUSH_PX[brushSize] * 4,
            tool: "text",
          });
        }
        return;
      }
      e.preventDefault();
      setDrawing(true);
      currentPoints.current = [getPos(e)];
    },
    [activeTool, getPos, color, brushSize, onPathAdd]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing) return;
      e.preventDefault();
      const pos = getPos(e);
      currentPoints.current.push(pos);

      // Live preview
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (isPrivate && role === "STUDENT") return;

      drawPaths(ctx, paths, dimensions.w, dimensions.h);

      // Draw current stroke in progress
      if (currentPoints.current.length >= 2) {
        const stroke = getStroke(currentPoints.current, {
          size: BRUSH_PX[brushSize],
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        });
        const svgPath = getSvgPathFromStroke(stroke);
        if (svgPath) {
          const path2d = new Path2D(svgPath);
          ctx.fillStyle = color;
          ctx.fill(path2d);
        }
      }
    },
    [drawing, getPos, paths, color, brushSize, dimensions, isPrivate, role]
  );

  const handleEnd = useCallback(() => {
    if (!drawing) return;
    setDrawing(false);
    if (currentPoints.current.length >= 2) {
      onPathAdd({
        points: [...currentPoints.current],
        color,
        size: BRUSH_PX[brushSize],
        tool: "pen",
      });
    }
    currentPoints.current = [];
  }, [drawing, color, brushSize, onPathAdd]);

  return (
    <div
      ref={containerRef}
      className="flex-1 relative bg-white rounded-xl shadow-lg ring-1 ring-slate-200/60 overflow-hidden"
      style={{ cursor: activeTool === "hand" ? "grab" : activeTool === "text" ? "text" : "crosshair" }}
    >
      {isPrivate && role === "STUDENT" && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/80">
          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium">Private Mode</p>
            <p className="text-slate-300 text-xs mt-1">
              Teacher is drawing privately
            </p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
        style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
    </div>
  );
}
