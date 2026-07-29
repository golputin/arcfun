export function fmtUsd(n: number | null | undefined, digits = 2): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  if (abs >= 1) return `$${n.toFixed(digits)}`;
  if (abs >= 0.01) return `$${n.toFixed(4)}`;
  if (abs > 0) return `$${n.toExponential(2)}`;
  return "$0";
}

export function fmtPrice(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n >= 0.01) return `$${n.toFixed(5)}`;
  if (n >= 0.0001) return `$${n.toFixed(6)}`;
  return `$${n.toExponential(2)}`;
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  if (Math.abs(n) >= 1000) return `${sign}${(n / 1000).toFixed(1)}K%`;
  return `${sign}${n.toFixed(2)}%`;
}

export function fmtInt(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function fmtAge(tsSec: number | null | undefined): string {
  if (!tsSec) return "—";
  // Cirque sample used large epoch-like values; support ms or sec
  let ms = tsSec > 1e12 ? tsSec : tsSec > 1e10 ? tsSec : tsSec * 1000;
  // if still absurd future, treat as relative age seconds from indexer quirk
  const now = Date.now();
  if (ms > now + 1e12) return "—";
  let diff = Math.max(0, now - ms);
  // fallback: if createdTs looks like relative-ish huge, show raw days estimate from spark length
  const sec = diff / 1000;
  if (sec < 60) return `${Math.floor(sec)}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  if (sec < 86400 * 30) return `${Math.floor(sec / 86400)}d`;
  return `${Math.floor(sec / (86400 * 30))}mo`;
}

export function shortAddr(a?: string): string {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function clsx(...xs: Array<string | false | null | undefined>): string {
  return xs.filter(Boolean).join(" ");
}
