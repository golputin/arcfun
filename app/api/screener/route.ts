import { NextResponse } from "next/server";
import { loadScreener } from "@/lib/screener";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await loadScreener();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "failed" },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET();
}
