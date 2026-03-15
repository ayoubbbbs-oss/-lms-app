"use client";

import { getCategoryConfig, cefrColors } from "@/lib/lessonHelpers";
import { Play, Eye, UserPlus, Trash2 } from "lucide-react";

type LessonCardProps = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  cefrLevel: string | null;
  contentType: string | null;
  assignmentCount?: number;
  onLaunch?: (id: string) => void;
  onPreview?: (id: string) => void;
  onAssign?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: ("launch" | "preview" | "assign" | "delete")[];
};

export default function LessonCard({
  id,
  title,
  description,
  category,
  cefrLevel,
  contentType,
  assignmentCount,
  onLaunch,
  onPreview,
  onAssign,
  onDelete,
  showActions = ["launch", "preview", "assign"],
}: LessonCardProps) {
  const cat = getCategoryConfig(category);
  const cefr = cefrLevel ? cefrColors[cefrLevel] : null;

  return (
    <div
      className={`lesson-card rounded-2xl border-2 ${cat.border} ${cat.bg} p-5 flex flex-col justify-between shadow-sm`}
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{cat.icon}</span>
          <div className="flex items-center gap-1.5">
            {cefr && (
              <span
                className={`${cefr.bg} ${cefr.text} text-[11px] font-bold px-2 py-0.5 rounded-full`}
              >
                {cefrLevel}
              </span>
            )}
            {contentType && (
              <span className="bg-white/80 text-slate-500 text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-200">
                {contentType}
              </span>
            )}
          </div>
        </div>

        <h3 className={`font-bold text-base ${cat.color} mb-1.5 leading-snug`}>
          {title}
        </h3>

        {description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-1">
            {description}
          </p>
        )}

        <p className={`text-xs font-medium ${cat.color} opacity-70 mb-3`}>
          {cat.label}
        </p>
      </div>

      {/* Footer */}
      <div>
        {assignmentCount !== undefined && (
          <p className="text-[11px] text-slate-400 mb-2.5">
            {assignmentCount} student{assignmentCount !== 1 ? "s" : ""} assigned
          </p>
        )}

        <div className="flex items-center gap-1.5">
          {showActions.includes("launch") && onLaunch && (
            <button
              onClick={() => onLaunch(id)}
              className="flex items-center gap-1 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play size={13} />
              Launch
            </button>
          )}
          {showActions.includes("preview") && onPreview && (
            <button
              onClick={() => onPreview(id)}
              className="flex items-center gap-1 bg-white text-slate-600 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Eye size={13} />
              Preview
            </button>
          )}
          {showActions.includes("assign") && onAssign && (
            <button
              onClick={() => onAssign(id)}
              className="flex items-center gap-1 bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus size={13} />
              Assign
            </button>
          )}
          {showActions.includes("delete") && onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors ml-auto"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
