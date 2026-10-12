import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import NovelCard from "@/components/NovelCard";
import { getNovelSummaries } from "@/lib/novels";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  const novels = getNovelSummaries();
  return (
    <PageShell>
      <h1 className="font-serif text-4xl">Library</h1>
      <p className="mt-2 text-mute">{novels.length} novels, newest updates first.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {novels.map((n) => <NovelCard key={n.slug} novel={n} />)}
      </div>
    </PageShell>
  );
}
