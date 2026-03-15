"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import CanvasBoard, { type CanvasPath } from "@/components/classroom/CanvasBoard";
import CanvasToolbar, {
  type CanvasTool,
  type BrushSize,
} from "@/components/classroom/CanvasToolbar";
import ClassroomChat from "@/components/classroom/ClassroomChat";
import { X, ZoomIn, ZoomOut, Trash2 } from "lucide-react";
import Link from "next/link";

type Props = {
  lessonId: string;
  lessonTitle: string;
  role: "TEACHER" | "STUDENT";
  userName: string;
};

type CanvasBroadcast =
  | { type: "draw"; paths: CanvasPath[] }
  | { type: "clear" }
  | { type: "private"; value: boolean };

export default function CanvasClient({
  lessonId,
  lessonTitle,
  role,
  userName,
}: Props) {
  const [paths, setPaths] = useState<CanvasPath[]>([]);
  const [undoStack, setUndoStack] = useState<CanvasPath[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasPath[][]>([]);
  const [activeTool, setActiveTool] = useState<CanvasTool>("pen");
  const [color, setColor] = useState("#3B9EDA");
  const [brushSize, setBrushSize] = useState<BrushSize>("M");
  const [zoom, setZoom] = useState(1);
  const [isPrivate, setIsPrivate] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ── Real-time (UNTOUCHED) ──
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(`canvas-${lessonId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "canvas:update" }, ({ payload }) => {
        const data = payload as CanvasBroadcast;
        if (data.type === "draw") {
          setPaths(data.paths);
        } else if (data.type === "clear") {
          setPaths([]);
        } else if (data.type === "private") {
          setIsPrivate(data.value);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
    };
  }, [lessonId]);

  const broadcast = useCallback(
    (data: CanvasBroadcast) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "canvas:update",
        payload: data,
      });
    },
    []
  );

  const handlePathAdd = useCallback(
    (path: CanvasPath) => {
      setPaths((prev) => {
        const next = [...prev, path];
        setUndoStack((u) => [...u, prev]);
        setRedoStack([]);
        broadcast({ type: "draw", paths: next });
        return next;
      });
    },
    [broadcast]
  );

  const handlePathsReplace = useCallback(
    (newPaths: CanvasPath[]) => {
      setPaths(newPaths);
      broadcast({ type: "draw", paths: newPaths });
    },
    [broadcast]
  );

  const handleUndo = useCallback(() => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const prev = stack[stack.length - 1];
      setRedoStack((r) => [...r, paths]);
      setPaths(prev);
      broadcast({ type: "draw", paths: prev });
      return stack.slice(0, -1);
    });
  }, [paths, broadcast]);

  const handleRedo = useCallback(() => {
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      const next = stack[stack.length - 1];
      setUndoStack((u) => [...u, paths]);
      setPaths(next);
      broadcast({ type: "draw", paths: next });
      return stack.slice(0, -1);
    });
  }, [paths, broadcast]);

  const handleClear = useCallback(() => {
    if (!confirm("Are you sure you want to clear the entire canvas?")) return;
    setUndoStack((u) => [...u, paths]);
    setRedoStack([]);
    setPaths([]);
    broadcast({ type: "clear" });
  }, [paths, broadcast]);

  const handlePrivateToggle = useCallback(() => {
    setIsPrivate((prev) => {
      const next = !prev;
      broadcast({ type: "private", value: next });
      return next;
    });
  }, [broadcast]);
  // ── End real-time ──

  return (
    <div className="h-screen bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-[1300px] h-[92vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-white">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-4 h-11 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {role === "TEACHER" && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <Trash2 size={12} />
                Clean
              </button>
            )}
            <h1 className="text-sm font-semibold text-slate-700">{lessonTitle}</h1>
            <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded font-bold uppercase">
              Canvas
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-1.5 py-1">
              <button
                onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-700 rounded transition-colors"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-[11px] font-semibold text-slate-600 w-10 text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-700 rounded transition-colors"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {role === "TEACHER" && (
              <Link
                href={`/classroom/${lessonId}`}
                className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
              >
                <X size={12} />
                Close
              </Link>
            )}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex overflow-hidden bg-slate-100">
          <CanvasToolbar
            role={role}
            activeTool={activeTool}
            onToolChange={setActiveTool}
            color={color}
            onColorChange={setColor}
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            isPrivate={isPrivate}
            onPrivateToggle={handlePrivateToggle}
          />

          <div className="flex-1 ml-14 p-2">
            <CanvasBoard
              paths={paths}
              onPathAdd={handlePathAdd}
              onPathsReplace={handlePathsReplace}
              activeTool={activeTool}
              color={color}
              brushSize={brushSize}
              zoom={zoom}
              isPrivate={isPrivate}
              role={role}
            />
          </div>
        </div>
      </div>

      <ClassroomChat
        lessonId={lessonId}
        userName={userName}
        userRole={role}
      />
    </div>
  );
}
