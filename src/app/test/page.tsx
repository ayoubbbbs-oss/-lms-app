"use client";

import { useState, useCallback } from "react";
import ProgressBar from "@/components/test/ProgressBar";
import QuestionCard, { type QuestionData } from "@/components/test/QuestionCard";
import TestNavigation from "@/components/test/TestNavigation";
import { Trophy, RotateCcw, CheckCircle2, XCircle } from "lucide-react";

// ── Demo questions (Off2Class style) ──
const QUESTIONS: QuestionData[] = [
  {
    id: "q1",
    number: 1,
    text: "Which of these is a subject pronoun? Choose only one answer.",
    highlightWord: "subject pronoun",
    type: "single",
    options: [
      { id: "a", label: "Him" },
      { id: "b", label: "She" },
      { id: "c", label: "Them" },
      { id: "d", label: "Us" },
    ],
    correctAnswers: ["b"],
  },
  {
    id: "q2",
    number: 2,
    text: 'Complete the sentence: "_____ is a teacher."',
    type: "single",
    options: [
      { id: "a", label: "He" },
      { id: "b", label: "Him" },
      { id: "c", label: "His" },
      { id: "d", label: "Her" },
    ],
    correctAnswers: ["a"],
  },
  {
    id: "q3",
    number: 3,
    text: "Select ALL the subject pronouns from the list below.",
    highlightWord: "ALL",
    type: "multiple",
    options: [
      { id: "a", label: "I" },
      { id: "b", label: "Me" },
      { id: "c", label: "They" },
      { id: "d", label: "Them" },
      { id: "e", label: "We" },
      { id: "f", label: "Us" },
    ],
    correctAnswers: ["a", "c", "e"],
  },
  {
    id: "q4",
    number: 4,
    text: 'What is the subject pronoun for "the students"?',
    highlightWord: "the students",
    type: "single",
    options: [
      { id: "a", label: "He" },
      { id: "b", label: "She" },
      { id: "c", label: "They" },
      { id: "d", label: "It" },
    ],
    correctAnswers: ["c"],
  },
  {
    id: "q5",
    number: 5,
    text: 'Fill in the blank: "_____ are going to the park."',
    type: "single",
    options: [
      { id: "a", label: "We" },
      { id: "b", label: "Us" },
      { id: "c", label: "Our" },
      { id: "d", label: "Ours" },
    ],
    correctAnswers: ["a"],
  },
  {
    id: "q6",
    number: 6,
    text: 'Is "It" a subject pronoun? Answer True or False.',
    highlightWord: "It",
    type: "single",
    options: [
      { id: "a", label: "True" },
      { id: "b", label: "False" },
    ],
    correctAnswers: ["a"],
  },
  {
    id: "q7",
    number: 7,
    text: "Which sentence uses the correct subject pronoun?",
    highlightWord: "correct",
    type: "single",
    options: [
      { id: "a", label: "Him went to the store." },
      { id: "b", label: "Her is my sister." },
      { id: "c", label: "They are playing football." },
      { id: "d", label: "Us like pizza." },
    ],
    correctAnswers: ["c"],
  },
  {
    id: "q8",
    number: 8,
    text: 'Replace the underlined word with the correct pronoun: "Maria is a doctor."',
    highlightWord: "Maria",
    type: "single",
    options: [
      { id: "a", label: "He" },
      { id: "b", label: "She" },
      { id: "c", label: "It" },
      { id: "d", label: "They" },
    ],
    correctAnswers: ["b"],
  },
  {
    id: "q9",
    number: 9,
    text: "Select ALL the sentences that use subject pronouns correctly.",
    highlightWord: "ALL",
    type: "multiple",
    options: [
      { id: "a", label: "I am a student." },
      { id: "b", label: "Me like coffee." },
      { id: "c", label: "She plays tennis." },
      { id: "d", label: "Him is tall." },
    ],
    correctAnswers: ["a", "c"],
  },
  {
    id: "q10",
    number: 10,
    text: 'Write one sentence using the subject pronoun "We".',
    highlightWord: "We",
    type: "text",
    options: [],
    correctAnswers: [],
  },
];

type AnswerMap = Record<string, { selected: string[]; text: string }>;

export default function TestPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [finished, setFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const question = QUESTIONS[currentQ];
  const currentAnswer = answers[question.id] || { selected: [], text: "" };

  const handleSelect = useCallback(
    (optionId: string) => {
      setAnswers((prev) => {
        const current = prev[question.id] || { selected: [], text: "" };
        let newSelected: string[];

        if (question.type === "single") {
          newSelected = [optionId];
        } else {
          newSelected = current.selected.includes(optionId)
            ? current.selected.filter((id) => id !== optionId)
            : [...current.selected, optionId];
        }

        return { ...prev, [question.id]: { ...current, selected: newSelected } };
      });
    },
    [question]
  );

  const handleTextChange = useCallback(
    (value: string) => {
      setAnswers((prev) => ({
        ...prev,
        [question.id]: { ...(prev[question.id] || { selected: [], text: "" }), text: value },
      }));
    },
    [question]
  );

  const hasAnswer =
    currentAnswer.selected.length > 0 || currentAnswer.text.trim().length > 0;

  const handleNext = useCallback(() => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setFinished(true);
    }
  }, [currentQ]);

  // Calculate score
  const calcScore = () => {
    let correct = 0;
    for (const q of QUESTIONS) {
      if (q.type === "text") { correct++; continue; } // text always counts
      const ans = answers[q.id];
      if (!ans) continue;
      const isCorrect =
        ans.selected.length === q.correctAnswers.length &&
        q.correctAnswers.every((a) => ans.selected.includes(a));
      if (isCorrect) correct++;
    }
    return correct;
  };

  // ── RESULT SCREEN ──
  if (finished) {
    const score = calcScore();
    const pct = Math.round((score / QUESTIONS.length) * 100);

    return (
      <div className="min-h-screen bg-[#404040] p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-[800px] bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Result header */}
          <div className={`px-8 py-8 text-center ${pct >= 70 ? "bg-green-50" : pct >= 40 ? "bg-amber-50" : "bg-red-50"}`}>
            <Trophy
              size={56}
              strokeWidth={2}
              className={`mx-auto mb-3 ${pct >= 70 ? "text-green-500" : pct >= 40 ? "text-amber-500" : "text-red-400"}`}
            />
            <h1 className="text-3xl font-extrabold text-gray-800">Test Complete!</h1>
            <p className="text-lg text-gray-500 mt-1">Lesson 1: Introduction to ESL</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Score */}
            <div className="text-center">
              <p className="text-5xl font-extrabold text-gray-800">{score}/{QUESTIONS.length}</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div
                  className={`h-4 rounded-full transition-all ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xl font-bold text-gray-500 mt-2">{pct}% Correct</p>
            </div>

            {/* CEFR */}
            <div className="bg-sky-50 border-2 border-sky-200 rounded-xl p-6 text-center">
              <p className="text-sm font-bold text-sky-600 uppercase tracking-wider">Recommended Level</p>
              <p className="text-4xl font-extrabold text-sky-700 mt-1">
                {pct >= 90 ? "C1" : pct >= 70 ? "B2" : pct >= 50 ? "B1" : pct >= 30 ? "A2" : "A1"}
              </p>
            </div>

            {/* Review */}
            <button
              onClick={() => setShowReview(!showReview)}
              className="w-full flex items-center justify-center gap-2 py-3 text-lg font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <RotateCcw size={20} strokeWidth={2.5} />
              {showReview ? "Hide Review" : "Review Answers"}
            </button>

            {showReview && (
              <div className="space-y-3">
                {QUESTIONS.map((q) => {
                  if (q.type === "text") return null;
                  const ans = answers[q.id];
                  const isCorrect =
                    ans &&
                    ans.selected.length === q.correctAnswers.length &&
                    q.correctAnswers.every((a) => ans.selected.includes(a));
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border-2 ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 size={22} strokeWidth={2.5} className="text-green-500 mt-0.5" />
                        ) : (
                          <XCircle size={22} strokeWidth={2.5} className="text-red-400 mt-0.5" />
                        )}
                        <div>
                          <p className="text-base font-bold text-gray-700">
                            {q.number}. {q.text}
                          </p>
                          <p className="text-sm mt-1">
                            Your answer:{" "}
                            <span className={isCorrect ? "text-green-700 font-bold" : "text-red-600 font-bold"}>
                              {ans?.selected.map((s) => q.options.find((o) => o.id === s)?.label).join(", ") || "(none)"}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-green-700 mt-0.5">
                              Correct:{" "}
                              <span className="font-bold">
                                {q.correctAnswers.map((a) => q.options.find((o) => o.id === a)?.label).join(", ")}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Retry */}
            <button
              onClick={() => {
                setCurrentQ(0);
                setAnswers({});
                setFinished(false);
                setShowReview(false);
              }}
              className="w-full py-4 text-lg font-bold text-white bg-sky-500 rounded-xl hover:bg-sky-600 transition-colors"
            >
              Take Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── TEST UI ──
  return (
    <div className="min-h-screen bg-[#404040] p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-[1200px] bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header — dark teal like Off2Class */}
        <div className="bg-[#3F636F]">
          <div className="px-8 py-5">
            <h1 className="text-2xl font-extrabold text-white uppercase tracking-wider">
              Lesson 1: Introduction to ESL
            </h1>
          </div>
          <div className="bg-[#2d4a54] px-8 py-3">
            <h2 className="text-xl font-bold text-white/90 uppercase tracking-wide">
              Topic 1: Subject Pronouns
            </h2>
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar current={currentQ + 1} total={QUESTIONS.length} />

        {/* Question card */}
        <QuestionCard
          question={question}
          selectedAnswers={currentAnswer.selected}
          textAnswer={currentAnswer.text}
          onSelect={handleSelect}
          onTextChange={handleTextChange}
        />

        {/* Navigation */}
        <TestNavigation
          currentQuestion={currentQ + 1}
          totalQuestions={QUESTIONS.length}
          onPrev={() => setCurrentQ(Math.max(0, currentQ - 1))}
          onNext={handleNext}
          onFirst={() => setCurrentQ(0)}
          onLast={() => setCurrentQ(QUESTIONS.length - 1)}
          isFirst={currentQ === 0}
          isLast={currentQ === QUESTIONS.length - 1}
          hasAnswer={hasAnswer}
        />

        {/* Question dots */}
        <div className="px-8 pb-5 flex items-center justify-center gap-2">
          {QUESTIONS.map((q, i) => {
            const answered = answers[q.id] && (answers[q.id].selected.length > 0 || answers[q.id].text.trim().length > 0);
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQ(i)}
                className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                  i === currentQ
                    ? "bg-sky-500 text-white scale-110"
                    : answered
                    ? "bg-green-100 text-green-700 border-2 border-green-300"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
