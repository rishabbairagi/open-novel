export default function GenrePills({
  genres,
  onDark = false,
}: {
  genres: string[];
  onDark?: boolean;
}) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {genres.map((g) => (
        <li
          key={g}
          className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase transition-colors ${
            onDark
              ? "bg-white/15 text-white/95 backdrop-blur-sm border border-white/10"
              : "bg-[#EEF2FF] text-[#4338CA] border border-[#E0E7FF] hover:bg-[#E0E7FF]"
          }`}
        >
          {g}
        </li>
      ))}
    </ul>
  );
}