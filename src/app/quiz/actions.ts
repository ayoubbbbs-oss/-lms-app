"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { CefrLevel, QuestionType } from "@/generated/prisma/client";

async function getUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) throw new Error("User not found");
  return dbUser;
}

export async function createQuiz(data: {
  title: string;
  description?: string;
  cefrLevel?: string;
  questions: {
    text: string;
    type: string;
    options?: string[];
    correctAnswer: string;
    points: number;
  }[];
}) {
  const user = await getUser();
  if (user.role !== "ADMIN" && user.role !== "TEACHER") throw new Error("Not authorized");

  const quiz = await prisma.placementTest.create({
    data: {
      title: data.title,
      description: data.description || null,
      cefrLevel: (data.cefrLevel as CefrLevel) || null,
      createdBy: user.id,
      questions: {
        create: data.questions.map((q, i) => ({
          text: q.text,
          type: q.type as QuestionType,
          options: q.options ? JSON.parse(JSON.stringify(q.options)) : null,
          correctAnswer: q.correctAnswer,
          points: q.points,
          order: i,
        })),
      },
    },
  });

  revalidatePath("/admin/quizzes");
  return { quizId: quiz.id };
}

export async function submitQuiz(
  testId: string,
  answers: Record<string, string> // questionId -> answer
) {
  const user = await getUser();

  const test = await prisma.placementTest.findUnique({
    where: { id: testId },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!test) throw new Error("Quiz not found");

  // Check if already submitted
  const existing = await prisma.studentScore.findUnique({
    where: { studentId_testId: { studentId: user.id, testId } },
  });
  if (existing) return { alreadySubmitted: true, score: existing };

  // Grade
  let score = 0;
  let maxScore = 0;

  for (const q of test.questions) {
    maxScore += q.points;
    const studentAnswer = (answers[q.id] || "").trim().toLowerCase();
    const correctAnswer = q.correctAnswer.trim().toLowerCase();

    if (studentAnswer === correctAnswer) {
      score += q.points;
    }
  }

  // Determine CEFR level from percentage
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  let cefrResult: CefrLevel | null = null;
  if (percentage >= 90) cefrResult = "C2";
  else if (percentage >= 80) cefrResult = "C1";
  else if (percentage >= 70) cefrResult = "B2";
  else if (percentage >= 55) cefrResult = "B1";
  else if (percentage >= 40) cefrResult = "A2";
  else cefrResult = "A1";

  const result = await prisma.studentScore.create({
    data: {
      testId,
      studentId: user.id,
      score,
      maxScore,
      cefrResult,
    },
  });

  revalidatePath("/student/homework");
  return { score, maxScore, percentage, cefrResult, id: result.id };
}

export async function deleteQuiz(quizId: string) {
  const user = await getUser();
  if (user.role !== "ADMIN") throw new Error("Not authorized");
  await prisma.placementTest.delete({ where: { id: quizId } });
  revalidatePath("/admin/quizzes");
}
