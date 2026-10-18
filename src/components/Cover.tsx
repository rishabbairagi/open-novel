import type { NovelMeta } from "@/lib/types";

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export default function Cover({
  novel,
  className = "",
}: {
  novel: Pick<NovelMeta, "title" | "slug" | "cover">;
  className?: string;
}) {
  if (novel.cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <div className={`relative overflow-hidden shadow-md ring-1 ring-black/5 ${className}`}>
        <img
          src={novel.cover}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* Subtle spine glare effect */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
      </div>
    );
  }

  const h = hash(novel.slug) % 360;
  return (
    <div
      aria-hidden
      className={`relative flex flex-col justify-between overflow-hidden p-5 shadow-md ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-[1.02] ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${h} 38% 18%), hsl(${(h + 45) % 360} 44% 32%))`,
      }}
    >
      {/* Book spine line & subtle paper grain texture overlay */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2.5 bg-black/25 backdrop-blur-[0.5px]" />
      <div className="pointer-events-none absolute inset-y-0 left-2.5 w-0.5 bg-white/15" />

      <div className="text-right text-[10px] font-mono uppercase tracking-widest text-white/40">
        Volume 1
      </div>
      <div className="relative z-10 flex flex-col items-start">
        <span className="font-serif text-5xl font-light leading-none text-white/90 drop-shadow-sm">
          {novel.title.charAt(0)}
        </span>
        <span className="mt-1 line-clamp-2 font-serif text-xs font-medium text-white/75">
          {novel.title}
        </span>
      </div>
    </div>
  );
}