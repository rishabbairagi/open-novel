import Link from "next/link";
import Cover from "./Cover";
import GenrePills from "./GenrePills";
import { formatDate } from "@/lib/utils";
import type { NovelSummary } from "@/lib/types";
import { BookMarked, Clock } from "lucide-react";

export default function NovelCard({ novel }: { novel: NovelSummary }) {
  return (
    <Link
      href={`/novel/${novel.slug}`}
      className="group relative flex h-full gap-5 rounded-2xl border border-[#EAE9E5] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/5"
    >
      <Cover novel={novel} className="h-40 w-28 shrink-0 rounded-xl" />
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="space-y-2">
          <div>
            <h3 className="line-clamp-1 font-serif text-xl font-bold tracking-tight text-[#111827] group-hover:text-indigo-600 transition-colors">
              {novel.title}
            </h3>
            <p className="text-xs font-medium text-[#6B7280]">by {novel.author}</p>
          </div>
          <GenrePills genres={novel.genres} />
          <p className="line-clamp-2 text-xs leading-relaxed text-[#4B5563]">
            {novel.synopsis}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#F3F2EE] pt-2.5 text-[11px] text-[#6B7280]">
          <span className="flex items-center gap-1.5 font-medium text-[#374151]">
            <BookMarked className="h-3.5 w-3.5 text-indigo-500" />
            {novel.chapterCount} {novel.chapterCount === 1 ? "chapter" : "chapters"}
          </span>
          {novel.latest && (
            <span className="flex items-center gap-1 text-[#9CA3AF]">
              <Clock className="h-3 w-3" />
              {formatDate(novel.latest.publishedAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}