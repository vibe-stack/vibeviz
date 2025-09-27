import type { ReactNode } from "react";
import { cn } from "@/utils/tailwind";

export const TogglePill = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-full border px-3 py-1 text-xs font-medium transition",
      "border-zinc-800/60 text-zinc-400 hover:border-zinc-600/60",
      active && "border-sky-400/70 bg-sky-500/10 text-sky-200",
    )}
  >
    {label}
  </button>
);

export const SegmentedControl = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) => (
  <div
    className="grid gap-1 rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-1 text-xs"
    style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
  >
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={cn(
          "rounded-md px-2 py-1 text-xs font-medium capitalize transition",
          value === option.value
            ? "bg-sky-500/20 text-sky-200"
            : "text-zinc-400 hover:text-zinc-200",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const SectionCard = ({
  title,
  children,
  description,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
    <div className="mb-3 space-y-1">
      <h4 className="text-sm font-semibold text-zinc-100">{title}</h4>
      {description ? (
        <p className="text-xs text-zinc-500">{description}</p>
      ) : null}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

export const ColorSwatch = ({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) => (
  <label className="flex items-center justify-between text-xs text-zinc-400">
    <span>{label}</span>
    <input
      type="color"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-7 w-16 cursor-pointer rounded border border-zinc-800/60 bg-transparent"
    />
  </label>
);
