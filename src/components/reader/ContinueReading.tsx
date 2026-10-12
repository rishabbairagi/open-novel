"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { progressKey, readProgress } from "./storage";

export default function ContinueReading({ slug, chapters }: { slug: string; chapters: number[] }) {
  const [saved, setSaved] = useState<number | null>(null);

  useEffect(() => {
    const p = readProgress(slug);
    if (p && chapters.includes(p.chapter)) setSaved(p.chapter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const first = chapters[0];
  if (first === undefined) return null;
  const href = `/novel/${slug}/${saved ?? first}`;
  return (
    <Link href={href} data-key={progressKey(slug)} className="inline-block rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent-deep">
      {saved ? `Continue chapter ${saved}` : "Start reading"}
    </Link>
  );
}
