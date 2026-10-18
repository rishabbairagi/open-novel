import type { Metadata } from "next";
import { getNovelSummaries } from "@/lib/novels";
import LibraryClient from "./LibraryClient";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  const novels = getNovelSummaries();

  return <LibraryClient novels={novels} />;
}