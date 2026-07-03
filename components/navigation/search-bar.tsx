type SearchBarProps = {
  placeholder?: string;
  wide?: boolean;
};

export function SearchBar({
  placeholder = "Search novels, comics, authors",
  wide = false
}: SearchBarProps) {
  return (
    <label
      className={`flex h-11 items-center gap-2 rounded-lg border border-line bg-canvas px-3 transition focus-within:border-primary ${
        wide ? "w-full" : "mx-auto max-w-xl"
      }`}
    >
      <span className="text-sm font-black text-subtle">/</span>
      <input
        className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-subtle"
        placeholder={placeholder}
      />
    </label>
  );
}
