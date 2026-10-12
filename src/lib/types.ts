export type NovelStatus = "Ongoing" | "Completed";

export interface NovelMeta {
  title: string;
  slug: string;
  author: string;
  synopsis: string;
  cover: string;
  genres: string[];
  status: NovelStatus;
}

export interface ChapterFrontmatter {
  chapter: number;
  title: string;
  publishedAt: string;
  author: string;
  wordCount: number;
}

export interface ChapterSummary extends ChapterFrontmatter {
  novelSlug: string;
}

export interface ChapterData extends ChapterSummary {
  content: string;
}

export interface NovelSummary extends NovelMeta {
  chapterCount: number;
  wordCount: number;
  latest: ChapterSummary | null;
}

export interface AdjacentChapters {
  prev: ChapterSummary | null;
  next: ChapterSummary | null;
}

export type { SubmissionPayload } from "./schemas";

export type SubmitResult =
  | { success: true; prUrl: string; mock?: boolean }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
