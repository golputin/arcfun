"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ARC } from "@/lib/config";
import { clsx, fmtInt, fmtPct, fmtPrice, fmtUsd, shortAddr } from "@/lib/format";
import { Spark } from "@/components/Spark";
import { TokenAvatar } from "@/components/TokenAvatar";
import { StatusBadge } from "@/components/StatusBadge";
import { resolveMarketStatus } from "@/lib/status";

type Trade = {
  ts: number;
  type: string;
  baseAmount: number;
  quoteAmount: number;
  usd: number;
  priceUsd: number;
  trader: string;
  tx: string;
};

type PoolPayload = {
  pool?: any;
  stats?: any;
  holders?: { hash: string; pct: number }[];
  trades?: Trade[];
  swaps?: any[];
  candles?: any;
  links?: { explorerPool?: string; explorerToken?: string | null };
  error?: string;
};

function ageFromTs(ts: number) {
  // indexer ts sometimes non-unix; try sec
  const ms = ts > 1e12 ? ts : ts * 1000;
  const diff = Math.max(0, Date.now() - ms);
  const s = diff / 1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function PoolDetail({ address }: { address: string }) {
  const [data, setData] = useState<PoolPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"tx" | "holders">("tx");

  async function load() {
    try {
      setErr(null);
      const res = await fetch(`/api/pools/${address}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, [address]);

  const stats = data?.stats;
  const pool = data?.pool;
  const base = stats?.base;
  const quote = stats?.quote;
  const w = stats?.windows || {};

  const title = useMemo(() => {
    if (!base) return shortAddr(address);
    return `${base.symbol}/${quote?.symbol || "USDC"}`;
  }, [base, quote, address]);

  if (loading && !data) {
    return <div className="text-sm text-arc-muted">Loading pool…</div>;
  }

  if (err && !data) {
    return (
      <div className="space-y-3">
        <Link href="/" className="text-sm text-arc-cyan hover:underline">
          ← Screener
        </Link>
        <div className="rounded-lg border border-arc-down/40 bg-arc-down/10 px-3 py-2 text-sm text-arc-down">
          {err}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/" className="text-sm text-arc-cyan hover:underline">
            ← Screener
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <TokenAvatar
              address={base?.address}
              symbol={base?.symbol}
              logoUrl={base?.logoUrl}
              size={48}
            />
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
              {pool?.feeBps != null && (
                <span className="ml-2 text-base font-normal text-arc-muted">
                  {(pool.feeBps / 100).toFixed(2)}%
                </span>
              )}
            </h1>
            <StatusBadge
              status={resolveMarketStatus({
                pool: address,
                feeBps: pool?.feeBps ?? stats?.feeBps ?? 0,
                createdTs: stats?.createdTs || 0,
                base: base || { address: "", symbol: "" },
                quote: quote || { address: "", symbol: "USDC" },
                priceUsd: stats?.priceUsd || 0,
                mcapUsd: stats?.mcapUsd || 0,
                liquidityUsd: stats?.liquidityUsd || 0,
                windows: stats?.windows || {},
                protocol: pool?.protocol || "v3",
              })}
            />
          </div>
          <p className="mt-1 text-sm text-arc-muted">
            {base?.name || "Token"} · pool{" "}
            <a
              className="font-mono text-arc-cyan hover:underline"
              href={data?.links?.explorerPool || `${ARC.explorer}/address/${address}`}
              target="_blank"
              rel="noreferrer"
            >
              {shortAddr(address)}
            </a>
            {pool?.feeAprPct != null && (
              <>
                {" · "}
                <span className="text-arc-lime">{fmtPct(pool.feeAprPct)} fee APR</span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={data?.links?.explorerToken || "#"}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-arc-line bg-arc-panel px-3 py-2 text-sm text-arc-muted hover:text-arc-text"
          >
            Token
          </a>
          <a
            href={data?.links?.explorerPool || `${ARC.explorer}/address/${address}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-arc-line bg-arc-panel px-3 py-2 text-sm text-arc-muted hover:text-arc-text"
          >
            Explorer
          </a>
          <button
            onClick={() => {
              setLoading(true);
              load();
            }}
            className="rounded-lg border border-arc-line bg-arc-panel px-3 py-2 text-sm text-arc-muted hover:text-arc-text"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          ["PRICE", fmtPrice(stats?.priceUsd)],
          ["ACTIVE DEPTH", fmtUsd(pool?.activeDepthUsd ?? stats?.liquidityUsd)],
          ["POOLED BALANCE", fmtUsd(pool?.balanceTvlUsd ?? stats?.balanceTvlUsd)],
          ["MCAP", fmtUsd(stats?.mcapUsd)],
          ["VOLUME 24H", fmtUsd(w.h24?.volUsd ?? pool?.volume24hUsd)],
          ["TRADERS 24H", fmtInt(w.h24?.traders)],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-xl border border-arc-line bg-arc-panel/80 p-3">
            <div className="text-[10px] uppercase tracking-[0.14em] text-arc-muted">{k}</div>
            <div className="mt-1 font-mono text-lg">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {(["m5", "h1", "h6", "h24"] as const).map((k) => {
          const chg = w[k]?.chg;
          const up = (chg || 0) >= 0;
          return (
            <div key={k} className="rounded-xl border border-arc-line bg-arc-panel/60 p-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-arc-muted">{k.toUpperCase()}</div>
              <div className={clsx("mt-1 font-mono text-xl", up ? "text-arc-up" : "text-arc-down")}>
                {fmtPct(chg)}
              </div>
              <div className="mt-1 text-xs text-arc-muted">
                vol {fmtUsd(w[k]?.volUsd)} · {fmtInt(w[k]?.txns)} tx
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-arc-line bg-arc-panel/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">Price spark</div>
            <div className="text-xs text-arc-muted">
              {fmtInt(w.h24?.buys)} buys · {fmtInt(w.h24?.sells)} sells (24h)
            </div>
          </div>
          <div className="flex h-40 items-center justify-center rounded-lg bg-black/30">
            {stats?.spark?.length ? (
              <div className="w-full px-2">
                <svg viewBox="0 0 600 160" className="h-40 w-full">
                  {(() => {
                    const values: number[] = stats.spark.slice(-80);
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const span = max - min || 1;
                    const pts = values
                      .map((v, i) => {
                        const x = (i / (values.length - 1)) * 580 + 10;
                        const y = 150 - ((v - min) / span) * 130 - 10;
                        return `${x},${y}`;
                      })
                      .join(" ");
                    const up = values[values.length - 1] >= values[0];
                    return (
                      <polyline
                        fill="none"
                        stroke={up ? "#3ddc97" : "#ff5c7a"}
                        strokeWidth="2"
                        points={pts}
                      />
                    );
                  })()}
                </svg>
              </div>
            ) : (
              <span className="text-arc-muted text-sm">No spark data</span>
            )}
          </div>
          <div className="mt-3 text-xs text-arc-muted">
            Full candlestick chart can plug into <span className="font-mono">/candles</span> feed — spark uses indexer series for now.
          </div>
        </div>

        <div className="rounded-xl border border-arc-line bg-arc-panel/70 p-4">
          <div className="text-sm font-medium mb-3">Pool info</div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-arc-muted">Status</dt>
              <dd>
                <StatusBadge
                  status={resolveMarketStatus({
                    pool: address,
                    feeBps: pool?.feeBps ?? 0,
                    createdTs: 0,
                    base: base || { address: "", symbol: "" },
                    quote: quote || { address: "", symbol: "USDC" },
                    priceUsd: 0,
                    mcapUsd: 0,
                    liquidityUsd: stats?.liquidityUsd || 0,
                    windows: {},
                    protocol: pool?.protocol || "v3",
                  })}
                />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-arc-muted">Protocol</dt>
              <dd className="font-mono">{pool?.protocol || "v3"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-arc-muted">Fee</dt>
              <dd className="font-mono">{pool?.feeBps != null ? `${pool.feeBps} bps` : "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-arc-muted">Tick</dt>
              <dd className="font-mono">{pool?.currentTick ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-arc-muted">Holders</dt>
              <dd className="font-mono">
                {fmtInt(stats?.holders)}
                {stats?.holdersDelta24h ? (
                  <span className="ml-1 text-arc-up">+{fmtInt(stats.holdersDelta24h)}</span>
                ) : null}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-arc-muted">Top 10</dt>
              <dd className="font-mono">{stats?.top10Pct != null ? `${stats.top10Pct.toFixed(1)}%` : "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-arc-muted">Base</dt>
              <dd className="font-mono text-right">{shortAddr(base?.address)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-arc-muted">Quote</dt>
              <dd className="font-mono text-right">{shortAddr(quote?.address)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-arc-line bg-arc-panel/70">
        <div className="flex gap-1 border-b border-arc-line p-2">
          {[
            { id: "tx" as const, label: "Transactions" },
            { id: "holders" as const, label: `Holders${stats?.holders ? ` ${stats.holders}` : ""}` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-sm",
                tab === t.id ? "bg-arc-lime text-black font-semibold" : "text-arc-muted hover:bg-white/5",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "tx" && (
          <div className="overflow-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-arc-muted">
                <tr className="border-b border-arc-line">
                  {["Time", "Type", "USD", base?.symbol || "Token", quote?.symbol || "USDC", "Price", "Trader", "Tx"].map(
                    (h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {(data?.trades || []).map((t, i) => {
                  const buy = String(t.type).toLowerCase() === "buy";
                  return (
                    <tr key={i} className="border-b border-arc-line/60 hover:bg-white/[0.03]">
                      <td className="px-3 py-2 text-arc-muted whitespace-nowrap">{ageFromTs(t.ts)}</td>
                      <td className={clsx("px-3 py-2 font-medium", buy ? "text-arc-up" : "text-arc-down")}>
                        {t.type}
                      </td>
                      <td className="px-3 py-2 font-mono">{fmtUsd(t.usd)}</td>
                      <td className="px-3 py-2 font-mono">{Number(t.baseAmount).toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono">{Number(t.quoteAmount).toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono">{fmtPrice(t.priceUsd)}</td>
                      <td className="px-3 py-2 font-mono">
                        <a
                          className="hover:text-arc-cyan"
                          href={`${ARC.explorer}/address/${t.trader}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {shortAddr(t.trader)}
                        </a>
                      </td>
                      <td className="px-3 py-2 font-mono">
                        <a
                          className="text-arc-cyan hover:underline"
                          href={`${ARC.explorer}/tx/${t.tx}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          ↗
                        </a>
                      </td>
                    </tr>
                  );
                })}
                {!(data?.trades || []).length && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-arc-muted">
                      No recent trades
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "holders" && (
          <div className="overflow-auto">
            <table className="min-w-[480px] w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-arc-muted">
                <tr className="border-b border-arc-line">
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Holder</th>
                  <th className="px-3 py-2 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {(data?.holders || []).map((h, i) => (
                  <tr key={h.hash} className="border-b border-arc-line/60">
                    <td className="px-3 py-2 text-arc-muted">{i + 1}</td>
                    <td className="px-3 py-2 font-mono">
                      <a
                        className="hover:text-arc-cyan"
                        href={`${ARC.explorer}/address/${h.hash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {h.hash}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{h.pct?.toFixed?.(2) ?? h.pct}%</td>
                  </tr>
                ))}
                {!(data?.holders || []).length && (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-arc-muted">
                      No holder snapshot
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
