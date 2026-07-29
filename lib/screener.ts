import { ARC } from "@/lib/config";
import type { ScreenerResponse, ScreenerRow } from "@/lib/types";

async function rpc<T = unknown>(method: string, params: unknown[] = []): Promise<T> {
  const res = await fetch(ARC.rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    next: { revalidate: 5 },
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result as T;
}

function summarize(rows: ScreenerRow[]) {
  let liquidityUsd = 0;
  let volume24hUsd = 0;
  let swaps24h = 0;
  for (const r of rows) {
    liquidityUsd += r.liquidityUsd || 0;
    volume24hUsd += r.windows?.h24?.volUsd || 0;
    swaps24h += r.windows?.h24?.txns || 0;
  }
  return {
    pairs: rows.length,
    liquidityUsd,
    volume24hUsd,
    swaps24h,
  };
}

export async function loadScreener(): Promise<ScreenerResponse> {
  let lastBlock: string | number | null = null;
  try {
    const hex = await rpc<string>("eth_blockNumber");
    lastBlock = Number.parseInt(hex, 16);
  } catch {
    lastBlock = null;
  }

  let rows: ScreenerRow[] = [];
  let source = "empty";

  try {
    const res = await fetch(ARC.screenerSource, {
      headers: { accept: "application/json", "user-agent": "arcfun-screener/0.1" },
      next: { revalidate: 15 },
    });
    if (res.ok) {
      const data = await res.json();
      rows = Array.isArray(data?.rows) ? data.rows : [];
      if (data?.lastBlock != null) lastBlock = data.lastBlock;
      source = ARC.screenerSource;
    } else {
      source = `source_http_${res.status}`;
    }
  } catch (e) {
    source = `source_error:${e instanceof Error ? e.message : "unknown"}`;
  }

  // Enrich / fallback: Blockscout token universe count (not full pair OHLC)
  if (!rows.length) {
    try {
      const bs = await fetch(`${ARC.blockscoutApi}/tokens?type=ERC-20`, {
        next: { revalidate: 60 },
      });
      if (bs.ok) {
        const data = await bs.json();
        const items = data.items || [];
        rows = items.slice(0, 50).map((t: any, i: number) => ({
          pool: t.address_hash,
          feeBps: 100,
          createdTs: 0,
          base: {
            address: t.address_hash,
            symbol: t.symbol || "???",
            name: t.name || "Unknown",
            decimals: Number(t.decimals || 18),
            logoUrl: t.icon_url,
          },
          quote: { address: ARC.usdc, symbol: "USDC" },
          priceUsd: 0,
          mcapUsd: Number(t.circulating_market_cap || 0) || 0,
          liquidityUsd: 0,
          windows: {
            h24: { chg: 0, volUsd: Number(t.volume_24h || 0) || 0, txns: 0, buys: 0, sells: 0, traders: 0 },
          },
          holders: Number(t.holders_count || 0) || 0,
        }));
        source = "blockscout-tokens-fallback";
      }
    } catch {
      /* ignore */
    }
  }

  return {
    rows,
    lastBlock,
    source,
    chain: {
      chainId: ARC.chainId,
      rpcUrl: ARC.rpcUrl,
      explorer: ARC.explorer,
      nativeSymbol: ARC.nativeSymbol,
    },
    stats: summarize(rows),
  };
}

export type TabKey = "trending" | "top" | "gainers" | "new";

export function filterSortRows(
  rows: ScreenerRow[],
  opts: {
    tab: TabKey;
    tf: "m5" | "h1" | "h6" | "h24";
    q: string;
    minLiq: number;
    minMcap: number;
    maxMcap: number;
  },
): ScreenerRow[] {
  const q = opts.q.trim().toLowerCase();
  let out = rows.filter((r) => {
    if ((r.liquidityUsd || 0) < opts.minLiq) return false;
    if ((r.mcapUsd || 0) < opts.minMcap) return false;
    if (opts.maxMcap > 0 && (r.mcapUsd || 0) > opts.maxMcap) return false;
    if (!q) return true;
    const hay = `${r.base.symbol} ${r.base.name || ""} ${r.base.address} ${r.pool}`.toLowerCase();
    return hay.includes(q);
  });

  const vol = (r: ScreenerRow) => r.windows?.[opts.tf]?.volUsd || r.windows?.h24?.volUsd || 0;
  const chg = (r: ScreenerRow) => r.windows?.[opts.tf]?.chg || 0;

  if (opts.tab === "trending") {
    out = out
      .map((r) => ({
        r,
        score:
          (vol(r) || 0) * 0.7 +
          Math.max(chg(r), 0) * (r.liquidityUsd || 0) * 0.00001 +
          (r.windows?.[opts.tf]?.traders || 0) * 50,
      }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.r);
  } else if (opts.tab === "top") {
    out.sort((a, b) => (b.liquidityUsd || 0) - (a.liquidityUsd || 0));
  } else if (opts.tab === "gainers") {
    out.sort((a, b) => chg(b) - chg(a));
  } else if (opts.tab === "new") {
    out.sort((a, b) => (b.createdTs || 0) - (a.createdTs || 0));
  }

  return out;
}
