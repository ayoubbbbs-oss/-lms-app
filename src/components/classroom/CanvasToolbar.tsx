"use client";

import {
  Hand,
  Pen,
  Type,
  ImagePlus,
  Camera,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react";

export type CanvasTool = "hand" | "pen" | "text" | "eraser" | "image" | "screenshot";
export type BrushSize = "S" | "M" | "L";

const BRUSH_SIZES: Record<BrushSize, number> = { S: 2, M: 5, L: 10 };

type Props = {
  role: "TEACHER" | "STUDENT";
  activeTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  color: string;
  onColorChange: (color: string) => void;
  brushSize: BrushSize;
  onBrushSizeChange: (size: BrushSize) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isPrivate: boolean;
  onPrivateToggle: () => void;
};

const COLORS = [
  "#3B9EDA",
  "#EF4444",
  "#22C55E",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#1e293b",
  "#FFFFFF",
];

export default function CanvasToolbar({
  role,
  activeTool,
  onToolChange,
  color,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isPrivate,
  onPrivateToggle,
}: Props) {
  const isTeacher = role === "TEACHER";

  const tools: { key: CanvasTool; icon: React.ReactNode; label: string; teacherOnly: boolean }[] = [
    { key: "hand", icon: <Hand size={28} strokeWidth={2.5} />, label: "Hand", teacherOnly: false },
    { key: "pen", icon: <Pen size={28} strokeWidth={2.5} />, label: "Pen", teacherOnly: false },
    { key: "text", icon: <Type size={28} strokeWidth={2.5} />, label: "Text", teacherOnly: false },
    { key: "eraser", icon: <Eraser size={28} strokeWidth={2.5} />, label: "Eraser", teacherOnly: false },
    { key: "image", icon: <ImagePlus size={28} strokeWidth={2.5} />, label: "Image", teacherOnly: true },
    { key: "screenshot", icon: <Camera size={28} strokeWidth={2.5} />, label: "Screenshot", teacherOnly: true },
  ];

  const visibleTools = tools.filter((t) => isTeacher || !t.teacherOnly);

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 p-2.5">
      {/* Tools — CHUNKY */}
      {visibleTools.map((tool) => (
        <button
          key={tool.key}
          onClick={() => onToolChange(tool.key)}
          title={tool.label}
          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-150 ${
            activeTool === tool.key
              ? "bg-sky-600 text-white shadow-md"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          }`}
        >
          {tool.icon}
        </button>
      ))}

      <div className="w-full h-px bg-slate-200 my-1.5" />

      {/* Color picker — BIG */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative group">
          <button
            className="w-10 h-10 rounded-full ring-3 ring-white shadow-lg"
            style={{ backgroundColor: color }}
            title="Color"
          />
          <div className="absolute left-14 top-0 hidden group-hover:flex bg-white rounded-xl shadow-2xl ring-1 ring-slate-200 p-3 gap-2 flex-wrap w-[110px]">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className={`w-9 h-9 rounded-full ring-2 transition-transform hover:scale-110 ${
                  c === color ? "ring-sky-500 scale-110" : "ring-slate-200"
                } ${c === "#FFFFFF" ? "ring-slate-300" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Brush size — BIG */}
      <div className="flex flex-col items-center gap-1 py-1">
        {(["S", "M", "L"] as BrushSize[]).map((s) => (
          <button
            key={s}
            onClick={() => onBrushSizeChange(s)}
            title={`Brush ${s}`}
            className={`w-14 h-9 rounded-lg text-sm font-extrabold transition-all duration-150 ${
              brushSize === s
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="w-full h-px bg-slate-200 my-1.5" />

      {/* Undo / Redo — BIG */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
        className="w-14 h-14 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
      >
        <Undo2 size={24} strokeWidth={2.5} />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo"
        className="w-14 h-14 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
      >
        <Redo2 size={24} strokeWidth={2.5} />
      </button>

      {/* Private toggle — BIG */}
      {isTeacher && (
        <>
          <div className="w-full h-px bg-slate-200 my-1.5" />
          <label className="flex flex-col items-center gap-1 cursor-pointer py-1" title="Private mode">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={onPrivateToggle}
              className="w-5 h-5 text-sky-600 rounded border-slate-300 focus:ring-sky-400"
            />
            <span className="text-xs text-slate-500 font-bold">Private</span>
          </label>
        </>
      )}
    </div>
  );
}

export { BRUSH_SIZES };
