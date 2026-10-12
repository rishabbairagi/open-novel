import { z } from "zod";
import { countWords } from "./utils";

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MIN_WORDS = 300;

const coverField = z
  .string()
  .trim()
  .default("")
  .refine((v) => v === "" || /^https:\/\/\S+$/.test(v) || /^\/\S+$/.test(v), "Cover must be empty, an https:// URL or a /path.");

/** meta.json */
export const novelMetaSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().regex(SLUG_RE, "Use lowercase letters, numbers and hyphens."),
  author: z.string().trim().min(1).max(80),
  synopsis: z.string().trim().min(1).max(1200),
  cover: coverField,
  genres: z.array(z.string().trim().min(1).max(30)).min(1).max(6),
  status: z.enum(["Ongoing", "Completed"]),
});

/** ch-[N].md frontmatter (YAML may parse unquoted dates into Date objects). */
export const chapterFrontmatterSchema = z.object({
  chapter: z.coerce.number().int().min(1),
  title: z.string().trim().min(1).max(160),
  publishedAt: z.union([z.string(), z.date()]).transform((v) => (v instanceof Date ? v.toISOString() : v)),
  author: z.string().trim().min(1).max(80),
  wordCount: z.coerce.number().int().min(0),
});

/** Web studio payload (arrives as FormData strings). */
export const submissionSchema = z
  .object({
    mode: z.enum(["new", "existing"]),
    novelSlug: z.string().regex(SLUG_RE, "Use lowercase letters, numbers and hyphens."),
    novelTitle: z.string().trim().min(1, "Title is required.").max(120),
    author: z.string().trim().min(1, "Author name is required.").max(80),
    synopsis: z.string().trim().max(1200).default(""),
    genres: z
      .string()
      .default("")
      .transform((s) => s.split(",").map((g) => g.trim()).filter(Boolean)),
    status: z.enum(["Ongoing", "Completed"]).default("Ongoing"),
    cover: coverField,
    chapterNum: z.coerce.number().int().min(1).max(9999),
    chapterTitle: z.string().trim().min(1, "Chapter title is required.").max(160),
    content: z.string().refine((v) => countWords(v) >= MIN_WORDS, `Chapter must be at least ${MIN_WORDS} words.`),
    authorNotes: z.string().trim().max(2000).default(""),
  })
  .superRefine((d, ctx) => {
    if (d.mode !== "new") return;
    if (!d.synopsis) ctx.addIssue({ code: "custom", path: ["synopsis"], message: "Synopsis is required for a new novel." });
    if (d.genres.length === 0) ctx.addIssue({ code: "custom", path: ["genres"], message: "Add at least one genre." });
    if (d.genres.length > 6) ctx.addIssue({ code: "custom", path: ["genres"], message: "Use at most 6 genres." });
    if (d.chapterNum !== 1) ctx.addIssue({ code: "custom", path: ["chapterNum"], message: "A new novel starts at chapter 1." });
  });

export type SubmissionPayload = z.infer<typeof submissionSchema>;
