"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import getStroke from "perfect-freehand";
import type { CanvasTool, BrushSize } from "./CanvasToolbar";

export interface CanvasPath {
  points: [number, number][];
  color: string;
  size: number;
  tool: "pen" | "text" | "eraser";
  text?: string; // for text tool
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

const BRUSH_PX: Record<BrushSize, number> = { S: 4, M: 8, L: 16 };

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

function drawPaths(
  ctx: CanvasRenderingContext2D,
  paths: CanvasPath[],
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h);

  for (const path of paths) {
    // Text elements
    if (path.tool === "text" && path.text && path.points.length >= 1) {
      ctx.font = `bold ${path.size}px sans-serif`;
      ctx.fillStyle = path.color;
      ctx.fillText(path.text, path.points[0][0], path.points[0][1]);
      continue;
    }

    // Pen / eraser strokes
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

  // Text input state
  const [textInput, setTextInput] = useState<{
    x: number;
    y: number;
    value: string;
  } | null>(null);

  // Resize observer
  useEffect(() => {
    function resize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          w: Math.floor(rect.width),
          h: Math.floor(rect.height),
        });
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Redraw when paths or dimensions change
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
      let clientX: number, clientY: number;

      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("changedTouches" in e && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return [0, 0];
      }

      return [
        (clientX - rect.left) / zoom,
        (clientY - rect.top) / zoom,
      ];
    },
    [zoom]
  );

  // ── POINTER DOWN ──
  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // Hand tool — do nothing
      if (activeTool === "hand" || activeTool === "image" || activeTool === "screenshot") return;

      // Text tool — open inline input
      if (activeTool === "text") {
        const pos = getPos(e);
        setTextInput({ x: pos[0], y: pos[1], value: "" });
        return;
      }

      // Pen or Eraser — start drawing
      e.preventDefault();
      setDrawing(true);
      currentPoints.current = [getPos(e)];
    },
    [activeTool, getPos]
  );

  // ── POINTER MOVE ──
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

      // Draw stroke in progress
      if (currentPoints.current.length >= 2) {
        const size = BRUSH_PX[brushSize];
        const stroke = getStroke(currentPoints.current, {
          size,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        });
        const svgPath = getSvgPathFromStroke(stroke);
        if (svgPath) {
          const path2d = new Path2D(svgPath);
          ctx.fillStyle = activeTool === "pen" ? color : "#FFFFFF";
          ctx.fill(path2d);
        }
      }
    },
    [drawing, getPos, paths, color, brushSize, dimensions, isPrivate, role, activeTool]
  );

  // ── POINTER UP ──
  const handleEnd = useCallback(() => {
    if (!drawing) return;
    setDrawing(false);
    if (currentPoints.current.length >= 2) {
      onPathAdd({
        points: [...currentPoints.current],
        color: activeTool === "eraser" ? "#FFFFFF" : color,
        size: activeTool === "eraser" ? BRUSH_PX[brushSize] * 3 : BRUSH_PX[brushSize],
        tool: activeTool === "eraser" ? "eraser" : "pen",
      });
    }
    currentPoints.current = [];
  }, [drawing, color, brushSize, onPathAdd]);

  // ── SUBMIT TEXT ──
  const submitText = useCallback(() => {
    if (!textInput || !textInput.value.trim()) {
      setTextInput(null);
      return;
    }
    onPathAdd({
      points: [[textInput.x, textInput.y]],
      color,
      size: BRUSH_PX[brushSize] * 3,
      tool: "text",
      text: textInput.value.trim(),
    });
    setTextInput(null);
  }, [textInput, color, brushSize, onPathAdd]);

  const cursorStyle =
    activeTool === "hand"
      ? "grab"
      : activeTool === "text"
      ? "text"
      : "crosshair";

  return (
    <div
      ref={containerRef}
      className="flex-1 relative bg-white rounded-xl shadow-lg ring-1 ring-slate-200/60 overflow-hidden"
      style={{ cursor: cursorStyle }}
    >
      {/* Private mode overlay */}
      {isPrivate && role === "STUDENT" && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/80">
          <div className="text-center">
            <p className="text-slate-400 text-lg font-bold">Private Mode</p>
            <p className="text-slate-300 text-sm mt-1">
              Teacher is drawing privately
            </p>
          </div>
        </div>
      )}

      {/* The canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
          width: dimensions.w,
          height: dimensions.h,
        }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {/* Inline text input — appears where user clicked */}
      {textInput && (
        <div
          className="absolute z-30"
          style={{
            left: textInput.x * zoom,
            top: (textInput.y - BRUSH_PX[brushSize] * 1.5) * zoom,
          }}
        >
          <input
            autoFocus
            value={textInput.value}
            onChange={(e) =>
              setTextInput({ ...textInput, value: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") submitText();
              if (e.key === "Escape") setTextInput(null);
            }}
            onBlur={submitText}
            placeholder="Type here..."
            className="px-2 py-1 border-2 border-blue-500 rounded-lg text-base font-medium shadow-lg outline-none min-w-[150px]"
            style={{
              color,
              fontSize: BRUSH_PX[brushSize] * 3,
            }}
          />
        </div>
      )}
    </div>
  );
}
