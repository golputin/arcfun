export type TokenSide = {
  address: string;
  symbol: string;
  name?: string;
  decimals?: number;
  logoUrl?: string | null;
};

export type WindowStats = {
  chg: number;
  volUsd: number;
  txns: number;
  buys: number;
  sells: number;
  traders: number;
};

export type MarketStatus = "graduated" | "bonding" | "unknown";

export type ScreenerRow = {
  pool: string;
  feeBps: number;
  createdTs: number;
  base: TokenSide;
  quote: TokenSide;
  priceUsd: number;
  mcapUsd: number;
  liquidityUsd: number;
  balanceTvlUsd?: number;
  windows: Partial<Record<"m5" | "h1" | "h6" | "h24", WindowStats>>;
  holders?: number;
  holdersDelta24h?: number;
  top10Pct?: number;
  transferProbe?: string;
  spark?: number[];
  /** optional explicit status from indexer */
  status?: MarketStatus | string;
  protocol?: string;
  marketStatus?: MarketStatus;
};


export type ScreenerResponse = {
  rows: ScreenerRow[];
  lastBlock: number | string | null;
  source: string;
  chain: {
    chainId: number;
    rpcUrl: string;
    explorer: string;
    nativeSymbol: string;
  };
  stats: {
    pairs: number;
    liquidityUsd: number;
    volume24hUsd: number;
    swaps24h: number;
  };
};
