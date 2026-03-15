"use client";

import Link from "next/link";
import { getCategoryConfig, cefrColors } from "@/lib/lessonHelpers";
import {
  ArrowLeft,
  Radio,
  Pause,
  Square,
  Wifi,
  WifiOff,
} from "lucide-react";

type SessionStatusBarProps = {
  lessonTitle: string;
  category: string;
  cefrLevel: string | null;
  sessionStatus: string;
  isConnected: boolean;
  role: "TEACHER" | "STUDENT";
  backUrl: string;
  onPause?: () => void;
  onResume?: () => void;
  onEnd?: () => void;
};

export default function SessionStatusBar({
  lessonTitle,
  category,
  cefrLevel,
  sessionStatus,
  isConnected,
  role,
  backUrl,
  onPause,
  onResume,
  onEnd,
}: SessionStatusBarProps) {
  const cat = getCategoryConfig(category);
  const cefr = cefrLevel ? cefrColors[cefrLevel] : null;

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    WAITING: { label: "Waiting", color: "bg-slate-100 text-slate-600", icon: <Radio size={12} /> },
    ACTIVE: { label: "Live", color: "bg-green-100 text-green-700", icon: <Radio size={12} className="animate-pulse" /> },
    PAUSED: { label: "Paused", color: "bg-amber-100 text-amber-700", icon: <Pause size={12} /> },
    ENDED: { label: "Ended", color: "bg-red-100 text-red-600", icon: <Square size={12} /> },
  };

  const status = statusConfig[sessionStatus] || statusConfig.WAITING;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Link
          href={backUrl}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>

        <div className="h-5 w-px bg-slate-200" />

        <div className="flex items-center gap-2.5">
          <span className="text-xl">{cat.icon}</span>
          <h1 className="font-bold text-slate-800 text-sm">{lessonTitle}</h1>
          {cefr && (
            <span
              className={`${cefr.bg} ${cefr.text} text-[10px] font-bold px-1.5 py-0.5 rounded-full`}
            >
              {cefrLevel}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <Wifi size={14} className="text-green-500" />
          ) : (
            <WifiOff size={14} className="text-red-400" />
          )}
          <span className="text-[11px] text-slate-400">
            {isConnected ? "Connected" : "Reconnecting..."}
          </span>
        </div>

        {/* Session status pill */}
        <span
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.color}`}
        >
          {status.icon}
          {status.label}
        </span>

        {/* Teacher controls */}
        {role === "TEACHER" && sessionStatus !== "ENDED" && (
          <div className="flex items-center gap-1.5 ml-2">
            {sessionStatus === "ACTIVE" ? (
              <button
                onClick={onPause}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <Pause size={12} />
                Pause
              </button>
            ) : sessionStatus === "PAUSED" ? (
              <button
                onClick={onResume}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
              >
                <Radio size={12} />
                Resume
              </button>
            ) : null}
            <button
              onClick={onEnd}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
            >
              <Square size={12} />
              End
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
