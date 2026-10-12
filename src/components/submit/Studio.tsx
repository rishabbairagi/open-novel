"use client";

import { useRef, useState, useTransition } from "react";
import { Bold, CheckCircle2, ExternalLink, Eye, Italic, PenLine, Quote, SeparatorHorizontal, X } from "lucide-react";
import Markdown from "@/components/Markdown";
import { submitChapterAction } from "@/app/actions/submit-chapter";
import { MIN_WORDS, submissionSchema } from "@/lib/schemas";
import { countWords, readingMinutes, slugify } from "@/lib/utils";
import type { SubmitResult } from "@/lib/types";

interface Props {
  mode: "new" | "existing";
  novel?: { slug: string; title: string; author: string };
  nextChapter: number;
}
type Errors = Record<string, string[] | undefined>;

const field = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm";

export default function Studio({ mode, novel, nextChapter }: Props) {
  const [v, setV] = useState({
    novelTitle: novel?.title ?? "", novelSlug: novel?.slug ?? "", author: "", synopsis: "", genres: "",
    status: "Ongoing", cover: "", chapterNum: String(nextChapter), chapterTitle: "", authorNotes: "",
  });
  const [content, setContent] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<SubmitResult, { success: true }> | null>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [pending, startTransition] = useTransition();
  const ta = useRef<HTMLTextAreaElement>(null);

  const words = countWords(content);
  const minutes = readingMinutes(words);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setV((s) => {
      const next = { ...s, [k]: value };
      if (k === "novelTitle" && mode === "new" && !slugTouched) next.novelSlug = slugify(value);
      return next;
    });
  };

  // ---- editor helpers ----
  const edit = (build: (before: string, sel: string, after: string) => { text: string; selStart: number; selEnd: number }) => {
    const el = ta.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const r = build(content.slice(0, s), content.slice(s, e), content.slice(e));
    setContent(r.text);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(r.selStart, r.selEnd); });
  };
  const wrap = (mark: string, placeholder: string) =>
    edit((b, sel, a) => {
      const inner = sel || placeholder;
      return { text: `${b}${mark}${inner}${mark}${a}`, selStart: b.length + mark.length, selEnd: b.length + mark.length + inner.length };
    });
  const sceneBreak = () =>
    edit((b, _s, a) => {
      const pre = b === "" || b.endsWith("\n\n") ? "" : b.endsWith("\n") ? "\n" : "\n\n";
      const ins = `${pre}***\n\n`;
      return { text: b + ins + a, selStart: b.length + ins.length, selEnd: b.length + ins.length };
    });
  const dialogue = () =>
    edit((b, sel, a) => {
      const lineStart = b.lastIndexOf("\n") + 1;
      const head = b.slice(0, lineStart);
      const block = b.slice(lineStart) + (sel || "\u201C\u201D");
      const quoted = block.split("\n").map((l) => (l.startsWith("> ") ? l : `> ${l}`)).join("\n");
      return { text: head + quoted + a, selStart: head.length + quoted.length, selEnd: head.length + quoted.length };
    });
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    if (e.key === "b") { e.preventDefault(); wrap("**", "bold text"); }
    if (e.key === "i") { e.preventDefault(); wrap("*", "italic text"); }
  };

  // ---- submit ----
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const payload = { mode, ...v, content };
    const check = submissionSchema.safeParse(payload);
    if (!check.success) {
      setErrors(check.error.flatten().fieldErrors);
      setFormError("Fix the highlighted fields, then submit again.");
      return;
    }
    setErrors({});
    const fd = new FormData();
    Object.entries(payload).forEach(([k, val]) => fd.append(k, String(val)));
    startTransition(async () => {
      const res = await submitChapterAction(fd);
      if (res.success) setResult(res);
      else { setErrors(res.fieldErrors ?? {}); setFormError(res.error); }
    });
  };

  const err = (k: string) => errors[k]?.[0] && <p role="alert" className="mt-1 text-xs text-red-700">{errors[k]?.[0]}</p>;
  const tool = "flex h-8 items-center gap-1 rounded-md px-2 text-sm hover:bg-accent-soft";

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <section className="grid gap-4 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2">
        <label className="text-sm font-medium">Novel title
          <input className={`${field} mt-1 font-normal`} value={v.novelTitle} onChange={set("novelTitle")} readOnly={mode === "existing"} maxLength={120} />
          {err("novelTitle")}
        </label>
        <label className="text-sm font-medium">Your name
          <input className={`${field} mt-1 font-normal`} value={v.author} onChange={set("author")} maxLength={80} placeholder={novel?.author} />
          {err("author")}
        </label>
        {mode === "new" && (
          <>
            <label className="text-sm font-medium">URL slug
              <input className={`${field} mt-1 font-mono font-normal`} value={v.novelSlug} maxLength={60}
                onChange={(e) => { setSlugTouched(true); set("novelSlug")(e); }} />
              {err("novelSlug")}
            </label>
            <label className="text-sm font-medium">Status
              <select className={`${field} mt-1 font-normal`} value={v.status} onChange={set("status")}>
                <option>Ongoing</option><option>Completed</option>
              </select>
            </label>
            <label className="text-sm font-medium sm:col-span-2">Synopsis
              <textarea className={`${field} mt-1 font-normal`} rows={3} value={v.synopsis} onChange={set("synopsis")} maxLength={1200} />
              {err("synopsis")}
            </label>
            <label className="text-sm font-medium">Genres <span className="font-normal text-mute">(comma separated)</span>
              <input className={`${field} mt-1 font-normal`} value={v.genres} onChange={set("genres")} placeholder="Fantasy, Adventure" />
              {err("genres")}
            </label>
            <label className="text-sm font-medium">Cover URL <span className="font-normal text-mute">(optional, https)</span>
              <input className={`${field} mt-1 font-normal`} value={v.cover} onChange={set("cover")} />
              {err("cover")}
            </label>
          </>
        )}
        <label className="text-sm font-medium">Chapter number
          <input type="number" min={1} className={`${field} mt-1 font-normal`} value={v.chapterNum} onChange={set("chapterNum")} readOnly={mode === "new"} />
          {err("chapterNum")}
        </label>
        <label className="text-sm font-medium">Chapter title
          <input className={`${field} mt-1 font-normal`} value={v.chapterTitle} onChange={set("chapterTitle")} maxLength={160} />
          {err("chapterTitle")}
        </label>
      </section>

      <section className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center gap-1 border-b border-line p-2">
          <button type="button" className={tool} onClick={() => wrap("**", "bold text")} title="Bold (Ctrl/Cmd+B)"><Bold className="h-4 w-4" />Bold</button>
          <button type="button" className={tool} onClick={() => wrap("*", "italic text")} title="Italic (Ctrl/Cmd+I)"><Italic className="h-4 w-4" />Italic</button>
          <button type="button" className={tool} onClick={sceneBreak}><SeparatorHorizontal className="h-4 w-4" />Scene break</button>
          <button type="button" className={tool} onClick={dialogue}><Quote className="h-4 w-4" />Dialogue</button>
          <div role="tablist" aria-label="Editor view" className="ml-auto flex rounded-lg bg-paper p-0.5 lg:hidden">
            <button type="button" role="tab" aria-selected={tab === "write"} onClick={() => setTab("write")} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-sm ${tab === "write" ? "bg-white shadow-sm" : ""}`}><PenLine className="h-3.5 w-3.5" />Write</button>
            <button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-sm ${tab === "preview" ? "bg-white shadow-sm" : ""}`}><Eye className="h-3.5 w-3.5" />Preview</button>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-line">
          <textarea ref={ta} value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={onKeyDown}
            aria-label="Chapter text in Markdown" placeholder="Start writing your chapter in Markdown..."
            className={`h-[60vh] resize-none bg-white p-4 font-mono text-sm leading-relaxed focus:outline-none ${tab === "preview" ? "hidden lg:block" : ""}`} />
          <div className={`h-[60vh] overflow-y-auto p-5 ${tab === "write" ? "hidden lg:block" : ""}`} aria-label="Preview">
            {content.trim() ? (
              <div className="reader-prose prose font-serif" style={{ "--r-fg": "#1c1c1e", "--r-muted": "#6b7280", "--r-border": "#e5e7eb" } as React.CSSProperties}>
                <Markdown>{content}</Markdown>
              </div>
            ) : <p className="text-sm text-mute">Your formatted chapter appears here as you type.</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-2 text-xs text-mute" aria-live="polite">
          <span className={words >= MIN_WORDS ? "font-medium text-emerald-700" : ""}>{words} / {MIN_WORDS} words minimum</span>
          <span>About {minutes} min read</span>
        </div>
      </section>
      {err("content")}

      <label className="block text-sm font-medium">Notes for reviewers <span className="font-normal text-mute">(optional)</span>
        <textarea className={`${field} mt-1 font-normal`} rows={2} value={v.authorNotes} onChange={set("authorNotes")} maxLength={2000} />
      </label>

      {formError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>}
      <button type="submit" disabled={pending} className="rounded-lg bg-accent px-6 py-2.5 font-medium text-white hover:bg-accent-deep disabled:opacity-60">
        {pending ? "Opening pull request..." : mode === "new" ? "Submit novel proposal" : "Submit chapter"}
      </button>

      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="done-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden />
              <button type="button" onClick={() => setResult(null)} aria-label="Close" className="rounded-lg p-1 hover:bg-paper"><X className="h-5 w-5" /></button>
            </div>
            <h2 id="done-title" className="mt-3 font-serif text-2xl">Pull request opened</h2>
            <p className="mt-1 text-sm text-mute">
              {result.mock ? "GitHub isn't configured here, so this is a simulated link. Nothing was pushed." : "A maintainer will review your chapter. It goes live once the pull request is merged."}
            </p>
            <a href={result.prUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-white hover:bg-accent">
              View pull request <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      )}
    </form>
  );
}
