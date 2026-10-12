import Link from "next/link";
import { ArrowRight, GitPullRequest } from "lucide-react";
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
      <section className="mb-8 max-w-2xl">
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">Read novels the community publishes in the open.</h1>
        <p className="mt-3 text-lg text-mute">No accounts, no ads. Every chapter is a Markdown file in Git, reviewed through a pull request.</p>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {featured && (
          <Link
            href={`/novel/${featured.slug}`}
            className="group relative min-h-[22rem] overflow-hidden rounded-[2rem] md:col-span-2 md:row-span-2"
          >
            <Cover novel={featured} className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="relative flex h-full min-h-[22rem] flex-col justify-end gap-3 p-7 text-white">
              <GenrePills genres={featured.genres} onDark />
              <h2 className="font-serif text-4xl leading-tight">{featured.title}</h2>
              <p className="line-clamp-4 max-w-md text-white/85">{featured.synopsis}</p>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                {featured.chapterCount} chapters by {featured.author} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </div>
          </Link>
        )}

        <section className="rounded-2xl border border-line bg-white p-5 md:col-span-2">
          <h2 className="font-serif text-xl">Latest chapters</h2>
          <ul className="mt-3 divide-y divide-line">
            {latest.map(({ novel, chapter }) => (
              <li key={`${novel.slug}-${chapter.chapter}`}>
                <Link href={`/novel/${novel.slug}/${chapter.chapter}`} className="flex items-baseline justify-between gap-3 py-2 hover:text-accent">
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{novel.title}</span>
                    <span className="text-mute">, ch. {chapter.chapter}: {chapter.title}</span>
                  </span>
                  <time className="shrink-0 text-xs text-mute" dateTime={chapter.publishedAt}>{formatDate(chapter.publishedAt)}</time>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Link href="/submit" className="group flex flex-col justify-between rounded-3xl bg-accent p-5 text-white transition-colors hover:bg-accent-deep">
          <GitPullRequest className="h-6 w-6" aria-hidden />
          <div>
            <h2 className="mt-8 font-serif text-2xl leading-tight">Publish your chapter</h2>
            <p className="mt-1 text-sm text-white/80">Write in the browser. We open the pull request for you.</p>
          </div>
        </Link>

        <section className="flex flex-col justify-between rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-mute">In the library</p>
          <dl className="mt-4 space-y-1">
            <div className="flex items-baseline gap-2"><dt className="sr-only">Novels</dt><dd className="font-serif text-3xl">{novels.length}</dd><span className="text-sm text-mute">novels</span></div>
            <div className="flex items-baseline gap-2"><dt className="sr-only">Chapters</dt><dd className="font-serif text-3xl">{totalChapters}</dd><span className="text-sm text-mute">chapters</span></div>
            <div className="flex items-baseline gap-2"><dt className="sr-only">Words</dt><dd className="font-serif text-3xl">{formatNumber(totalWords)}</dd><span className="text-sm text-mute">words</span></div>
          </dl>
        </section>

        {rest.map((n) => (
          <div key={n.slug} className="md:col-span-2"><NovelCard novel={n} /></div>
        ))}
      </div>
    </PageShell>
  );
}
