"use client";

import { useState, useTransition } from "react";
import { submitQuiz } from "@/app/quiz/actions";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  RotateCcw,
} from "lucide-react";

type Question = {
  id: string;
  text: string;
  type: string;
  options: string[] | null;
  correctAnswer: string;
  points: number;
  order: number;
};

type Props = {
  testId: string;
  title: string;
  description: string | null;
  cefrLevel: string | null;
  questions: Question[];
};

type Result = {
  score: number;
  maxScore: number;
  percentage: number;
  cefrResult: string | null;
};

export default function QuizPlayer({
  testId,
  title,
  description,
  cefrLevel,
  questions,
}: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [isPending, startTransition] = useTransition();

  const question = questions[currentQ];
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  function selectAnswer(questionId: string, answer: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  function handleSubmit() {
    if (answered < total) {
      if (!confirm(`You have ${total - answered} unanswered question(s). Submit anyway?`))
        return;
    }
    startTransition(async () => {
      const res = await submitQuiz(testId, answers);
      if ("alreadySubmitted" in res) {
        alert("You already submitted this quiz.");
        return;
      }
      setResult(res as Result);
    });
  }

  // ── RESULT SCREEN ──
  if (result) {
    const pct = Math.round(result.percentage);
    return (
      <div className="max-w-lg mx-auto py-8 px-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-5 text-center ${pct >= 70 ? "bg-green-50" : pct >= 40 ? "bg-amber-50" : "bg-red-50"}`}>
            <Trophy size={40} className={`mx-auto mb-2 ${pct >= 70 ? "text-green-500" : pct >= 40 ? "text-amber-500" : "text-red-400"}`} />
            <h2 className="text-xl font-bold text-slate-800">Quiz Complete!</h2>
            <p className="text-sm text-slate-500 mt-1">{title}</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Score */}
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-800">{result.score}/{result.maxScore}</p>
              <div className="w-full bg-slate-100 rounded-full h-3 mt-3">
                <div
                  className={`h-3 rounded-full transition-all ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-sm text-slate-500 mt-1">{pct}% correct</p>
            </div>

            {/* CEFR Result */}
            {result.cefrResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Recommended CEFR Level</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{result.cefrResult}</p>
              </div>
            )}

            {/* Review button */}
            <button
              onClick={() => setShowReview(!showReview)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <RotateCcw size={14} />
              {showReview ? "Hide Review" : "Review Answers"}
            </button>

            {/* Answer review */}
            {showReview && (
              <div className="space-y-2 pt-2">
                {questions.map((q, i) => {
                  const userAnswer = (answers[q.id] || "").trim().toLowerCase();
                  const correct = q.correctAnswer.trim().toLowerCase();
                  const isCorrect = userAnswer === correct;
                  return (
                    <div key={q.id} className={`p-3 rounded-lg border text-sm ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                      <div className="flex items-start gap-2">
                        {isCorrect ? <CheckCircle2 size={16} className="text-green-500 mt-0.5" /> : <XCircle size={16} className="text-red-400 mt-0.5" />}
                        <div>
                          <p className="font-medium text-slate-700">{i + 1}. {q.text}</p>
                          <p className="text-xs mt-1">
                            Your answer: <span className={isCorrect ? "text-green-700 font-semibold" : "text-red-600 font-semibold"}>{answers[q.id] || "(no answer)"}</span>
                          </p>
                          {!isCorrect && (
                            <p className="text-xs text-green-700">Correct: <span className="font-semibold">{q.correctAnswer}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ PLAYER ──
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold text-slate-800">{title}</h1>
            {description && <p className="text-xs text-slate-500">{description}</p>}
          </div>
          {cefrLevel && (
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">{cefrLevel}</span>
          )}
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-100 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-500 tabular-nums">{answered}/{total}</span>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Question number bar */}
        <div className="bg-slate-50 px-5 py-2 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Question {currentQ + 1} of {total}</span>
          <span className="text-xs text-slate-400">{question.points} point{question.points !== 1 ? "s" : ""}</span>
        </div>

        <div className="p-5">
          {/* Question text */}
          <h2 className="text-base font-semibold text-slate-800 mb-4">{question.text}</h2>

          {/* Answer area — depends on type */}
          {question.type === "MULTIPLE_CHOICE" && question.options && (
            <div className="space-y-2">
              {(question.options as string[]).map((option, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = answers[question.id] === option;
                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(question.id, option)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isSelected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {letter}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {question.type === "TRUE_FALSE" && (
            <div className="flex gap-3">
              {["True", "False"].map((opt) => {
                const isSelected = answers[question.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => selectAnswer(question.id, opt)}
                    className={`flex-1 p-4 rounded-lg border text-center text-sm font-semibold transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {(question.type === "FILL_IN_BLANK" || question.type === "SHORT_ANSWER") && (
            <input
              type="text"
              value={answers[question.id] || ""}
              onChange={(e) => selectAnswer(question.id, e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"
          >
            <ArrowLeft size={13} /> Previous
          </button>

          {/* Question dots */}
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                  i === currentQ
                    ? "bg-blue-500 text-white"
                    : answers[questions[i].id]
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentQ < total - 1 ? (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Next <ArrowRight size={13} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
