#!/usr/bin/env npx tsx
/**
 * 📚 LMS Lesson Importer
 *
 * Converts a PDF lesson file into slides with AI-generated teacher notes.
 *
 * Usage:
 *   npx tsx scripts/import-lesson.ts
 *   npx tsx scripts/import-lesson.ts --pdf ./lesson.pdf
 *
 * Requirements in .env:
 *   DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
 *   SUPABASE_SERVICE_ROLE_KEY (for storage uploads),
 *   OPENAI_API_KEY or ANTHROPIC_API_KEY (for AI vision)
 */

import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import prompts from "prompts";
import ora from "ora";
import cliProgress from "cli-progress";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ── Config ──────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const BUCKET = "lessons";
const ADMIN_ID = process.env.ADMIN_USER_ID || "";

const CATEGORIES = [
  "GENERAL_ENGLISH",
  "BUSINESS_ENGLISH",
  "BEGINNERS",
  "GRAMMAR",
  "CONVERSATION",
  "PRONUNCIATION",
  "VOCABULARY",
  "EXAM_PREP",
  "YOUNG_LEARNERS",
] as const;

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

// ── Helpers ─────────────────────────────────────────

function die(msg: string): never {
  console.error(`\n❌ ${msg}`);
  process.exit(1);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Supabase client ─────────────────────────────────

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) die("Missing SUPABASE env vars in .env");
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ── Prisma client ───────────────────────────────────

function getPrisma() {
  if (!process.env.DATABASE_URL) die("Missing DATABASE_URL in .env");
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

// ── PDF → Pages (extract page count + raw text) ─────

async function extractPdfInfo(pdfPath: string) {
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = (pdfParseModule as Record<string, unknown>).default as typeof pdfParseModule || pdfParseModule;
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  return {
    pageCount: data.numpages,
    text: data.text,
    buffer,
  };
}

// ── Upload PDF pages as images to Supabase Storage ──
// Since we can't convert PDF→images without native deps,
// we upload the full PDF and create slide entries from page numbers.
// If you have pdftoppm installed (poppler), we use it for real images.

async function convertPdfToImages(
  pdfPath: string,
  pageCount: number,
  outputDir: string
): Promise<string[]> {
  const { execSync } = await import("node:child_process");
  const images: string[] = [];

  // Try using pdftoppm (from poppler) if available
  try {
    execSync("which pdftoppm", { stdio: "ignore" });

    // pdftoppm is available — convert each page to JPG
    const prefix = path.join(outputDir, "slide");
    execSync(
      `pdftoppm -jpeg -r 200 "${pdfPath}" "${prefix}"`,
      { stdio: "ignore" }
    );

    // Collect output files (pdftoppm names them slide-01.jpg, slide-1.jpg, etc.)
    const files = fs.readdirSync(outputDir)
      .filter((f) => f.startsWith("slide") && f.endsWith(".jpg"))
      .sort();

    for (const file of files) {
      images.push(path.join(outputDir, file));
    }

    return images;
  } catch {
    // pdftoppm not available
  }

  // Try using sips (macOS built-in) with PDF — creates one image
  // Fallback: upload the PDF itself and reference pages by index
  console.log(
    "  ⚠ pdftoppm not found. Install poppler for image extraction:"
  );
  console.log("    brew install poppler");
  console.log("  → Falling back to PDF-direct mode (1 file, N slide entries)\n");

  return [];
}

// ── Upload files to Supabase Storage ────────────────

async function uploadToStorage(
  supabase: ReturnType<typeof createClient>,
  lessonId: string,
  files: string[]
): Promise<string[]> {
  const urls: string[] = [];

  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const ext = path.extname(filePath);
    const remotePath = `${lessonId}/slide-${String(i).padStart(3, "0")}${ext}`;
    const fileBuffer = fs.readFileSync(filePath);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(remotePath, fileBuffer, {
        contentType: ext === ".jpg" ? "image/jpeg" : "image/png",
        upsert: true,
      });

    if (error) {
      console.error(`  ⚠ Upload failed for slide ${i}: ${error.message}`);
      urls.push("");
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(remotePath);

    urls.push(publicUrl);
  }

  return urls;
}

// ── Upload raw PDF to storage (fallback) ────────────

async function uploadPdfDirect(
  supabase: ReturnType<typeof createClient>,
  lessonId: string,
  pdfBuffer: Buffer,
  pdfName: string
): Promise<string> {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }

  const remotePath = `${lessonId}/${pdfName}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(remotePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) die(`PDF upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(remotePath);

  return publicUrl;
}

// ── AI Vision: Generate teacher notes ───────────────

async function generateTeacherNotes(
  imageUrl: string,
  slideIndex: number,
  totalSlides: number
): Promise<{ title: string; teacherNotes: string }> {
  const systemPrompt = `You are an Expert ESL Teacher creating detailed teaching notes.
For each slide image, return ONLY a valid JSON object with:
- "title": A short descriptive title for this slide (max 8 words)
- "teacherNotes": A structured teaching guide with sections:
  Task: What the teacher should do
  Instructions: Step-by-step directions
  Answers: Expected answers (if applicable)

Keep the notes practical and classroom-ready.`;

  // Try OpenAI first
  if (OPENAI_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `This is slide ${slideIndex + 1} of ${totalSlides}. Analyze it and generate teaching notes.`,
                },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
          max_tokens: 500,
          response_format: { type: "json_object" },
        }),
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return JSON.parse(content);
    } catch (e) {
      console.error(`  ⚠ OpenAI error for slide ${slideIndex + 1}:`, e);
    }
  }

  // Try Anthropic
  if (ANTHROPIC_KEY) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_KEY,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `This is slide ${slideIndex + 1} of ${totalSlides}. Analyze it and generate teaching notes. Return ONLY JSON.`,
                },
                {
                  type: "image",
                  source: { type: "url", url: imageUrl },
                },
              ],
            },
          ],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error(`  ⚠ Anthropic error for slide ${slideIndex + 1}:`, e);
    }
  }

  // Fallback — no AI key
  return {
    title: `Slide ${slideIndex + 1}`,
    teacherNotes: `Task: Guide students through slide ${slideIndex + 1}.\nInstructions: Display the slide and discuss the content.\nAnswers: Refer to the slide content.`,
  };
}

// ── MAIN ────────────────────────────────────────────

async function main() {
  console.log("\n");
  console.log("  ╔══════════════════════════════════════════╗");
  console.log("  ║   📚  LMS PDF Lesson Importer            ║");
  console.log("  ║   Convert PDFs → Interactive Slides       ║");
  console.log("  ╚══════════════════════════════════════════╝");
  console.log("\n");

  // ── Step 1: Interactive prompts ──

  const answers = await prompts(
    [
      {
        type: "text",
        name: "pdfPath",
        message: "📄 Path to PDF file:",
        initial: process.argv[2] || "",
        validate: (v: string) => {
          if (!v.trim()) return "PDF path is required";
          const resolved = path.resolve(v.trim());
          if (!fs.existsSync(resolved)) return `File not found: ${resolved}`;
          if (!resolved.endsWith(".pdf")) return "File must be a .pdf";
          return true;
        },
      },
      {
        type: "text",
        name: "title",
        message: "📝 Lesson Title:",
        validate: (v: string) => (v.trim() ? true : "Title is required"),
      },
      {
        type: "text",
        name: "description",
        message: "📋 Lesson Description (optional):",
      },
      {
        type: "select",
        name: "category",
        message: "📂 Category:",
        choices: CATEGORIES.map((c) => ({
          title: c.replace(/_/g, " "),
          value: c,
        })),
      },
      {
        type: "select",
        name: "cefrLevel",
        message: "🎯 CEFR Level:",
        choices: CEFR_LEVELS.map((l) => ({ title: l, value: l })),
      },
    ],
    {
      onCancel: () => die("Cancelled by user"),
    }
  );

  const pdfPath = path.resolve(answers.pdfPath.trim());
  const lessonId = crypto.randomUUID();

  console.log("\n");

  // ── Step 2: Extract PDF info ──

  const spinner = ora("📄 Extracting pages from PDF...").start();

  let pdfInfo;
  try {
    pdfInfo = await extractPdfInfo(pdfPath);
    spinner.succeed(
      `📄 Extracted ${pdfInfo.pageCount} pages from PDF`
    );
  } catch (e) {
    spinner.fail("Failed to read PDF");
    die(String(e));
  }

  // ── Step 3: Convert to images ──

  const tmpDir = path.join("/tmp", `lms-import-${lessonId}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const spinner2 = ora("🖼️  Converting PDF pages to images...").start();
  const imageFiles = await convertPdfToImages(
    pdfPath,
    pdfInfo.pageCount,
    tmpDir
  );
  const hasImages = imageFiles.length > 0;

  if (hasImages) {
    spinner2.succeed(`🖼️  Converted ${imageFiles.length} pages to images`);
  } else {
    spinner2.info("🖼️  Using PDF-direct mode (no image conversion)");
  }

  // ── Step 4: Upload to Supabase Storage ──

  const supabase = getSupabase();
  let slideUrls: string[] = [];

  if (hasImages) {
    console.log("");
    const uploadBar = new cliProgress.SingleBar(
      {
        format:
          "  ☁️  Uploading slides |{bar}| {value}/{total} slides",
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic
    );

    uploadBar.start(imageFiles.length, 0);

    slideUrls = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const urls = await uploadToStorage(supabase, lessonId, [imageFiles[i]]);
      slideUrls.push(urls[0]);
      uploadBar.update(i + 1);
    }

    uploadBar.stop();
    console.log(`  ☁️  Uploaded ${slideUrls.length} slides to Supabase Storage\n`);
  } else {
    // Upload the PDF directly
    const spinner3 = ora("☁️  Uploading PDF to Supabase Storage...").start();
    const pdfUrl = await uploadPdfDirect(
      supabase,
      lessonId,
      pdfInfo.buffer,
      path.basename(pdfPath)
    );
    spinner3.succeed("☁️  PDF uploaded to Supabase Storage");

    // Create slide entries for each page (pointing to PDF URL with page reference)
    slideUrls = Array.from({ length: pdfInfo.pageCount }, () => pdfUrl);
  }

  // ── Step 5: AI Vision — Generate teacher notes ──

  const hasAI = !!(OPENAI_KEY || ANTHROPIC_KEY);
  type SlideData = {
    order: number;
    title: string;
    contentUrl: string;
    contentType: string;
    teacherNotes: string;
  };
  const slides: SlideData[] = [];

  if (hasAI && hasImages) {
    console.log("");
    const aiBar = new cliProgress.SingleBar(
      {
        format:
          "  🤖 Generating Teacher Notes |{bar}| {value}/{total} slides",
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic
    );

    aiBar.start(slideUrls.length, 0);

    for (let i = 0; i < slideUrls.length; i++) {
      const result = await generateTeacherNotes(
        slideUrls[i],
        i,
        slideUrls.length
      );

      slides.push({
        order: i,
        title: result.title,
        contentUrl: slideUrls[i],
        contentType: "image",
        teacherNotes: result.teacherNotes,
      });

      aiBar.update(i + 1);
      if (i < slideUrls.length - 1) await sleep(2000); // Rate limit
    }

    aiBar.stop();
    console.log(`  🤖 Generated notes for ${slides.length} slides\n`);
  } else {
    // No AI or no images — create basic slide entries
    for (let i = 0; i < slideUrls.length; i++) {
      slides.push({
        order: i,
        title: `Slide ${i + 1}`,
        contentUrl: slideUrls[i],
        contentType: hasImages ? "image" : "pdf_page",
        teacherNotes: `Task: Guide students through slide ${i + 1}.\nInstructions: Display and discuss the content.`,
      });
    }
  }

  // ── Step 6: Save to database ──

  const spinner4 = ora("💾 Saving to database...").start();

  const prisma = getPrisma();

  try {
    // Find admin user if ADMIN_ID not set
    let creatorId = ADMIN_ID;
    if (!creatorId) {
      const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });
      if (!admin) die("No ADMIN user found. Set ADMIN_USER_ID in .env");
      creatorId = admin.id;
    }

    const lesson = await prisma.lesson.create({
      data: {
        id: lessonId,
        title: answers.title.trim(),
        description: answers.description?.trim() || null,
        category: answers.category,
        cefrLevel: answers.cefrLevel,
        contentType: hasImages ? "image" : "pdf",
        contentUrl: slideUrls[0] || null,
        teacherNotes: `Imported from PDF: ${path.basename(pdfPath)}`,
        slides: slides,
        createdBy: creatorId,
      },
    });

    await prisma.$disconnect();

    spinner4.succeed("💾 Saved to database");

    // ── Success ──

    console.log("\n");
    console.log("  ╔══════════════════════════════════════════╗");
    console.log("  ║   ✅  LESSON IMPORTED SUCCESSFULLY!       ║");
    console.log("  ╠══════════════════════════════════════════╣");
    console.log(`  ║  📌 Lesson ID:  ${lesson.id.slice(0, 18)}...  ║`);
    console.log(`  ║  📚 Title:      ${lesson.title.padEnd(24).slice(0, 24)} ║`);
    console.log(`  ║  📊 Slides:     ${String(slides.length).padEnd(24)} ║`);
    console.log(`  ║  🎯 CEFR:       ${answers.cefrLevel.padEnd(24)} ║`);
    console.log(`  ║  📂 Category:   ${answers.category.padEnd(24).slice(0, 24)} ║`);
    console.log("  ╠══════════════════════════════════════════╣");
    console.log("  ║  🌐 View in app:                         ║");
    console.log(`  ║  /admin/library                           ║`);
    console.log(`  ║  /classroom/${lesson.id.slice(0, 8)}...   ║`);
    console.log("  ╚══════════════════════════════════════════╝");
    console.log("\n");
  } catch (e) {
    spinner4.fail("Database save failed");
    await prisma.$disconnect();
    die(String(e));
  }

  // Cleanup temp files
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
}

main().catch((e) => {
  console.error("\n❌ Unexpected error:", e);
  process.exit(1);
});
