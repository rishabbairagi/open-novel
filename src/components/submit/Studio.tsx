"use client";

import { useRef, useState, useTransition } from "react";
import {
  Bold,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileEdit,
  Italic,
  PenLine,
  Quote,
  SeparatorHorizontal,
  X,
} from "lucide-react";
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

const field =
  "w-full rounded-xl border border-[#D1D5DB] bg-[#FAFAF9] px-3.5 py-2.5 text-sm text-[#111827] transition placeholder:text-[#9CA3AF] focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600";

export default function Studio({ mode, novel, nextChapter }: Props) {
  const [v, setV] = useState({
    novelTitle: novel?.title ?? "",
    novelSlug: novel?.slug ?? "",
    author: "",
    synopsis: "",
    genres: "",
    status: "Ongoing",
    cover: "",
    chapterNum: String(nextChapter),
    chapterTitle: "",
    authorNotes: "",
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
  const set =
    (k: keyof typeof v) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setV((s) => {
        const next = { ...s, [k]: value };
        if (k === "novelTitle" && mode === "new" && !slugTouched) next.novelSlug = slugify(value);
        return next;
      });
    };

  const edit = (
    build: (before: string, sel: string, after: string) => { text: string; selStart: number; selEnd: number }
  ) => {
    const el = ta.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const r = build(content.slice(0, s), content.slice(s, e), content.slice(e));
    setContent(r.text);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(r.selStart, r.selEnd);
    });
  };

  const wrap = (mark: string, placeholder: string) =>
    edit((b, sel, a) => {
      const inner = sel || placeholder;
      return {
        text: `${b}${mark}${inner}${mark}${a}`,
        selStart: b.length + mark.length,
        selEnd: b.length + mark.length + inner.length,
      };
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
      const quoted = block
        .split("\n")
        .map((l) => (l.startsWith("> ") ? l : `> ${l}`))
        .join("\n");
      return { text: head + quoted + a, selStart: head.length + quoted.length, selEnd: head.length + quoted.length };
    });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    if (e.key === "b") {
      e.preventDefault();
      wrap("**", "bold text");
    }
    if (e.key === "i") {
      e.preventDefault();
      wrap("*", "italic text");
    }
  };

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
      else {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.error);
      }
    });
  };

  const err = (k: string) =>
    errors[k]?.[0] && (
      <p role="alert" className="mt-1 text-xs font-semibold text-rose-600">
        {errors[k]?.[0]}
      </p>
    );

  const toolBtn =
    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#4B5563] transition hover:bg-[#F3F2EE] hover:text-[#111827] active:scale-95";

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {/* Novel Metadata Form Card */}
      <section className="rounded-3xl border border-[#EAE9E5] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 font-serif text-xl font-bold text-[#111827]">
          {mode === "new" ? "Novel Specification" : "Chapter Details"}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
            Novel Title
            <input
              className={`${field} mt-1.5 font-normal`}
              value={v.novelTitle}
              onChange={set("novelTitle")}
              readOnly={mode === "existing"}
              maxLength={120}
            />
            {err("novelTitle")}
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
            Author Name
            <input
              className={`${field} mt-1.5 font-normal`}
              value={v.author}
              onChange={set("author")}
              maxLength={80}
              placeholder={novel?.author}
            />
            {err("author")}
          </label>

          {mode === "new" && (
            <>
              <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                URL Slug
                <input
                  className={`${field} mt-1.5 font-mono font-normal`}
                  value={v.novelSlug}
                  maxLength={60}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("novelSlug")(e);
                  }}
                />
                {err("novelSlug")}
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                Status
                <select className={`${field} mt-1.5 font-normal`} value={v.status} onChange={set("status")}>
                  <option>Ongoing</option>
                  <option>Completed</option>
                </select>
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] sm:col-span-2">
                Synopsis
                <textarea
                  className={`${field} mt-1.5 font-normal`}
                  rows={3}
                  value={v.synopsis}
                  onChange={set("synopsis")}
                  maxLength={1200}
                />
                {err("synopsis")}
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                Genres <span className="font-normal lowercase text-[#9CA3AF]">(comma-separated)</span>
                <input
                  className={`${field} mt-1.5 font-normal`}
                  value={v.genres}
                  onChange={set("genres")}
                  placeholder="Fantasy, Sci-Fi"
                />
                {err("genres")}
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                Cover URL <span className="font-normal lowercase text-[#9CA3AF]">(optional https)</span>
                <input
                  className={`${field} mt-1.5 font-normal`}
                  value={v.cover}
                  onChange={set("cover")}
                  placeholder="https://..."
                />
                {err("cover")}
              </label>
            </>
          )}

          <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
            Chapter Number
            <input
              type="number"
              min={1}
              className={`${field} mt-1.5 font-normal`}
              value={v.chapterNum}
              onChange={set("chapterNum")}
              readOnly={mode === "new"}
            />
            {err("chapterNum")}
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
            Chapter Title
            <input
              className={`${field} mt-1.5 font-normal`}
              value={v.chapterTitle}
              onChange={set("chapterTitle")}
              maxLength={160}
            />
            {err("chapterTitle")}
          </label>
        </div>
      </section>

      {/* Editor & Preview Section */}
      <section className="overflow-hidden rounded-3xl border border-[#EAE9E5] bg-white shadow-sm">
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#EAE9E5] bg-[#FBFBFA] px-4 py-2.5">
          <div className="flex items-center gap-1">
            <button type="button" className={toolBtn} onClick={() => wrap("**", "bold text")} title="Bold (Ctrl+B)">
              <Bold className="h-4 w-4" />
              <span>Bold</span>
            </button>
            <button type="button" className={toolBtn} onClick={() => wrap("*", "italic text")} title="Italic (Ctrl+I)">
              <Italic className="h-4 w-4" />
              <span>Italic</span>
            </button>
            <button type="button" className={toolBtn} onClick={sceneBreak}>
              <SeparatorHorizontal className="h-4 w-4" />
              <span>Scene break</span>
            </button>
            <button type="button" className={toolBtn} onClick={dialogue}>
              <Quote className="h-4 w-4" />
              <span>Dialogue</span>
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Editor view"
            className="flex rounded-xl bg-[#EAE9E5] p-0.5 text-xs lg:hidden"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "write"}
              onClick={() => setTab("write")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition ${
                tab === "write" ? "bg-white text-[#111827] shadow-xs" : "text-[#6B7280]"
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />
              Write
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              onClick={() => setTab("preview")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition ${
                tab === "preview" ? "bg-white text-[#111827] shadow-xs" : "text-[#6B7280]"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>
        </div>

        {/* Dual Split Area */}
        <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-[#EAE9E5]">
          <textarea
            ref={ta}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Chapter text in Markdown"
            placeholder="Write your chapter in Markdown here..."
            className={`h-[65vh] resize-none bg-white p-6 font-mono text-sm leading-relaxed text-[#1F2937] focus:outline-none ${
              tab === "preview" ? "hidden lg:block" : ""
            }`}
          />
          <div
            className={`h-[65vh] overflow-y-auto bg-[#FBFBFA] p-8 ${
              tab === "write" ? "hidden lg:block" : ""
            }`}
            aria-label="Preview"
          >
            {content.trim() ? (
              <div
                className="reader-prose prose font-serif max-w-[65ch]"
                style={
                  {
                    "--r-fg": "#1C1917",
                    "--r-muted": "#78716C",
                    "--r-border": "#E7E5E4",
                  } as React.CSSProperties
                }
              >
                <Markdown>{content}</Markdown>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-[#9CA3AF]">
                <FileEdit className="mb-2 h-8 w-8 text-[#D1D5DB]" />
                <p>Formatted preview will render here in real time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div
          className="flex flex-wrap items-center justify-between border-t border-[#EAE9E5] bg-[#FBFBFA] px-6 py-2.5 text-xs text-[#6B7280]"
          aria-live="polite"
        >
          <span
            className={`font-medium ${
              words >= MIN_WORDS ? "text-emerald-600 font-semibold" : "text-[#6B7280]"
            }`}
          >
            {words} / {MIN_WORDS} words required
          </span>
          <span>Approx. {minutes} min read</span>
        </div>
      </section>
      {err("content")}

      {/* Reviewer Notes Card */}
      <section className="rounded-3xl border border-[#EAE9E5] bg-white p-6 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563]">
          Notes for Pull Request Reviewers{" "}
          <span className="font-normal lowercase text-[#9CA3AF]">(optional)</span>
          <textarea
            className={`${field} mt-2 font-normal`}
            rows={2}
            value={v.authorNotes}
            onChange={set("authorNotes")}
            maxLength={2000}
            placeholder="Add context, references, or content notes for maintainers..."
          />
        </label>
      </section>

      {formError && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm font-medium text-rose-800">
          {formError}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Opening pull request..."
          : mode === "new"
          ? "Propose Novel to Repository"
          : "Submit Chapter Pull Request"}
      </button>

      {/* Result Dialog Modal */}
      {result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="done-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" aria-hidden />
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-[#6B7280] transition hover:bg-[#F3F2EE]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 id="done-title" className="mt-4 font-serif text-2xl font-bold text-[#111827]">
              Pull request opened
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              {result.mock
                ? "GitHub is not configured in this environment, so this is a simulated submission link."
                : "Your submission has been pushed as a pull request. Maintainers will review it before merging into the library."}
            </p>
            <div className="mt-6 flex justify-end">
              <a
                href={result.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              >
                View Pull Request <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}