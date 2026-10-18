import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MiniSearch from "minisearch";

const NOVELS_DIR = path.join(process.cwd(), "content", "novels");
const OUTPUT_FILE = path.join(process.cwd(), "public", "search-index.json");

function stripMarkdown(md) {
  return md
    .replace(/^---[\s\S]*?---/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#*`_~>[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function generateIndex() {
  if (!fs.existsSync(NOVELS_DIR)) {
    console.log("[Search Index] Novels directory not found, skipping.");
    return;
  }

  const docs = [];
  const novelSlugs = fs
    .readdirSync(NOVELS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const slug of novelSlugs) {
    const metaPath = path.join(NOVELS_DIR, slug, "meta.json");
    if (!fs.existsSync(metaPath)) continue;

    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    const dir = path.join(NOVELS_DIR, slug);
    const files = fs.readdirSync(dir).filter((f) => /^ch-(\d+)\.md$/.test(f));

    for (const file of files) {
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);

      docs.push({
        id: `${slug}:${data.chapter}`,
        novelSlug: slug,
        novelTitle: meta.title,
        chapter: Number(data.chapter),
        chapterTitle: String(data.title || `Chapter ${data.chapter}`),
        content: stripMarkdown(content),
      });
    }
  }

  const miniSearch = new MiniSearch({
    fields: ["novelTitle", "chapterTitle", "content"],
    storeFields: ["novelSlug", "novelTitle", "chapter", "chapterTitle"],
    searchOptions: {
      boost: { novelTitle: 3, chapterTitle: 2, content: 1 },
      prefix: true,
      fuzzy: 0.2,
    },
  });

  miniSearch.addAll(docs);

  const publicDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(miniSearch.toJSON()));
  console.log(`[Search Index] Indexed ${docs.length} chapters into ${OUTPUT_FILE}`);
}

generateIndex();