import Link from "next/link";
import Cover from "./Cover";
import GenrePills from "./GenrePills";
import { formatDate } from "@/lib/utils";
import type { NovelSummary } from "@/lib/types";

export default function NovelCard({ novel }: { novel: NovelSummary }) {
  return (
    <Link
      href={`/novel/${novel.slug}`}
      className="group flex h-full gap-4 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-accent"
    >
      <Cover novel={novel} className="h-36 w-24 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <h3 className="font-serif text-xl leading-tight group-hover:text-accent">{novel.title}</h3>
          <p className="text-sm text-mute">{novel.author}</p>
        </div>
        <GenrePills genres={novel.genres} />
        <p className="line-clamp-3 text-sm text-ink/80">{novel.synopsis}</p>
        <p className="mt-auto text-xs text-mute">
          {novel.status}, {novel.chapterCount} {novel.chapterCount === 1 ? "chapter" : "chapters"}
          {novel.latest ? `, updated ${formatDate(novel.latest.publishedAt)}` : ""}
        </p>
      </div>
    </Link>
  );
}
