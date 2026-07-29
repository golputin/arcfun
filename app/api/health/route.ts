import { NextResponse } from "next/server";
import { ARC } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(ARC.rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
      cache: "no-store",
    });
    const json = await res.json();
    const chainId = json.result ? Number.parseInt(json.result, 16) : null;
    return NextResponse.json({
      ok: true,
      configuredChainId: ARC.chainId,
      rpcChainId: chainId,
      rpcUrl: ARC.rpcUrl,
      explorer: ARC.explorer,
      nativeSymbol: ARC.nativeSymbol,
      nativeDecimals: ARC.nativeDecimals,
      usdc: ARC.usdc,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "rpc failed" },
      { status: 500 },
    );
  }
}
