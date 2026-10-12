import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Studio from "@/components/submit/Studio";
import { getNovelSummaries } from "@/lib/novels";

export const metadata: Metadata = { title: "Write" };

export default function SubmitPage() {
  const novels = getNovelSummaries();
  return (
    <PageShell width="max-w-5xl">
      <h1 className="font-serif text-4xl">Propose a new novel</h1>
      <p className="mt-2 text-mute">
        Your novel details and first chapter are sent as a pull request for review.
        {novels.length > 0 && " Continuing an existing story instead?"}
      </p>
      {novels.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {novels.map((n) => (
            <li key={n.slug}>
              <Link href={`/submit/${n.slug}`} className="inline-block rounded-full border border-line bg-white px-3 py-1 text-sm hover:border-accent">
                Add to {n.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8"><Studio mode="new" nextChapter={1} /></div>
    </PageShell>
  );
}
