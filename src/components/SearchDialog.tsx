"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, Search, X } from "lucide-react";
import type { NovelSummary } from "@/lib/types";

interface SearchDialogProps {
    novels: NovelSummary[];
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchDialog({ novels, isOpen, onClose }: SearchDialogProps) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery("");
        }
    }, [isOpen]);

    // Keyboard shortcut listener (Escape to close)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Matching logic
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        return novels.filter((n) => {
            const matchTitle = n.title.toLowerCase().includes(q);
            const matchAuthor = n.author.toLowerCase().includes(q);
            const matchGenre = n.genres.some((g) => g.toLowerCase().includes(q));
            const matchSynopsis = n.synopsis.toLowerCase().includes(q);
            return matchTitle || matchAuthor || matchGenre || matchSynopsis;
        });
    }, [novels, query]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 sm:pt-24 backdrop-blur-xs"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Search novels"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#EAE9E5] bg-white shadow-2xl transition-all"
            >
                {/* Search Input Bar */}
                <div className="flex items-center gap-3 border-b border-[#EAE9E5] px-5 py-4">
                    <Search className="h-5 w-5 text-[#9CA3AF]" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search novels by title, author, or genre..."
                        className="w-full bg-transparent text-sm font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="rounded-lg p-1 text-[#9CA3AF] hover:bg-[#F3F2EE] hover:text-[#111827]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <kbd className="hidden rounded-md border border-[#EAE9E5] bg-[#F7F6F2] px-2 py-0.5 text-[10px] font-mono text-[#6B7280] sm:inline-block">
                        ESC
                    </kbd>
                </div>

                {/* Results List */}
                <div className="max-h-[60vh] overflow-y-auto p-3">
                    {query.trim() === "" ? (
                        <div className="py-12 text-center text-xs text-[#9CA3AF]">
                            Type a title, genre (e.g. <em>Fantasy</em>), or author name.
                        </div>
                    ) : results.length === 0 ? (
                        <div className="py-12 text-center text-sm text-[#6B7280]">
                            No novels found matching &ldquo;{query}&rdquo;
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {results.map((novel) => (
                                <li key={novel.slug}>
                                    <Link
                                        href={`/novel/${novel.slug}`}
                                        onClick={onClose}
                                        className="group flex items-start gap-4 rounded-2xl p-3 transition-colors hover:bg-indigo-50/60"
                                    >
                                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="truncate font-serif text-base font-bold text-[#111827] group-hover:text-indigo-600">
                                                    {novel.title}
                                                </h4>
                                                <span className="shrink-0 text-xs text-[#9CA3AF]">
                                                    {novel.chapterCount} ch.
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#6B7280]">by {novel.author}</p>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {novel.genres.map((g) => (
                                                    <span
                                                        key={g}
                                                        className="rounded-md bg-[#F3F2EE] px-1.5 py-0.5 text-[10px] font-medium text-[#4B5563]"
                                                    >
                                                        {g}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}