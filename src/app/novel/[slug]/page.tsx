import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import Cover from "@/components/Cover";
import GenrePills from "@/components/GenrePills";
import ContinueReading from "@/components/reader/ContinueReading";
import { getChapterList, getNovelBySlug, getNovelStaticParams } from "@/lib/novels";
import { formatDate, formatNumber } from "@/lib/utils";

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
    <PageShell width="max-w-4xl">
      <div className="flex flex-col gap-8 sm:flex-row">
        <Cover novel={novel} className="h-72 w-48 shrink-0 rounded-2xl" />
        <div className="space-y-4">
          <div>
            <h1 className="font-serif text-4xl leading-tight">{novel.title}</h1>
            <p className="text-mute">by {novel.author}, {novel.status}</p>
          </div>
          <GenrePills genres={novel.genres} />
          <p className="max-w-prose text-ink/85">{novel.synopsis}</p>
          <div className="flex flex-wrap items-center gap-3">
            <ContinueReading slug={slug} chapters={chapters.map((c) => c.chapter)} />
            <Link href={`/submit/${slug}`} className="rounded-lg border border-line bg-white px-5 py-2.5 hover:border-accent">Add a chapter</Link>
          </div>
        </div>
      </div>

      <h2 className="mt-12 font-serif text-2xl">Chapters</h2>
      <ol className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
        {chapters.map((c) => (
          <li key={c.chapter}>
            <Link href={`/novel/${slug}/${c.chapter}`} className="flex items-baseline gap-4 px-5 py-3 hover:bg-accent-soft">
              <span className="w-8 shrink-0 text-right font-serif text-lg text-mute">{c.chapter}</span>
              <span className="flex-1">{c.title}</span>
              <span className="hidden text-xs text-mute sm:inline">{formatNumber(c.wordCount)} words, {formatDate(c.publishedAt)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
