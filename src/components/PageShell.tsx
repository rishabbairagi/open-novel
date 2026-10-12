import Link from "next/link";
import { BookOpen, PenLine } from "lucide-react";

export default function PageShell({ children, width = "max-w-6xl" }: { children: React.ReactNode; width?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold">
            <BookOpen className="h-5 w-5 text-accent" aria-hidden /> OpenNovel
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/library" className="rounded-lg px-3 py-1.5 hover:bg-accent-soft">Library</Link>
            <Link href="/submit" className="flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-white hover:bg-accent">
              <PenLine className="h-4 w-4" aria-hidden /> Write
            </Link>
          </nav>
        </div>
      </header>
      <main className={`mx-auto w-full flex-1 px-5 py-10 ${width}`}>{children}</main>
      <footer className="border-t border-line py-6 text-center text-sm text-mute">
        Every chapter here lives in Git and arrives through a reviewed pull request.
      </footer>
    </div>
  );
}
