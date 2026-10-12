export default function GenrePills({ genres, onDark = false }: { genres: string[]; onDark?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {genres.map((g) => (
        <li
          key={g}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${onDark ? "bg-white/15 text-white" : "bg-accent-soft text-accent-deep"}`}
        >
          {g}
        </li>
      ))}
    </ul>
  );
}
