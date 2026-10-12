import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import ReaderShell from "@/components/reader/ReaderShell";
import { getAdjacentChapters, getChapter, getChapterList, getChapterStaticParams, getNovelBySlug } from "@/lib/novels";

type Params = Promise<{ slug: string; chapter: string }>;

export function generateStaticParams() {
  return getChapterStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, chapter } = await params;
  const novel = getNovelBySlug(slug);
  const data = novel ? getChapter(slug, Number(chapter)) : null;
  return novel && data ? { title: `${data.title}, ${novel.title}` } : {};
}

export default async function ChapterPage({ params }: { params: Params }) {
  const { slug, chapter } = await params;
  const num = Number(chapter);
  const novel = getNovelBySlug(slug);
  const data = novel ? getChapter(slug, num) : null;
  if (!novel || !data) notFound();

  const { prev, next } = getAdjacentChapters(slug, num);
  const nav = (c: { chapter: number; title: string } | null) => (c ? { chapter: c.chapter, title: c.title } : null);

  return (
    <ReaderShell
      slug={slug}
      novelTitle={novel.title}
      chapter={num}
      chapterTitle={data.title}
      prev={nav(prev)}
      next={nav(next)}
      toc={getChapterList(slug).map((c) => ({ chapter: c.chapter, title: c.title }))}
    >
      <Markdown>{data.content}</Markdown>
    </ReaderShell>
  );
}
