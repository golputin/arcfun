import type { Metadata } from "next";
import "./globals.css";
import { ARC } from "@/lib/config";

export const metadata: Metadata = {
  title: "ArcFun · Dex Screener",
  description: `DexScreener-style token screener for Arc Network (chain ${ARC.chainId})`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-arc-line/80 bg-arc-bg/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arc-lime text-black font-black text-sm shadow-glow">
                  A
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-wide">ArcFun</div>
                  <div className="text-[11px] text-arc-muted">Dex screener · chain {ARC.chainId}</div>
                </div>
              </div>
              <nav className="hidden items-center gap-1 text-sm text-arc-muted md:flex">
                <a className="rounded-lg px-3 py-1.5 text-arc-text bg-white/5" href="/">
                  Screener
                </a>
                <a
                  className="rounded-lg px-3 py-1.5 hover:bg-white/5 hover:text-arc-text"
                  href={ARC.explorer}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explorer
                </a>
              </nav>
              <div className="rounded-full border border-arc-line bg-arc-panel px-3 py-1 font-mono text-[11px] text-arc-cyan">
                RPC live · {ARC.nativeSymbol}
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-[1600px] px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
