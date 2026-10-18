"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, List, Type, X } from "lucide-react";
import {
  DEFAULT_SETTINGS,
  readProgress,
  readSettings,
  writeProgress,
  writeSettings,
  type FontKey,
  type ReaderSettings,
  type ThemeKey,
} from "./storage";

interface Nav {
  chapter: number;
  title: string;
}
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

const THEMES: Record<
  ThemeKey,
  { label: string; bg: string; fg: string; muted: string; border: string; bar: string }
> = {
  white: {
    label: "Clean White",
    bg: "#FAFAF9",
    fg: "#1C1917",
    muted: "#78716C",
    border: "#E7E5E4",
    bar: "#FAFAF9F0",
  },
  sepia: {
    label: "Warm Sepia",
    bg: "#F5EFE6",
    fg: "#443627",
    muted: "#8C7A6B",
    border: "#E8DFD1",
    bar: "#F5EFE6F0",
  },
  oled: {
    label: "OLED Black",
    bg: "#0A0A0A",
    fg: "#E5E5E5",
    muted: "#737373",
    border: "#262626",
    bar: "#0A0A0AF0",
  },
};

const FONTS: Record<FontKey, { label: string; css: string }> = {
  serif: { label: "Serif", css: "var(--font-serif), Georgia, serif" },
  sans: { label: "Sans-serif", css: "var(--font-sans), system-ui, sans-serif" },
  mono: { label: "Monospace", css: "var(--font-mono), ui-monospace, monospace" },
};

export default function ReaderShell({
  slug,
  novelTitle,
  chapter,
  chapterTitle,
  prev,
  next,
  toc,
  children,
}: Props) {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<"none" | "settings" | "toc">("none");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setSettings(readSettings());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeSettings(settings);
  }, [settings, loaded]);

  useEffect(() => {
    const saved = readProgress(slug);
    const maxScroll = () =>
      Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

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
  const vars = {
    "--r-fg": t.fg,
    "--r-muted": t.muted,
    "--r-border": t.border,
  } as React.CSSProperties;

  const navBtn =
    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition active:scale-95";

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ ...vars, background: t.bg, color: t.fg }}
    >
      {/* Top Navbar */}
      <header
        className="sticky top-0 z-20 border-b backdrop-blur-md transition-colors"
        style={{ background: t.bar, borderColor: t.border }}
      >
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link
            href={`/novel/${slug}`}
            className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase transition hover:opacity-80"
            style={{ color: t.muted }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span className="truncate max-w-[200px] sm:max-w-xs">{novelTitle}</span>
          </Link>

          <div className="flex items-center gap-2 text-xs" style={{ color: t.muted }}>
            <span>Ch. {chapter}</span>
            <span>·</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
        </div>

        {/* Reading Progress Indicator */}
        <div className="h-0.5 w-full" style={{ background: t.border }}>
          <div
            className="h-full bg-indigo-600 transition-all duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </header>

      {/* Reader Prose */}
      <article
        className="reader-prose prose mx-auto max-w-none px-6 pb-48 pt-14"
        style={{ fontSize: settings.fontSize, fontFamily: FONTS[settings.font].css }}
      >
        <div className="mx-auto max-w-[65ch]">
          <div className="mb-6 space-y-1">
            <span
              className="font-mono text-xs font-semibold uppercase tracking-widest"
              style={{ color: t.muted }}
            >
              Chapter {chapter}
            </span>
            <h1 className="!mt-0 !text-[2.1em] !font-serif !font-bold !tracking-tight !leading-tight">
              {chapterTitle}
            </h1>
          </div>
          {children}
        </div>
      </article>

      {/* Settings Dialog */}
      {panel === "settings" && (
        <div
          role="dialog"
          aria-label="Reading settings"
          className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-sm rounded-3xl border p-5 shadow-2xl backdrop-blur-md"
          style={{ background: t.bar, borderColor: t.border }}
        >
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: t.muted }}>
              Palette
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(THEMES) as ThemeKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setSettings((s) => ({ ...s, theme: k }))}
                  aria-pressed={settings.theme === k}
                  className="rounded-xl border p-2 text-center text-xs font-medium transition"
                  style={{
                    background: THEMES[k].bg,
                    color: THEMES[k].fg,
                    borderColor: settings.theme === k ? "#4F46E5" : THEMES[k].border,
                    boxShadow: settings.theme === k ? "0 0 0 1px #4F46E5" : "none",
                  }}
                >
                  {THEMES[k].label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-5 block text-xs font-semibold uppercase tracking-wider" style={{ color: t.muted }}>
            Size: <span className="font-mono text-sm">{settings.fontSize}px</span>
            <input
              type="range"
              min={14}
              max={24}
              step={1}
              value={settings.fontSize}
              onChange={(e) =>
                setSettings((s) => ({ ...s, fontSize: Number(e.target.value) }))
              }
              className="mt-2 w-full accent-indigo-600"
            />
          </label>

          <fieldset className="mt-5">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: t.muted }}>
              Typography
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(FONTS) as FontKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setSettings((s) => ({ ...s, font: k }))}
                  aria-pressed={settings.font === k}
                  className="rounded-xl border p-2 text-xs font-medium transition"
                  style={{
                    fontFamily: FONTS[k].css,
                    borderColor: settings.font === k ? "#4F46E5" : t.border,
                    boxShadow: settings.font === k ? "0 0 0 1px #4F46E5" : "none",
                  }}
                >
                  {FONTS[k].label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {/* Table of Contents Modal */}
      {panel === "toc" && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:items-center sm:p-4"
          onClick={() => setPanel("none")}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Table of contents"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-3xl border p-5 shadow-2xl sm:rounded-3xl"
            style={{ background: t.bg, borderColor: t.border }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: t.border }}>
              <h2 className="font-serif text-lg font-bold">{novelTitle}</h2>
              <button
                onClick={() => setPanel("none")}
                aria-label="Close table of contents"
                className="rounded-lg p-1.5 transition hover:opacity-75"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ol className="mt-3 divide-y" style={{ borderColor: t.border }}>
              {toc.map((c) => (
                <li key={c.chapter}>
                  <Link
                    href={`/novel/${slug}/${c.chapter}`}
                    onClick={() => setPanel("none")}
                    aria-current={c.chapter === chapter ? "page" : undefined}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition"
                    style={
                      c.chapter === chapter
                        ? { background: t.border, fontWeight: 700 }
                        : undefined
                    }
                  >
                    <span className="w-6 font-mono text-xs opacity-60" style={{ color: t.muted }}>
                      {String(c.chapter).padStart(2, "0")}
                    </span>
                    <span className="truncate">{c.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar */}
      <nav
        aria-label="Chapter navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-md"
        style={{ background: t.bar, borderColor: t.border }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2.5">
          {prev ? (
            <Link
              href={`/novel/${slug}/${prev.chapter}`}
              className={navBtn}
              style={{ border: `1px solid ${t.border}` }}
              aria-label={`Previous chapter: ${prev.title}`}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              <span>Prev</span>
            </Link>
          ) : (
            <span className={`${navBtn} opacity-30 cursor-not-allowed`} style={{ border: `1px solid ${t.border}` }}>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              <span>Prev</span>
            </span>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setPanel(panel === "toc" ? "none" : "toc")}
              className={navBtn}
              style={{ border: `1px solid ${t.border}` }}
              aria-expanded={panel === "toc"}
            >
              <List className="h-4 w-4" aria-hidden />
              <span>Index</span>
            </button>
            <button
              onClick={() => setPanel(panel === "settings" ? "none" : "settings")}
              className={navBtn}
              style={{ border: `1px solid ${t.border}` }}
              aria-expanded={panel === "settings"}
            >
              <Type className="h-4 w-4" aria-hidden />
              <span>Theme</span>
            </button>
          </div>

          {next ? (
            <Link
              href={`/novel/${slug}/${next.chapter}`}
              className={navBtn}
              style={{ border: `1px solid ${t.border}` }}
              aria-label={`Next chapter: ${next.title}`}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span className={`${navBtn} opacity-30 cursor-not-allowed`} style={{ border: `1px solid ${t.border}` }}>
              <span>Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          )}
        </div>
      </nav>
    </div>
  );
}