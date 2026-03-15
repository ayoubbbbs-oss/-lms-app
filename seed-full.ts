import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ADMIN_ID = "5ab6e067-6a07-48fd-a8a7-0f812eb37355";

async function main() {
  // Get existing students
  const students = await prisma.user.findMany({ where: { role: "STUDENT" } });
  console.log(`Found ${students.length} students`);

  // Create a teacher if none exists
  let teacher = await prisma.user.findFirst({ where: { role: "TEACHER" } });
  if (!teacher) {
    teacher = await prisma.user.create({
      data: {
        email: "teacher@lms-demo.com",
        name: "Sarah Johnson",
        role: "TEACHER",
      },
    });
    console.log("Created teacher:", teacher.name);
  } else {
    console.log("Teacher exists:", teacher.name);
  }

  // Link teacher to all students
  for (const student of students) {
    await prisma.teacherStudent.upsert({
      where: {
        teacherId_studentId: {
          teacherId: teacher.id,
          studentId: student.id,
        },
      },
      update: {},
      create: {
        teacherId: teacher.id,
        studentId: student.id,
      },
    });
  }
  console.log(`Linked teacher to ${students.length} students`);

  // Get all lessons
  const lessons = await prisma.lesson.findMany();
  console.log(`Found ${lessons.length} lessons`);

  // Assign lessons to students with varied statuses
  const statuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;
  let assignCount = 0;

  for (const student of students) {
    for (let i = 0; i < lessons.length; i++) {
      const status = statuses[i % 3];
      await prisma.assignment.upsert({
        where: {
          lessonId_studentId: {
            lessonId: lessons[i].id,
            studentId: student.id,
          },
        },
        update: { status },
        create: {
          lessonId: lessons[i].id,
          studentId: student.id,
          assignedBy: ADMIN_ID,
          status,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });
      assignCount++;
    }
  }
  console.log(`Created/updated ${assignCount} assignments`);

  // Create more lessons for variety
  const extraLessons = [
    {
      title: "Everyday Vocabulary: Food & Drink",
      description: "Learn essential food vocabulary for ordering at restaurants.",
      category: "VOCABULARY" as const,
      cefrLevel: "A1" as const,
      slides: [
        { order: 0, title: "Welcome", contentType: "text", content: "<h1>Food & Drink Vocabulary</h1><p>Today we learn how to order food!</p>", teacherNotes: "Warm up: Ask students their favorite food." },
        { order: 1, title: "At the Restaurant", contentType: "text", content: "<h1>Key Phrases</h1><ul><li>Can I have...?</li><li>I would like...</li><li>The bill, please</li></ul>", teacherNotes: "Role-play ordering food." },
      ],
    },
    {
      title: "Job Interview Skills",
      description: "Master the language of professional job interviews.",
      category: "BUSINESS_ENGLISH" as const,
      cefrLevel: "B1" as const,
      slides: [
        { order: 0, title: "Introduction", contentType: "text", content: "<h1>Job Interview English</h1><p>Prepare for your next interview!</p>", teacherNotes: "Discuss common interview questions." },
        { order: 1, title: "Tell Me About Yourself", contentType: "text", content: "<h1>Your Introduction</h1><p>Structure: Present → Past → Future</p>", teacherNotes: "Have each student practice their intro." },
      ],
    },
    {
      title: "English Sounds: Pronunciation Workshop",
      description: "Practice difficult English sounds and minimal pairs.",
      category: "PRONUNCIATION" as const,
      cefrLevel: "A2" as const,
      slides: [
        { order: 0, title: "Minimal Pairs", contentType: "text", content: "<h1>Can you hear the difference?</h1><p>ship/sheep, bit/beat, pull/pool</p>", teacherNotes: "Play audio examples. Have students repeat." },
      ],
    },
    {
      title: "Debate Club: Current Events",
      description: "Advanced discussion and argumentation skills.",
      category: "CONVERSATION" as const,
      cefrLevel: "C1" as const,
      slides: [
        { order: 0, title: "Today's Topic", contentType: "text", content: "<h1>Should AI replace teachers?</h1><p>Discuss in pairs, then present your argument.</p>", teacherNotes: "Split into FOR and AGAINST groups." },
      ],
    },
    {
      title: "IELTS Reading Strategies",
      description: "Learn key strategies for the IELTS reading exam.",
      category: "EXAM_PREP" as const,
      cefrLevel: "B2" as const,
      slides: [
        { order: 0, title: "Skimming & Scanning", contentType: "text", content: "<h1>Reading Strategies</h1><p>Skim for main idea, scan for details.</p>", teacherNotes: "Give a timed practice exercise." },
      ],
    },
  ];

  for (const lesson of extraLessons) {
    const existing = await prisma.lesson.findFirst({ where: { title: lesson.title } });
    if (!existing) {
      await prisma.lesson.create({
        data: {
          ...lesson,
          createdBy: ADMIN_ID,
          contentType: "interactive",
        },
      });
      console.log("Created lesson:", lesson.title);
    }
  }

  console.log("\n✅ Full seed complete!");
  await prisma.$disconnect();
}

main().catch(console.error);
