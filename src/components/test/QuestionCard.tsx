"use client";

import { useState } from "react";

export type QuestionOption = {
  id: string;
  label: string;
};

export type QuestionData = {
  id: string;
  number: number;
  text: string;
  highlightWord?: string;
  type: "single" | "multiple" | "text";
  options: QuestionOption[];
  correctAnswers: string[];
};

type Props = {
  question: QuestionData;
  selectedAnswers: string[];
  textAnswer: string;
  onSelect: (optionId: string) => void;
  onTextChange: (value: string) => void;
};

export default function QuestionCard({
  question,
  selectedAnswers,
  textAnswer,
  onSelect,
  onTextChange,
}: Props) {
  // Render question text with highlighted word in italic
  const renderText = (text: string, highlight?: string) => {
    if (!highlight) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <em key={i} className="italic text-sky-700 font-extrabold not-italic underline decoration-sky-300 decoration-2 underline-offset-4">
              {part}
            </em>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="px-8 py-6">
      {/* Question number + text */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-extrabold text-gray-600">
            {question.number}
          </span>
        </div>
        <p className="text-xl font-bold text-gray-800 leading-relaxed pt-2">
          {renderText(question.text, question.highlightWord)}
          {question.type === "single" && (
            <span className="text-base font-medium text-gray-400 ml-2">
              Choose only one answer.
            </span>
          )}
          {question.type === "multiple" && (
            <span className="text-base font-medium text-gray-400 ml-2">
              Select all that apply.
            </span>
          )}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 ml-16">
        {question.options.map((option) => {
          const isSelected = selectedAnswers.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all duration-150 ${
                isSelected
                  ? "border-sky-500 bg-sky-50 ring-1 ring-sky-400"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {/* Radio or Checkbox indicator */}
              {question.type === "single" ? (
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? "border-sky-500 bg-sky-500"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
              ) : (
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? "border-sky-500 bg-sky-500"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              )}

              <span
                className={`text-lg font-semibold ${
                  isSelected ? "text-sky-800" : "text-gray-700"
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}

        {/* Text input option ("Other") */}
        {question.type !== "text" && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-gray-200 bg-white">
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
            <span className="text-lg font-semibold text-gray-400 flex-shrink-0">Other:</span>
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 text-lg font-medium text-gray-700 border-b-2 border-gray-200 focus:border-sky-400 outline-none bg-transparent py-1 transition-colors"
            />
          </div>
        )}

        {/* Full text input for text-type questions */}
        {question.type === "text" && (
          <div className="px-2">
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full text-xl font-medium text-gray-700 border-2 border-gray-200 focus:border-sky-400 rounded-xl px-5 py-4 outline-none bg-white transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
}
