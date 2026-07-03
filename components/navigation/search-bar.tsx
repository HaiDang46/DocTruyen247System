type SearchBarProps = {
  placeholder?: string;
  wide?: boolean;
};

export function SearchBar({
  placeholder = "Tìm truyện, manga, tác giả",
  wide = false
}: SearchBarProps) {
  return (
    <label
      className={`soft-control flex h-11 items-center gap-2 px-3 ${
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
