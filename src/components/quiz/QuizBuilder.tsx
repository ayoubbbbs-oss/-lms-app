"use client";

import { useState, useTransition } from "react";
import { createQuiz } from "@/app/quiz/actions";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  ListChecks,
  ToggleLeft,
  PenLine,
} from "lucide-react";

type QuestionDraft = {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK" | "SHORT_ANSWER";
  options: string[];
  correctAnswer: string;
  points: number;
};

const TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice", icon: <ListChecks size={14} /> },
  { value: "TRUE_FALSE", label: "True / False", icon: <ToggleLeft size={14} /> },
  { value: "FILL_IN_BLANK", label: "Fill in Blank", icon: <PenLine size={14} /> },
  { value: "SHORT_ANSWER", label: "Short Answer", icon: <PenLine size={14} /> },
] as const;

export default function QuizBuilder() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cefrLevel, setCefrLevel] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function addQuestion(type: QuestionDraft["type"]) {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        text: "",
        type,
        options: type === "MULTIPLE_CHOICE" ? ["", "", "", ""] : [],
        correctAnswer: type === "TRUE_FALSE" ? "True" : "",
        points: 1,
      },
    ]);
  }

  function updateQuestion(id: string, updates: Partial<QuestionDraft>) {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  }

  function removeQuestion(id: string) {
    setQuestions(questions.filter((q) => q.id !== id));
  }

  function updateOption(qId: string, optIndex: number, value: string) {
    setQuestions(
      questions.map((q) => {
        if (q.id !== qId) return q;
        const opts = [...q.options];
        opts[optIndex] = value;
        return { ...q, options: opts };
      })
    );
  }

  async function handleSubmit() {
    if (!title.trim()) { setError("Title is required"); return; }
    if (questions.length === 0) { setError("Add at least one question"); return; }
    for (const q of questions) {
      if (!q.text.trim()) { setError("All questions need text"); return; }
      if (!q.correctAnswer.trim()) { setError(`Set correct answer for: "${q.text}"`); return; }
    }
    setError("");

    startTransition(async () => {
      const res = await createQuiz({
        title: title.trim(),
        description: description.trim() || undefined,
        cefrLevel: cefrLevel || undefined,
        questions: questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.type === "MULTIPLE_CHOICE" ? q.options.filter(Boolean) : undefined,
          correctAnswer: q.correctAnswer,
          points: q.points,
        })),
      });
      router.push(`/admin/quizzes/${res.quizId}`);
    });
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Quiz meta */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Quiz Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Business English Assessment"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">CEFR Level</label>
              <select
                value={cefrLevel}
                onChange={(e) => setCefrLevel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Any level</option>
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3 mb-4">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Question header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-slate-300" />
                <span className="text-xs font-bold text-slate-500">Q{i + 1}</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                  {TYPES.find((t) => t.value === q.type)?.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-slate-400">Points:</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={q.points}
                  onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                  className="w-12 px-1 py-0.5 border border-slate-200 rounded text-xs text-center"
                />
                <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Question text */}
              <input
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                placeholder="Enter your question..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              {/* MC options */}
              {q.type === "MULTIPLE_CHOICE" && (
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuestion(q.id, { correctAnswer: opt })}
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                          q.correctAnswer === opt && opt
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-slate-300 text-slate-300"
                        }`}
                      >
                        <CheckCircle2 size={12} />
                      </button>
                      <input
                        value={opt}
                        onChange={(e) => updateOption(q.id, oi, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updateQuestion(q.id, { options: [...q.options, ""] })}
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                  >
                    + Add option
                  </button>
                </div>
              )}

              {/* True/False */}
              {q.type === "TRUE_FALSE" && (
                <div className="flex gap-2">
                  {["True", "False"].map((v) => (
                    <button
                      key={v}
                      onClick={() => updateQuestion(q.id, { correctAnswer: v })}
                      className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all ${
                        q.correctAnswer === v
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {v} {q.correctAnswer === v ? "✓" : ""}
                    </button>
                  ))}
                </div>
              )}

              {/* Fill in blank / Short answer */}
              {(q.type === "FILL_IN_BLANK" || q.type === "SHORT_ANSWER") && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Correct answer:</label>
                  <input
                    value={q.correctAnswer}
                    onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                    placeholder="Type the correct answer"
                    className="w-full px-3 py-1.5 border border-green-300 bg-green-50 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add question buttons */}
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-4 mb-4">
        <p className="text-xs text-slate-500 mb-2 font-semibold">Add Question:</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => addQuestion(t.value as QuestionDraft["type"])}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{questions.length} question{questions.length !== 1 ? "s" : ""}</p>
        <button
          onClick={handleSubmit}
          disabled={isPending || questions.length === 0}
          className="px-5 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Creating..." : "Create Quiz"}
        </button>
      </div>
    </div>
  );
}
