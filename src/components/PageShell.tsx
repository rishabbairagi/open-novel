import Link from "next/link";
import { BookOpen, PenLine, Sparkles } from "lucide-react";

export default function PageShell({
  children,
  width = "w-full",
}: {
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBFBFA] text-[#1A1A1A]">
      <header className="sticky top-0 z-30 border-b border-[#EAE9E5] bg-[#FBFBFA]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 items-center justify-between px-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-serif text-xl font-bold tracking-tight text-[#111827]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
              <BookOpen className="h-5 w-5 transition-transform group-hover:scale-105" aria-hidden />
            </div>
            <span>Open<span className="font-sans font-medium text-indigo-600">Novel</span></span>
          </Link>

          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link
              href="/library"
              className="rounded-lg px-3.5 py-2 text-[#4B5563] transition hover:bg-[#F3F2EE] hover:text-[#111827]"
            >
              Library
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2 text-white shadow-sm transition hover:bg-indigo-600 hover:shadow-indigo-500/20 active:scale-[0.98]"
            >
              <PenLine className="h-4 w-4" aria-hidden />
              <span>Write</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className={`mx-auto w-full flex-1 px-6 py-12 ${width}`}>{children}</main>

      <footer className="mt-auto border-t border-[#EAE9E5] bg-[#F7F6F2] py-8 text-center text-sm text-[#71717A]">
        <div className="mx-auto flex flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          <p className="flex items-center gap-1.5 font-serif text-sm">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Every chapter lives in Git and arrives through a peer-reviewed PR.
          </p>
          <div className="text-xs text-[#A1A1AA]">
            Open, distributed, community-driven prose.
          </div>
        </div>
      </footer>
    </div>
  );
}