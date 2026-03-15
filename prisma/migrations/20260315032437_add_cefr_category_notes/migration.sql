-- CreateEnum
CREATE TYPE "CefrLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- CreateEnum
CREATE TYPE "LessonCategory" AS ENUM ('GENERAL_ENGLISH', 'BUSINESS_ENGLISH', 'BEGINNERS', 'GRAMMAR', 'CONVERSATION', 'PRONUNCIATION', 'VOCABULARY', 'EXAM_PREP', 'YOUNG_LEARNERS');

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "category" "LessonCategory" NOT NULL DEFAULT 'GENERAL_ENGLISH',
ADD COLUMN     "cefrLevel" "CefrLevel",
ADD COLUMN     "teacherNotes" TEXT;
