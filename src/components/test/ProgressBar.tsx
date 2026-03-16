"use client";

export default function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="px-8 py-4">
      {/* Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-sky-400 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Label */}
      <p className="text-base font-bold text-gray-500 mt-2 text-center tracking-wide">
        Question {current} of {total}
      </p>
    </div>
  );
}
