import Link from "next/link";
import { ArrowRight, BookOpen, GitPullRequest, Layers, Sparkles } from "lucide-react";
import PageShell from "@/components/PageShell";
import NovelCard from "@/components/NovelCard";
import Cover from "@/components/Cover";
import GenrePills from "@/components/GenrePills";
import { getLatestChapters, getNovelSummaries } from "@/lib/novels";
import { formatDate, formatNumber } from "@/lib/utils";

export default function HomePage() {
  const novels = getNovelSummaries();
  const [featured, ...rest] = novels;
  const latest = getLatestChapters(5);
  const totalChapters = novels.reduce((s, n) => s + n.chapterCount, 0);
  const totalWords = novels.reduce((s, n) => s + n.wordCount, 0);

  return (
    <PageShell>
      <section className="mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs font-medium text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" />
          The Git-Native Web Novel Network
        </div>
        <h1 className="font-serif text-5xl font-bold tracking-tight text-[#111827] sm:text-6xl sm:leading-[1.1]">
          Stories published in the open.
        </h1>
        <p className="text-lg leading-relaxed text-[#52525B]">
          No accounts, paywalls, or trackers. Every novel is an open repository of Markdown files, revised and merged through community pull requests.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {featured && (
          <Link
            href={`/novel/${featured.slug}`}
            className="group relative min-h-[26rem] overflow-hidden rounded-3xl border border-black/5 shadow-md md:col-span-2 md:row-span-2 transition-all duration-300 hover:shadow-xl hover:shadow-black/10"
          >
            <Cover novel={featured} className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
            <div className="relative flex h-full min-h-[26rem] flex-col justify-end gap-3.5 p-8 text-white">
              <GenrePills genres={featured.genres} onDark />
              <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                {featured.title}
              </h2>
              <p className="line-clamp-3 max-w-md text-sm leading-relaxed text-white/80">
                {featured.synopsis}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-white/90">
                <span className="rounded-md bg-white/20 px-2 py-1 backdrop-blur-sm">
                  {featured.chapterCount} chapters
                </span>
                <span>by {featured.author}</span>
                <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </div>
            </div>
          </Link>
        )}

        {/* Latest Chapters Feed */}
        <section className="rounded-3xl border border-[#EAE9E5] bg-white p-6 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between border-b border-[#F3F2EE] pb-3">
            <h2 className="font-serif text-xl font-bold text-[#111827]">Latest releases</h2>
            <span className="text-xs font-medium uppercase tracking-wider text-indigo-600">Fresh chapters</span>
          </div>
          <ul className="mt-4 divide-y divide-[#F3F2EE]">
            {latest.map(({ novel, chapter }) => (
              <li key={`${novel.slug}-${chapter.chapter}`}>
                <Link
                  href={`/novel/${novel.slug}/${chapter.chapter}`}
                  className="group flex items-baseline justify-between gap-4 py-3 transition hover:text-indigo-600"
                >
                  <div className="min-w-0 truncate text-sm">
                    <span className="font-semibold text-[#1F2937] group-hover:text-indigo-600">
                      {novel.title}
                    </span>
                    <span className="text-[#6B7280]"> · Ch. {chapter.chapter}: {chapter.title}</span>
                  </div>
                  <time
                    className="shrink-0 font-mono text-[11px] text-[#9CA3AF]"
                    dateTime={chapter.publishedAt}
                  >
                    {formatDate(chapter.publishedAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Action card: Studio */}
        <Link
          href="/submit"
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-indigo-600 p-6 text-white shadow-md transition-all duration-300 hover:bg-indigo-700 hover:shadow-indigo-500/25"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
              <GitPullRequest className="h-6 w-6 text-white" aria-hidden />
            </div>
            <ArrowRight className="h-5 w-5 text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-white" />
          </div>
          <div className="mt-8">
            <h2 className="font-serif text-2xl font-bold leading-tight">Publish a chapter</h2>
            <p className="mt-1.5 text-xs text-indigo-100">
              Draft with live markdown preview. We open the GitHub pull request automatically.
            </p>
          </div>
        </Link>

        {/* Metrics card */}
        <section className="flex flex-col justify-between rounded-3xl border border-[#EAE9E5] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            <Layers className="h-4 w-4" />
            Library stats
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-[#F3F2EE] pt-4 text-center">
            <div>
              <dt className="sr-only">Novels</dt>
              <dd className="font-serif text-2xl font-bold text-[#111827]">{novels.length}</dd>
              <span className="text-[11px] text-[#6B7280]">novels</span>
            </div>
            <div>
              <dt className="sr-only">Chapters</dt>
              <dd className="font-serif text-2xl font-bold text-[#111827]">{totalChapters}</dd>
              <span className="text-[11px] text-[#6B7280]">chapters</span>
            </div>
            <div>
              <dt className="sr-only">Words</dt>
              <dd className="font-serif text-2xl font-bold text-[#111827]">{formatNumber(totalWords)}</dd>
              <span className="text-[11px] text-[#6B7280]">words</span>
            </div>
          </dl>
        </section>

        {rest.map((n) => (
          <div key={n.slug} className="md:col-span-2">
            <NovelCard novel={n} />
          </div>
        ))}
      </div>
    </PageShell>
  );
}