"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, PenLine, Search, Sparkles } from "lucide-react";
import SearchDialog from "@/components/SearchDialog";
import type { NovelSummary } from "@/lib/types";

interface PageShellProps {
  children: React.ReactNode;
  width?: string;
  searchNovels?: NovelSummary[];
}

export default function PageShell({
  children,
  width = "w-full",
  searchNovels = [],
}: PageShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFBFA] text-[#1A1A1A]">
      <header className="sticky top-0 z-30 w-full border-b border-[#EAE9E5] bg-[#FBFBFA]/90 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-6 sm:px-10">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-serif text-xl font-bold tracking-tight text-[#111827]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
              <BookOpen className="h-5 w-5 transition-transform group-hover:scale-105" aria-hidden />
            </div>
            <span>Open<span className="font-sans font-medium text-indigo-600">Novel</span></span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#EAE9E5] bg-white px-3.5 py-1.5 text-xs font-medium text-[#6B7280] shadow-xs transition hover:border-indigo-300 hover:text-[#111827]"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden rounded bg-[#F3F2EE] px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
                ⌘K
              </kbd>
            </button>

            <nav className="flex items-center gap-2 text-sm font-medium">
              <Link
                href="/library"
                className="rounded-lg px-3 py-2 text-[#4B5563] transition hover:bg-[#F3F2EE] hover:text-[#111827]"
              >
                Library
              </Link>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2 text-white shadow-sm transition hover:bg-indigo-600 active:scale-[0.98]"
              >
                <PenLine className="h-4 w-4" aria-hidden />
                <span>Write</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className={`w-full flex-1 px-6 py-10 sm:px-10 ${width}`}>{children}</main>

      <footer className="mt-auto w-full border-t border-[#EAE9E5] bg-[#F7F6F2] py-8 text-sm text-[#71717A]">
        <div className="flex w-full flex-col items-center justify-between gap-3 px-6 sm:flex-row sm:px-10">
          <p className="flex items-center gap-1.5 font-serif text-sm">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Every chapter lives in Git and arrives through a peer-reviewed PR.
          </p>
          <div className="text-xs text-[#A1A1AA]">
            Open, distributed, community-driven prose.
          </div>
        </div>
      </footer>

      {/* Global Search Dialog */}
      <SearchDialog
        novels={searchNovels}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}