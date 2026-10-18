import type { NovelMeta } from "@/lib/types";

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Real cover when provided, otherwise a deterministic gradient from the slug. */
export default function Cover({ novel, className = "" }: { novel: Pick<NovelMeta, "title" | "slug" | "cover">; className?: string }) {
  if (novel.cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={novel.cover} alt="" loading="lazy" className={`object-cover ${className}`} />;
  }
  const h = hash(novel.slug) % 360;
  return (
    <div
      aria-hidden
      className={`flex items-end p-4 ${className}`}
      style={{ background: `linear-gradient(150deg, hsl(${h} 42% 20%), hsl(${(h + 55) % 360} 48% 40%))` }}
    >
      <span className="font-serif text-5xl leading-none text-white/90">{novel.title.charAt(0)}</span>
    </div>
  );
}
