"use client";

import { clsx } from "@/lib/format";
import { statusHint, statusLabel, type MarketStatus } from "@/lib/status";

export function StatusBadge({
  status,
  compact = false,
}: {
  status: MarketStatus;
  compact?: boolean;
}) {
  const label = statusLabel(status);
  const title = statusHint(status);
  return (
    <span
      title={title}
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border font-medium transition",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        status === "graduated" && "border-arc-up/40 bg-arc-up/10 text-arc-up",
        status === "bonding" && "border-amber-400/40 bg-amber-400/10 text-amber-300",
        status === "unknown" && "border-arc-line bg-white/5 text-arc-muted",
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          status === "graduated" && "bg-arc-up",
          status === "bonding" && "bg-amber-300",
          status === "unknown" && "bg-arc-muted",
        )}
      />
      {label}
    </span>
  );
}
