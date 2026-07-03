type ModeSwitchToggleProps = {
  active: "NOVEL" | "MANGA";
};

export function ModeSwitchToggle({ active }: ModeSwitchToggleProps) {
  const options: Array<"NOVEL" | "MANGA"> = ["NOVEL", "MANGA"];

  return (
    <div className="inline-flex rounded-lg border border-line bg-surface p-1 shadow-soft">
      {options.map((option) => (
        <button
          key={option}
          className={`rounded-lg px-4 py-2 text-sm font-black transition ${
            option === active
              ? "bg-primary text-white"
              : "text-subtle hover:bg-muted hover:text-ink"
          }`}
        >
          {option} MODE
        </button>
      ))}
    </div>
  );
}
