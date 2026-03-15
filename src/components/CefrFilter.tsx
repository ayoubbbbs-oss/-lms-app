"use client";

import { cefrLevels, cefrColors } from "@/lib/lessonHelpers";

export default function CefrFilter({
  selected,
  onChange,
}: {
  selected: string | null;
  onChange: (level: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-500 mr-1">CEFR:</span>
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
          selected === null
            ? "bg-slate-800 text-white shadow-sm"
            : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
        }`}
      >
        All
      </button>
      {cefrLevels.map((level) => {
        const colors = cefrColors[level];
        const isActive = selected === level;
        return (
          <button
            key={level}
            onClick={() => onChange(isActive ? null : level)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isActive
                ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-current`
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {level}
          </button>
        );
      })}
    </div>
  );
}
