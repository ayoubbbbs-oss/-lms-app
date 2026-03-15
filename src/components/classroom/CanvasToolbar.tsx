"use client";

import {
  Hand,
  Pen,
  Type,
  ImagePlus,
  Camera,
  Undo2,
  Redo2,
} from "lucide-react";

export type CanvasTool = "hand" | "pen" | "text" | "image" | "screenshot";
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
    { key: "hand", icon: <Hand size={16} />, label: "Hand", teacherOnly: false },
    { key: "pen", icon: <Pen size={16} />, label: "Pen", teacherOnly: false },
    { key: "text", icon: <Type size={16} />, label: "Text", teacherOnly: false },
    { key: "image", icon: <ImagePlus size={16} />, label: "Image", teacherOnly: true },
    { key: "screenshot", icon: <Camera size={16} />, label: "Screenshot", teacherOnly: true },
  ];

  const visibleTools = tools.filter((t) => isTeacher || !t.teacherOnly);

  return (
    <div className="fixed left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 p-1.5">
      {/* Tools */}
      {visibleTools.map((tool) => (
        <button
          key={tool.key}
          onClick={() => onToolChange(tool.key)}
          title={tool.label}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 ${
            activeTool === tool.key
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          }`}
        >
          {tool.icon}
        </button>
      ))}

      <div className="w-full h-px bg-slate-200 my-1" />

      {/* Color picker */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative group">
          <button
            className="w-7 h-7 rounded-full ring-2 ring-white shadow-md"
            style={{ backgroundColor: color }}
            title="Color"
          />
          <div className="absolute left-11 top-0 hidden group-hover:flex bg-white rounded-xl shadow-xl ring-1 ring-slate-200 p-2 gap-1 flex-wrap w-[76px]">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className={`w-6 h-6 rounded-full ring-2 transition-transform hover:scale-110 ${
                  c === color ? "ring-sky-500 scale-110" : "ring-slate-200"
                } ${c === "#FFFFFF" ? "ring-slate-300" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Brush size */}
      <div className="flex flex-col items-center gap-0.5 py-1">
        {(["S", "M", "L"] as BrushSize[]).map((s) => (
          <button
            key={s}
            onClick={() => onBrushSizeChange(s)}
            title={`Brush ${s}`}
            className={`w-9 h-6 rounded-md text-[10px] font-bold transition-all duration-150 ${
              brushSize === s
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="w-full h-px bg-slate-200 my-1" />

      {/* Undo / Redo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
      >
        <Undo2 size={15} />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
      >
        <Redo2 size={15} />
      </button>

      {/* Private toggle (teacher only) */}
      {isTeacher && (
        <>
          <div className="w-full h-px bg-slate-200 my-1" />
          <label className="flex flex-col items-center gap-0.5 cursor-pointer py-1" title="Private mode">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={onPrivateToggle}
              className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-400"
            />
            <span className="text-[9px] text-slate-400 font-medium">Private</span>
          </label>
        </>
      )}
    </div>
  );
}

export { BRUSH_SIZES };
