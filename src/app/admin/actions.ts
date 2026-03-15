"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { CefrLevel, LessonCategory } from "@/generated/prisma/client";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") throw new Error("Not authorized");

  return dbUser;
}

export async function createLesson(formData: FormData) {
  const admin = await requireAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const contentUrl = formData.get("contentUrl") as string;
  const contentType = formData.get("contentType") as string;
  const cefrLevel = formData.get("cefrLevel") as string;
  const category = formData.get("category") as string;
  const teacherNotes = formData.get("teacherNotes") as string;

  if (!title) return { error: "Title is required" };

  await prisma.lesson.create({
    data: {
      title,
      description: description || null,
      contentUrl: contentUrl || null,
      contentType: contentType || null,
      cefrLevel: (cefrLevel as CefrLevel) || null,
      category: (category as LessonCategory) || "GENERAL_ENGLISH",
      teacherNotes: teacherNotes || null,
      createdBy: admin.id,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function assignLesson(formData: FormData) {
  const admin = await requireAdmin();

  const lessonId = formData.get("lessonId") as string;
  const studentId = formData.get("studentId") as string;

  if (!lessonId || !studentId)
    return { error: "Lesson and student are required" };

  const existing = await prisma.assignment.findUnique({
    where: { lessonId_studentId: { lessonId, studentId } },
  });

  if (existing)
    return { error: "This lesson is already assigned to this student" };

  await prisma.assignment.create({
    data: {
      lessonId,
      studentId,
      assignedBy: admin.id,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function assignLessonToMultiple(
  lessonId: string,
  studentIds: string[]
) {
  const admin = await requireAdmin();

  let assigned = 0;
  for (const studentId of studentIds) {
    const existing = await prisma.assignment.findUnique({
      where: { lessonId_studentId: { lessonId, studentId } },
    });
    if (!existing) {
      await prisma.assignment.create({
        data: { lessonId, studentId, assignedBy: admin.id },
      });
      assigned++;
    }
  }

  revalidatePath("/admin");
  return { success: true, assigned };
}

export async function linkTeacherStudent(formData: FormData) {
  await requireAdmin();

  const teacherId = formData.get("teacherId") as string;
  const studentId = formData.get("studentId") as string;

  if (!teacherId || !studentId)
    return { error: "Teacher and student are required" };

  const existing = await prisma.teacherStudent.findUnique({
    where: { teacherId_studentId: { teacherId, studentId } },
  });

  if (existing)
    return { error: "This teacher-student link already exists" };

  await prisma.teacherStudent.create({
    data: { teacherId, studentId },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteLesson(lessonId: string) {
  await requireAdmin();
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath("/admin");
  return { success: true };
}

export async function removeAssignment(assignmentId: string) {
  await requireAdmin();
  await prisma.assignment.delete({ where: { id: assignmentId } });
  revalidatePath("/admin");
  return { success: true };
}
