import type { ScreenerRow } from "@/lib/types";

export type MarketStatus = "graduated" | "bonding" | "unknown";

/**
 * Arc screener rows from the current Cirque-style indexer are Uniswap v3 pools.
 * Those are already on the DEX ⇒ treat as graduated.
 *
 * Bonding detection is reserved for future bonding-curve indexer/factory wiring.
 * You can force status via row._status or env BONDING_FACTORY later.
 */
export function resolveMarketStatus(
  row: ScreenerRow & { protocol?: string; status?: string; _status?: string },
): MarketStatus {
  const explicit = (row as any)._status || (row as any).status || (row as any).marketStatus;
  if (typeof explicit === "string") {
    const s = explicit.toLowerCase();
    if (s.includes("bond")) return "bonding";
    if (s.includes("grad")) return "graduated";
  }

  const protocol = String((row as any).protocol || "").toLowerCase();
  if (protocol.includes("bond") || protocol.includes("curve") || protocol === "launch") {
    return "bonding";
  }
  if (protocol === "v3" || protocol === "v2" || protocol === "univ3") {
    return "graduated";
  }

  // Screener pair with real pool address + feeBps ⇒ DEX pool (graduated)
  if (row.pool && row.feeBps != null && (row.liquidityUsd || 0) >= 0) {
    return "graduated";
  }

  return "unknown";
}

export function statusLabel(s: MarketStatus): string {
  if (s === "graduated") return "Graduated";
  if (s === "bonding") return "Bonding";
  return "Unknown";
}

export function statusHint(s: MarketStatus): string {
  if (s === "graduated") return "Listed on DEX (Uniswap v3 pool)";
  if (s === "bonding") return "Still on bonding curve";
  return "Status not available from indexer";
}
