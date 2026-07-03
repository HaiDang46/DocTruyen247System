type ModalDrawerProps = {
  title: string;
  children: React.ReactNode;
};

export function ModalDrawer({ title, children }: ModalDrawerProps) {
  return (
    <aside className="drawer-panel">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-black text-ink">{title}</p>
        <button className="h-8 w-8 rounded-lg border border-line text-sm font-black text-subtle">
          x
        </button>
      </div>
      {children}
    </aside>
  );
}
