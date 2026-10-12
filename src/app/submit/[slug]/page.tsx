import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import Studio from "@/components/submit/Studio";
import { getChapterList, getNovelBySlug, getNovelStaticParams } from "@/lib/novels";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getNovelStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const novel = getNovelBySlug(slug);
  return { title: novel ? `Add a chapter to ${novel.title}` : "Write" };
}

export default async function SubmitChapterPage({ params }: { params: Params }) {
  const { slug } = await params;
  const novel = getNovelBySlug(slug);
  if (!novel) notFound();
  const last = getChapterList(slug).at(-1)?.chapter ?? 0;

  return (
    <PageShell width="max-w-5xl">
      <h1 className="font-serif text-4xl">Add a chapter to {novel.title}</h1>
      <p className="mt-2 text-mute">Chapter {last + 1} is next. The maintainers review it before it appears.</p>
      <div className="mt-8">
        <Studio mode="existing" novel={{ slug, title: novel.title, author: novel.author }} nextChapter={last + 1} />
      </div>
    </PageShell>
  );
}
