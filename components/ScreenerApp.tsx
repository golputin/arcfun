"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ScreenerResponse, ScreenerRow } from "@/lib/types";
import { filterSortRows, type TabKey } from "@/lib/screener";
import { clsx, fmtAge, fmtInt, fmtPct, fmtPrice, fmtUsd, shortAddr } from "@/lib/format";
import { ARC } from "@/lib/config";
import { Spark } from "@/components/Spark";
import { TokenAvatar } from "@/components/TokenAvatar";
import { StatusBadge } from "@/components/StatusBadge";
import { resolveMarketStatus, type MarketStatus } from "@/lib/status";

const TABS: { id: TabKey; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "top", label: "Top" },
  { id: "gainers", label: "Gainers" },
  { id: "new", label: "New pairs" },
];

const TFS = [
  { id: "m5" as const, label: "5M" },
  { id: "h1" as const, label: "1H" },
  { id: "h6" as const, label: "6H" },
  { id: "h24" as const, label: "24H" },
];

export function ScreenerApp() {
  const router = useRouter();
  const [data, setData] = useState<ScreenerResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("trending");
  const [tf, setTf] = useState<"m5" | "h1" | "h6" | "h24">("h24");
  const [q, setQ] = useState("");
  const [minLiq, setMinLiq] = useState(0);
  const [minMcap, setMinMcap] = useState(0);
  const [maxMcap, setMaxMcap] = useState(0);
  const [status, setStatus] = useState<"all" | MarketStatus>("all");

  async function load() {
    try {
      setErr(null);
      const res = await fetch("/api/screener", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ScreenerResponse;
      setData(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 20_000);
    return () => clearInterval(t);
  }, []);

  const rows = useMemo(() => {
    if (!data?.rows) return [] as ScreenerRow[];
    return filterSortRows(data.rows, { tab, tf, q, minLiq, minMcap, maxMcap, status });
  }, [data, tab, tf, q, minLiq, minMcap, maxMcap, status]);

  const stats = data?.stats;

  function openPool(pool: string) {
    router.push(`/pools/${pool}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Tokens</h1>
          <p className="mt-1 text-sm text-arc-muted">
            Arc Network screener · native {ARC.nativeSymbol} · RPC configured · explorer{" "}
            <a className="text-arc-cyan hover:underline" href={ARC.explorer} target="_blank" rel="noreferrer">
              Blockscout
            </a>
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="rounded-lg border border-arc-line bg-arc-panel px-3 py-2 text-sm text-arc-muted transition hover:text-arc-text"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ["PAIRS", fmtInt(stats?.pairs)],
          ["COMBINED LIQUIDITY", fmtUsd(stats?.liquidityUsd)],
          ["VOLUME 24H", fmtUsd(stats?.volume24hUsd)],
          ["SWAPS 24H", fmtInt(stats?.swaps24h)],
          ["LAST BLOCK", data?.lastBlock != null ? fmtInt(Number(data.lastBlock)) : "···"],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-xl border border-arc-line bg-arc-panel/80 p-3 shadow-glow">
            <div className="text-[10px] uppercase tracking-[0.14em] text-arc-muted">{k}</div>
            <div className="mt-1 font-mono text-lg text-arc-text">{v}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-arc-line bg-arc-panel/60 p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-sm transition",
                tab === t.id
                  ? "bg-arc-lime text-black font-semibold"
                  : "text-arc-muted hover:bg-white/5 hover:text-arc-text",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {TFS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTf(t.id)}
              className={clsx(
                "rounded-lg px-2.5 py-1 font-mono text-xs transition",
                tf === t.id ? "bg-white/10 text-arc-cyan" : "text-arc-muted hover:bg-white/5",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>


      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-arc-muted">Status</span>
        {(
          [
            ["all", "All"],
            ["graduated", "Graduated"],
            ["bonding", "Bonding"],
            ["unknown", "Unknown"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setStatus(id)}
            className={clsx(
              "rounded-full border px-2.5 py-1 text-xs transition",
              status === id
                ? "border-arc-lime/50 bg-arc-lime/15 text-arc-lime"
                : "border-arc-line text-arc-muted hover:bg-white/5 hover:text-arc-text",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search symbol, name or address"
          className="rounded-lg border border-arc-line bg-black/30 px-3 py-2 text-sm outline-none ring-arc-lime/30 placeholder:text-arc-muted focus:ring-2"
        />
        <input
          type="number"
          value={minLiq || ""}
          onChange={(e) => setMinLiq(Number(e.target.value || 0))}
          placeholder="Minimum liquidity in USD"
          className="rounded-lg border border-arc-line bg-black/30 px-3 py-2 text-sm outline-none focus:ring-2 ring-arc-lime/30 placeholder:text-arc-muted"
        />
        <input
          type="number"
          value={minMcap || ""}
          onChange={(e) => setMinMcap(Number(e.target.value || 0))}
          placeholder="Minimum market cap in USD"
          className="rounded-lg border border-arc-line bg-black/30 px-3 py-2 text-sm outline-none focus:ring-2 ring-arc-lime/30 placeholder:text-arc-muted"
        />
        <input
          type="number"
          value={maxMcap || ""}
          onChange={(e) => setMaxMcap(Number(e.target.value || 0))}
          placeholder="Maximum market cap in USD"
          className="rounded-lg border border-arc-line bg-black/30 px-3 py-2 text-sm outline-none focus:ring-2 ring-arc-lime/30 placeholder:text-arc-muted"
        />
      </div>

      {err && (
        <div className="rounded-lg border border-arc-down/40 bg-arc-down/10 px-3 py-2 text-sm text-arc-down">
          {err}
        </div>
      )}
      {loading && !data && <div className="text-sm text-arc-muted">Loading screener…</div>}

      <div className="table-wrap rounded-xl border border-arc-line bg-arc-panel/70 shadow-glow">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="sticky top-0 z-10 bg-arc-panel/95 backdrop-blur text-[11px] uppercase tracking-wide text-arc-muted">
            <tr className="border-b border-arc-line">
              {[
                "Token",
                "Status",
                "Price",
                "5M",
                "1H",
                "6H",
                "24H",
                "Vol 24H",
                "Liquidity",
                "Mcap",
                "Txns 24H",
                "Traders",
                "Holders",
                "Top10",
                "Age",
                "Spark",
              ].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const w = r.windows || {};
              const href = `${ARC.explorer}/address/${r.pool}`;
              const tokenHref = `${ARC.explorer}/token/${r.base.address}`;
              return (
                <tr
                  key={r.pool + r.base.address}
                  role="link"
                  tabIndex={0}
                  onClick={() => openPool(r.pool)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openPool(r.pool);
                    }
                  }}
                  className="group cursor-pointer border-b border-arc-line/70 transition-colors duration-150 hover:bg-arc-lime/[0.06] focus-visible:bg-arc-lime/[0.08] focus-visible:outline-none"
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <TokenAvatar
                        address={r.base.address}
                        symbol={r.base.symbol}
                        logoUrl={r.base.logoUrl}
                        size={36}
                        className="transition group-hover:scale-105"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold group-hover:text-arc-lime transition-colors">
                            {r.base.symbol}
                          </span>
                          <span className="text-arc-muted">/{r.quote.symbol || "USDC"}</span>
                          <a
                            className="text-[10px] text-arc-muted hover:text-arc-cyan"
                            href={tokenHref}
                            target="_blank"
                            rel="noreferrer"
                            title="Explorer token"
                            onClick={(e) => e.stopPropagation()}
                          >
                            ↗
                          </a>
                        </div>
                        <div className="truncate text-xs text-arc-muted">
                          {r.base.name || "—"} · {shortAddr(r.pool)}
                          <a
                            className="ml-2 hover:text-arc-cyan"
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            title="Explorer pool"
                            onClick={(e) => e.stopPropagation()}
                          >
                            exp
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={resolveMarketStatus(r)} compact />
                  </td>
                  <td className="px-3 py-3 font-mono">{fmtPrice(r.priceUsd)}</td>
                  {(["m5", "h1", "h6", "h24"] as const).map((k) => {
                    const chg = w[k]?.chg;
                    const up = (chg || 0) >= 0;
                    return (
                      <td
                        key={k}
                        className={clsx("px-3 py-3 font-mono", up ? "text-arc-up" : "text-arc-down")}
                      >
                        {fmtPct(chg)}
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 font-mono">{fmtUsd(w.h24?.volUsd)}</td>
                  <td className="px-3 py-3 font-mono">{fmtUsd(r.liquidityUsd)}</td>
                  <td className="px-3 py-3 font-mono">{fmtUsd(r.mcapUsd)}</td>
                  <td className="px-3 py-3 font-mono">
                    {fmtInt(w.h24?.buys)}/{fmtInt(w.h24?.sells)}
                  </td>
                  <td className="px-3 py-3 font-mono">{fmtInt(w.h24?.traders)}</td>
                  <td className="px-3 py-3 font-mono">
                    {fmtInt(r.holders)}
                    {r.holdersDelta24h ? (
                      <span className="ml-1 text-arc-up">+{fmtInt(r.holdersDelta24h)}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 font-mono">
                    {r.top10Pct != null ? `${r.top10Pct.toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-3 py-3 font-mono text-arc-muted">{fmtAge(r.createdTs)}</td>
                  <td className="px-3 py-3">
                    <Spark values={r.spark?.slice(-24)} />
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={16} className="px-3 py-10 text-center text-arc-muted">
                  No pairs match filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-arc-muted">
        source: <span className="font-mono text-arc-text/80">{data?.source || "—"}</span>
        {" · "}
        showing <span className="font-mono">{rows.length}</span> / {fmtInt(data?.rows?.length || 0)} pairs
        {" · "}
        click any row to open pool
      </div>
    </div>
  );
}
