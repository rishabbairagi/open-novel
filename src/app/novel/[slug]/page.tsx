import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import Cover from "@/components/Cover";
import GenrePills from "@/components/GenrePills";
import ContinueReading from "@/components/reader/ContinueReading";
import { getChapterList, getNovelBySlug, getNovelStaticParams } from "@/lib/novels";
import { formatDate, formatNumber } from "@/lib/utils";
import { BookOpen, Calendar, Clock, Feather, PlusCircle } from "lucide-react";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getNovelStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const novel = getNovelBySlug(slug);
  return novel ? { title: novel.title, description: novel.synopsis } : {};
}

export default async function NovelPage({ params }: { params: Params }) {
  const { slug } = await params;
  const novel = getNovelBySlug(slug);
  if (!novel) notFound();
  const chapters = getChapterList(slug);

  return (
    <PageShell width="w-full">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <Cover novel={novel} className="h-80 w-52 shrink-0 rounded-2xl shadow-xl ring-1 ring-black/10" />
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                {novel.status}
              </span>
              <span className="text-xs text-[#6B7280]">
                {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"}
              </span>
            </div>
            <h1 className="font-serif text-4xl font-extrabold tracking-tight text-[#111827] sm:text-5xl">
              {novel.title}
            </h1>
            <p className="flex items-center gap-1.5 text-sm font-medium text-[#4B5563]">
              <Feather className="h-4 w-4 text-indigo-500" /> Written by {novel.author}
            </p>
          </div>

          <GenrePills genres={novel.genres} />

          <p className="max-w-prose text-sm leading-relaxed text-[#374151]">
            {novel.synopsis}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <ContinueReading slug={slug} chapters={chapters.map((c) => c.chapter)} />
            <Link
              href={`/submit/${slug}`}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4" />
              Add chapter
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-14 border-t border-[#EAE9E5] pt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#111827]">
            Table of Contents
          </h2>
          <span className="text-xs text-[#6B7280]">Ascending order</span>
        </div>

        <ol className="mt-5 divide-y divide-[#F3F2EE] rounded-2xl border border-[#EAE9E5] bg-white shadow-sm overflow-hidden">
          {chapters.map((c) => (
            <li key={c.chapter}>
              <Link
                href={`/novel/${slug}/${c.chapter}`}
                className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-indigo-50/50"
              >
                <span className="w-8 shrink-0 text-right font-mono text-sm font-semibold text-[#9CA3AF] group-hover:text-indigo-600">
                  {String(c.chapter).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm font-medium text-[#1F2937] group-hover:text-indigo-600">
                  {c.title}
                </span>
                <div className="hidden items-center gap-4 text-xs text-[#9CA3AF] sm:flex">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {formatNumber(c.wordCount)} words
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(c.publishedAt)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </PageShell>
  );
}