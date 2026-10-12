const WORDS_PER_MINUTE = 230;

/** Counts words in markdown, ignoring horizontal-rule scene breaks. */
export function countWords(text: string): number {
  const cleaned = text.replace(/^\s*(\*{3,}|-{3,}|_{3,})\s*$/gm, " ");
  return cleaned.trim().split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(words: number): number {
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
