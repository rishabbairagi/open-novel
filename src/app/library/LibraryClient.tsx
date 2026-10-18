"use client";

import { useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import NovelCard from "@/components/NovelCard";
import type { NovelSummary } from "@/lib/types";
import { Search } from "lucide-react";

export default function LibraryClient({ novels }: { novels: NovelSummary[] }) {
    const [search, setSearch] = useState("");
    const [selectedGenre, setSelectedGenre] = useState<string>("All");

    const allGenres = useMemo(() => {
        const set = new Set<string>();
        novels.forEach((n) => n.genres.forEach((g) => set.add(g)));
        return ["All", ...Array.from(set)];
    }, [novels]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return novels.filter((n) => {
            const matchesSearch =
                !q ||
                n.title.toLowerCase().includes(q) ||
                n.author.toLowerCase().includes(q) ||
                n.synopsis.toLowerCase().includes(q);

            const matchesGenre =
                selectedGenre === "All" || n.genres.includes(selectedGenre);

            return matchesSearch && matchesGenre;
        });
    }, [novels, search, selectedGenre]);

    return (
        <PageShell width="w-full" searchNovels={novels}>
            <div className="space-y-4">
                <div>
                    <h1 className="font-serif text-4xl font-bold tracking-tight text-[#111827]">
                        Library
                    </h1>
                    <p className="mt-1 text-sm text-[#6B7280]">
                        {novels.length} novels available, newest updates first.
                    </p>
                </div>

                {/* Search & Genre Filters */}
                <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search library..."
                            className="w-full rounded-xl border border-[#EAE9E5] bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-600 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {allGenres.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${selectedGenre === genre
                                        ? "bg-[#111827] text-white"
                                        : "bg-white text-[#4B5563] border border-[#EAE9E5] hover:bg-[#F3F2EE]"
                                    }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Grid */}
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((n) => (
                        <NovelCard key={n.slug} novel={n} />
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="py-20 text-center text-sm text-[#9CA3AF]">
                        No novels found matching your criteria.
                    </div>
                )}
            </div>
        </PageShell>
    );
}