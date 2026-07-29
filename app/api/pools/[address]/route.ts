import { NextResponse } from "next/server";
import { ARC } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeAddress(a: string) {
  const x = a.trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(x)) return null;
  return x;
}

export async function GET(
  _req: Request,
  ctx: { params: { address: string } },
) {
  const address = normalizeAddress(ctx.params.address || "");
  if (!address) {
    return NextResponse.json({ error: "invalid pool address" }, { status: 400 });
  }

  const base = (process.env.SCREENER_SOURCE_URL || ARC.screenerSource).replace(
    /\/api\/indexer\/screener$/i,
    "/api/indexer",
  );
  // default cirque base
  const indexerBase = base.includes("/api/indexer")
    ? base.replace(/\/screener$/i, "")
    : "https://cirquedex.xyz/api/indexer";

  try {
    const url = `${indexerBase}/pools/${address}`;
    const res = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "arcfun/0.1" },
      next: { revalidate: 10 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `pool upstream ${res.status}`, address },
        { status: res.status === 404 ? 404 : 502 },
      );
    }
    const data = await res.json();

    // optional candles
    let candles: unknown = null;
    try {
      const cRes = await fetch(
        `${indexerBase}/pools/${address}/candles?interval=1h&limit=168`,
        {
          headers: { accept: "application/json", "user-agent": "arcfun/0.1" },
          next: { revalidate: 30 },
        },
      );
      if (cRes.ok) candles = await cRes.json();
    } catch {
      /* ignore */
    }

    return NextResponse.json({
      ...data,
      candles,
      chain: {
        chainId: ARC.chainId,
        rpcUrl: ARC.rpcUrl,
        explorer: ARC.explorer,
        nativeSymbol: ARC.nativeSymbol,
      },
      links: {
        explorerPool: `${ARC.explorer}/address/${address}`,
        explorerToken: data?.stats?.base?.address
          ? `${ARC.explorer}/token/${data.stats.base.address}`
          : null,
      },
      source: url,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "pool fetch failed" },
      { status: 500 },
    );
  }
}
