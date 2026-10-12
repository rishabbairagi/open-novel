"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, List, Type, X } from "lucide-react";
import {
  DEFAULT_SETTINGS, readProgress, readSettings, writeProgress, writeSettings,
  type FontKey, type ReaderSettings, type ThemeKey,
} from "./storage";

interface Nav { chapter: number; title: string }
interface Props {
  slug: string;
  novelTitle: string;
  chapter: number;
  chapterTitle: string;
  prev: Nav | null;
  next: Nav | null;
  toc: Nav[];
  children: React.ReactNode;
}

const THEMES: Record<ThemeKey, { label: string; bg: string; fg: string; muted: string; border: string; bar: string }> = {
  white: { label: "Clean White", bg: "#ffffff", fg: "#1c1c1e", muted: "#6b7280", border: "#e5e7eb", bar: "#ffffffee" },
  sepia: { label: "Warm Sepia", bg: "#f4ecd8", fg: "#433422", muted: "#8a7558", border: "#e0d3b2", bar: "#f4ecd8ee" },
  oled: { label: "OLED Black", bg: "#000000", fg: "#d6d6d6", muted: "#8a8a8a", border: "#2a2a2a", bar: "#000000ee" },
};
const FONTS: Record<FontKey, { label: string; css: string }> = {
  serif: { label: "Serif", css: "var(--font-serif), Georgia, serif" },
  sans: { label: "Sans-serif", css: "var(--font-sans), system-ui, sans-serif" },
  mono: { label: "Monospace", css: "var(--font-mono), ui-monospace, monospace" },
};

export default function ReaderShell({ slug, novelTitle, chapter, chapterTitle, prev, next, toc, children }: Props) {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<"none" | "settings" | "toc">("none");
  const [progress, setProgress] = useState(0);

  // Load persisted settings once on the client (avoids SSR/localStorage mismatch).
  useEffect(() => {
    setSettings(readSettings());
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) writeSettings(settings);
  }, [settings, loaded]);

  // Restore + persist scroll depth per novel.
  useEffect(() => {
    const saved = readProgress(slug);
    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (saved && saved.chapter === chapter && saved.scroll > 0.01 && saved.scroll < 0.995) {
      requestAnimationFrame(() => window.scrollTo(0, saved.scroll * maxScroll()));
    } else {
      window.scrollTo(0, 0);
      writeProgress(slug, { chapter, scroll: 0, updatedAt: Date.now() });
    }
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const fraction = Math.min(1, window.scrollY / maxScroll());
        setProgress(fraction);
        writeProgress(slug, { chapter, scroll: fraction, updatedAt: Date.now() });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug, chapter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel("none");
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const t = THEMES[settings.theme];
  const vars = { "--r-fg": t.fg, "--r-muted": t.muted, "--r-border": t.border } as React.CSSProperties;
  const navBtn = "flex items-center gap-1 rounded-lg px-3 py-2 text-sm";

  return (
    <div className="min-h-screen" style={{ ...vars, background: t.bg, color: t.fg }}>
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ background: t.bar, borderColor: t.border }}>
        <div className="mx-auto flex h-12 max-w-3xl items-center gap-3 px-4">
          <Link href={`/novel/${slug}`} className="flex items-center gap-1.5 text-sm" style={{ color: t.muted }}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> <span className="truncate">{novelTitle}</span>
          </Link>
        </div>
        <div className="h-0.5" style={{ background: t.border }}>
          <div className="h-full bg-accent" style={{ width: `${progress * 100}%` }} />
        </div>
      </header>

      <article className="reader-prose prose mx-auto max-w-none px-5 pb-40 pt-10" style={{ fontSize: settings.fontSize, fontFamily: FONTS[settings.font].css }}>
        <div className="mx-auto max-w-[68ch]">
          <p className="!mb-1 text-sm" style={{ color: t.muted }}>Chapter {chapter}</p>
          <h1 className="!mt-0 !mb-8 !text-[1.9em] !leading-tight">{chapterTitle}</h1>
          {children}
        </div>
      </article>

      {panel === "settings" && (
        <div role="dialog" aria-label="Reading settings" className="fixed inset-x-3 bottom-20 z-30 mx-auto max-w-sm rounded-2xl border p-4 shadow-xl" style={{ background: t.bg, borderColor: t.border }}>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Theme</legend>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(THEMES) as ThemeKey[]).map((k) => (
                <button key={k} onClick={() => setSettings((s) => ({ ...s, theme: k }))} aria-pressed={settings.theme === k}
                  className="rounded-lg border px-2 py-2 text-xs" style={{ background: THEMES[k].bg, color: THEMES[k].fg, borderColor: settings.theme === k ? "#3340d8" : THEMES[k].border, borderWidth: settings.theme === k ? 2 : 1 }}>
                  {THEMES[k].label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="mt-4 block text-sm font-medium">
            Text size: {settings.fontSize}px
            <input type="range" min={14} max={24} step={1} value={settings.fontSize}
              onChange={(e) => setSettings((s) => ({ ...s, fontSize: Number(e.target.value) }))} className="mt-2 w-full accent-[#3340d8]" />
          </label>
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-medium">Font</legend>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(FONTS) as FontKey[]).map((k) => (
                <button key={k} onClick={() => setSettings((s) => ({ ...s, font: k }))} aria-pressed={settings.font === k}
                  className="rounded-lg border px-2 py-2 text-xs" style={{ fontFamily: FONTS[k].css, borderColor: settings.font === k ? "#3340d8" : t.border, borderWidth: settings.font === k ? 2 : 1 }}>
                  {FONTS[k].label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {panel === "toc" && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setPanel("none")}>
          <div role="dialog" aria-modal="true" aria-label="Table of contents" onClick={(e) => e.stopPropagation()}
            className="max-h-[75vh] w-full max-w-md overflow-y-auto rounded-t-2xl border p-2 sm:rounded-2xl" style={{ background: t.bg, borderColor: t.border }}>
            <div className="flex items-center justify-between px-3 py-2">
              <h2 className="font-medium">{novelTitle}</h2>
              <button onClick={() => setPanel("none")} aria-label="Close table of contents" className="rounded-lg p-1.5"><X className="h-5 w-5" /></button>
            </div>
            <ol>
              {toc.map((c) => (
                <li key={c.chapter}>
                  <Link href={`/novel/${slug}/${c.chapter}`} onClick={() => setPanel("none")} aria-current={c.chapter === chapter ? "page" : undefined}
                    className="flex gap-3 rounded-lg px-3 py-2.5 text-sm" style={c.chapter === chapter ? { background: t.border, fontWeight: 600 } : undefined}>
                    <span className="w-6 text-right" style={{ color: t.muted }}>{c.chapter}</span>{c.title}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <nav aria-label="Chapter navigation" className="fixed inset-x-0 bottom-0 z-20 border-t backdrop-blur" style={{ background: t.bar, borderColor: t.border }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-3 py-2">
          {prev ? (
            <Link href={`/novel/${slug}/${prev.chapter}`} className={navBtn} aria-label={`Previous chapter: ${prev.title}`}><ChevronLeft className="h-4 w-4" aria-hidden />Prev</Link>
          ) : <span className={`${navBtn} opacity-30`}><ChevronLeft className="h-4 w-4" aria-hidden />Prev</span>}
          <div className="flex gap-1">
            <button onClick={() => setPanel(panel === "toc" ? "none" : "toc")} className={navBtn} aria-expanded={panel === "toc"}><List className="h-4 w-4" aria-hidden />Chapters</button>
            <button onClick={() => setPanel(panel === "settings" ? "none" : "settings")} className={navBtn} aria-expanded={panel === "settings"}><Type className="h-4 w-4" aria-hidden />Aa</button>
          </div>
          {next ? (
            <Link href={`/novel/${slug}/${next.chapter}`} className={navBtn} aria-label={`Next chapter: ${next.title}`}>Next<ChevronRight className="h-4 w-4" aria-hidden /></Link>
          ) : <span className={`${navBtn} opacity-30`}>Next<ChevronRight className="h-4 w-4" aria-hidden /></span>}
        </div>
      </nav>
    </div>
  );
}
