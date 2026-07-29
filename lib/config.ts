export const ARC = {
  name: "Arc",
  chainId: 5042,
  chainIdHex: "0x13b2",
  rpcUrl:
    process.env.NEXT_PUBLIC_ARC_RPC ||
    "https://real-pump-soon-trust-me-bro-again.poptyedev.com/",
  explorer: "https://arc-mainnet.cloud.blockscout.com",
  nativeSymbol: "USDC",
  /** User-stated gas/native decimals for Arc native unit */
  nativeDecimals: 18,
  /** Canonical USDC token on Arc (Circle) uses 6 decimals as ERC-20 */
  usdc: "0x3600000000000000000000000000000000000000",
  usdcDecimals: 6,
  domainId: 26,
  factories: [
    "0x89Ba7EB908e8200713d8953Ece233E909C0Eb2C0",
    "0xf0db7b58379503491d857dB50AC9ece64c653918",
  ],
  /** Optional live indexer (same chain data source used by Cirque-style screeners) */
  screenerSource:
    process.env.SCREENER_SOURCE_URL ||
    "https://cirquedex.xyz/api/indexer/screener",
  blockscoutApi: "https://arc-mainnet.cloud.blockscout.com/api/v2",
} as const;

export const TIMEFRAMES = ["m5", "h1", "h6", "h24"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];
