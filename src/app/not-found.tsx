import Link from "next/link";
import PageShell from "@/components/PageShell";
import { getNovelSummaries } from "@/lib/novels";

export default function NotFound() {
  const novels = getNovelSummaries();

  return (
    <PageShell searchNovels={novels}>
      <h1 className="font-serif text-4xl">That page isn&apos;t in the library</h1>
      <p className="mt-3 text-mute">The novel or chapter may have been renamed, or it hasn&apos;t been merged yet.</p>
      <Link href="/library" className="mt-6 inline-block rounded-lg bg-accent px-4 py-2 text-white">Browse the library</Link>
    </PageShell>
  );
}
