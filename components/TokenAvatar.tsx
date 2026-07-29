"use client";

import { useMemo, useState } from "react";
import { clsx } from "@/lib/format";

function colorFromAddress(addr?: string) {
  const s = (addr || "0x0").toLowerCase().replace(/^0x/, "") || "0";
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  const h = hash % 360;
  return {
    from: `hsl(${h} 70% 45%)`,
    to: `hsl(${(h + 40) % 360} 80% 35%)`,
  };
}

/** Reliable fallback avatar (no external dependency required at build). */
export function tokenAvatarUrl(address?: string, symbol?: string) {
  const seed = encodeURIComponent((address || symbol || "token").toLowerCase());
  // dicebear shapes — works without API key
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundType=gradientLinear`;
}

export function TokenAvatar({
  address,
  symbol,
  logoUrl,
  size = 36,
  className,
}: {
  address?: string;
  symbol?: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [failedFallback, setFailedFallback] = useState(false);
  const colors = useMemo(() => colorFromAddress(address), [address]);
  const letter = (symbol || "?").slice(0, 1).toUpperCase();
  const primary = logoUrl && !failed ? logoUrl : null;
  const secondary = !failedFallback ? tokenAvatarUrl(address, symbol) : null;

  const style = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
  } as const;

  if (primary) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={primary}
        alt={symbol || "token"}
        style={style}
        className={clsx("rounded-full object-cover bg-black/40 ring-1 ring-white/10", className)}
        onError={() => setFailed(true)}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  if (secondary) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={secondary}
        alt={symbol || "token"}
        style={style}
        className={clsx("rounded-full object-cover bg-black/40 ring-1 ring-white/10", className)}
        onError={() => setFailedFallback(true)}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      style={{
        ...style,
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
      }}
      className={clsx(
        "flex items-center justify-center rounded-full text-xs font-bold text-white ring-1 ring-white/10",
        className,
      )}
    >
      {letter}
    </div>
  );
}
