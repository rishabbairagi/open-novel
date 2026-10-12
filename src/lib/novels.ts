import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ZodError } from "zod";
import { SLUG_RE, chapterFrontmatterSchema, novelMetaSchema } from "./schemas";
import type { AdjacentChapters, ChapterData, ChapterSummary, NovelMeta, NovelSummary } from "./types";

const NOVELS_DIR = path.join(process.cwd(), "content", "novels");
const CHAPTER_FILE = /^ch-(\d+)\.md$/;

function describe(file: string, error: ZodError): Error {
  const issues = error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
  return new Error(`Invalid content in ${path.relative(process.cwd(), file)} -> ${issues}`);
}

function listNovelSlugs(): string[] {
  if (!fs.existsSync(NOVELS_DIR)) return [];
  return fs
    .readdirSync(NOVELS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && SLUG_RE.test(d.name))
    .map((d) => d.name)
    .sort();
}

function readMeta(slug: string): NovelMeta {
  const file = path.join(NOVELS_DIR, slug, "meta.json");
  let json: unknown;
  try {
    json = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`Cannot read ${path.relative(process.cwd(), file)}: ${(e as Error).message}`);
  }
  const parsed = novelMetaSchema.safeParse(json);
  if (!parsed.success) throw describe(file, parsed.error);
  if (parsed.data.slug !== slug) throw new Error(`meta.json slug "${parsed.data.slug}" must match its folder name "${slug}".`);
  return parsed.data;
}

function chapterFiles(slug: string): { num: number; file: string }[] {
  const dir = path.join(NOVELS_DIR, slug);
  return fs
    .readdirSync(dir)
    .flatMap((name) => {
      const m = CHAPTER_FILE.exec(name);
      return m ? [{ num: Number(m[1]), file: path.join(dir, name) }] : [];
    })
    .sort((a, b) => a.num - b.num);
}

function readChapter(slug: string, num: number, file: string): ChapterData {
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const parsed = chapterFrontmatterSchema.safeParse(data);
  if (!parsed.success) throw describe(file, parsed.error);
  if (parsed.data.chapter !== num) {
    throw new Error(`${path.relative(process.cwd(), file)}: frontmatter chapter ${parsed.data.chapter} does not match filename.`);
  }
  return { ...parsed.data, novelSlug: slug, content: content.trim() };
}

function toSummary({ content: _content, ...summary }: ChapterData): ChapterSummary {
  return summary;
}

export function getAllNovels(): NovelMeta[] {
  return listNovelSlugs().map(readMeta);
}

export function getNovelBySlug(slug: string): NovelMeta | null {
  if (!SLUG_RE.test(slug) || !fs.existsSync(path.join(NOVELS_DIR, slug, "meta.json"))) return null;
  return readMeta(slug);
}

/** Chapter summaries (no body) in reading order. */
export function getChapterList(slug: string): ChapterSummary[] {
  if (!getNovelBySlug(slug)) return [];
  return chapterFiles(slug).map(({ num, file }) => toSummary(readChapter(slug, num, file)));
}

export function getChapter(slug: string, chapterNum: number): ChapterData | null {
  if (!getNovelBySlug(slug) || !Number.isInteger(chapterNum)) return null;
  const entry = chapterFiles(slug).find((c) => c.num === chapterNum);
  return entry ? readChapter(slug, entry.num, entry.file) : null;
}

export function getAdjacentChapters(slug: string, chapterNum: number): AdjacentChapters {
  const list = getChapterList(slug);
  const i = list.findIndex((c) => c.chapter === chapterNum);
  if (i === -1) return { prev: null, next: null };
  return { prev: list[i - 1] ?? null, next: list[i + 1] ?? null };
}

export function getNovelSummaries(): NovelSummary[] {
  return getAllNovels()
    .map((novel) => {
      const chapters = getChapterList(novel.slug);
      const latest = [...chapters].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0] ?? null;
      return { ...novel, chapterCount: chapters.length, wordCount: chapters.reduce((s, c) => s + c.wordCount, 0), latest };
    })
    .sort((a, b) => (b.latest?.publishedAt ?? "").localeCompare(a.latest?.publishedAt ?? ""));
}

export function getLatestChapters(limit: number): { novel: NovelMeta; chapter: ChapterSummary }[] {
  return getAllNovels()
    .flatMap((novel) => getChapterList(novel.slug).map((chapter) => ({ novel, chapter })))
    .sort((a, b) => b.chapter.publishedAt.localeCompare(a.chapter.publishedAt))
    .slice(0, limit);
}

/** Params for /novel/[slug] */
export function getNovelStaticParams(): { slug: string }[] {
  return listNovelSlugs().map((slug) => ({ slug }));
}

/** Params for /novel/[slug]/[chapter] */
export function getChapterStaticParams(): { slug: string; chapter: string }[] {
  return listNovelSlugs().flatMap((slug) => chapterFiles(slug).map((c) => ({ slug, chapter: String(c.num) })));
}
