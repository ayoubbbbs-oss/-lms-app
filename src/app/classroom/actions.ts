"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireTeacherOrAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || (dbUser.role !== "TEACHER" && dbUser.role !== "ADMIN"))
    throw new Error("Not authorized");

  return dbUser;
}

export async function createClassroomSession(lessonId: string) {
  const user = await requireTeacherOrAdmin();

  // Prevent duplicate active sessions for same lesson
  const existing = await prisma.classroomSession.findFirst({
    where: { lessonId, status: { not: "ENDED" } },
  });

  if (existing) {
    return { sessionId: existing.id, existing: true };
  }

  const session = await prisma.classroomSession.create({
    data: {
      lessonId,
      teacherId: user.id,
      status: "ACTIVE",
    },
  });

  revalidatePath("/classroom");
  return { sessionId: session.id, existing: false };
}

export async function updateSessionSlide(
  sessionId: string,
  slideIndex: number
) {
  const user = await requireTeacherOrAdmin();

  const session = await prisma.classroomSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.teacherId !== user.id) {
    throw new Error("Not authorized for this session");
  }

  await prisma.classroomSession.update({
    where: { id: sessionId },
    data: { currentSlide: slideIndex },
  });

  return { success: true };
}

export async function updateSessionStatus(
  sessionId: string,
  status: "WAITING" | "ACTIVE" | "PAUSED" | "ENDED"
) {
  const user = await requireTeacherOrAdmin();

  const session = await prisma.classroomSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.teacherId !== user.id) {
    throw new Error("Not authorized for this session");
  }

  await prisma.classroomSession.update({
    where: { id: sessionId },
    data: {
      status,
      endedAt: status === "ENDED" ? new Date() : undefined,
    },
  });

  revalidatePath("/classroom");
  return { success: true };
}
