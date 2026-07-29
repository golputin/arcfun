# ArcFun — Arc Network Dex Screener

DexScreener / Cirque-style **token screener** for **Arc Network**.

## Network

| | |
|--|--|
| **Chain ID** | `5042` (`0x13b2`) |
| **RPC** | `https://real-pump-soon-trust-me-bro-again.poptyedev.com/` |
| **Native** | USDC (18 decimals at chain gas layer; USDC ERC-20 `0x3600…0000` is 6 decimals) |
| **Explorer** | https://arc-mainnet.cloud.blockscout.com/ |
| **Domain (Circle Gateway)** | `26` |

Configured in [`lib/config.ts`](./lib/config.ts).

## Features (Cirque-inspired)

- Stats bar: pairs, combined liquidity, 24h volume, swaps, last block
- Tabs: **Trending · Top · Gainers · New pairs**
- Timeframes: **5M · 1H · 6H · 24H**
- Search + min liquidity / min-max mcap filters
- Table: price, % changes, vol, liq, mcap, txns, traders, holders, top10, age, sparkline
- Live RPC block number via your Arc endpoint
- `/api/screener` JSON API
- `/api/health` RPC health
- **Pool detail** `/pools/[address]` (Cirque-style token page)
- `/api/pools/[address]` pool+trades+holders JSON

## Data source

Default pair feed: `SCREENER_SOURCE_URL` or Cirque Arc indexer  
`https://cirquedex.xyz/api/indexer/screener` (same chain, battle-tested pair stats).

Fallback: Blockscout ERC-20 token list if indexer is down.

Override:

```bash
SCREENER_SOURCE_URL=https://your-indexer/api/screener
NEXT_PUBLIC_ARC_RPC=https://your-arc-rpc
```

## Quick start

```bash
npm install
npm run dev
# http://localhost:3000
```

```bash
npm run build && npm start
```

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- viem-ready chain config (RPC via fetch)

## Repo

GitHub: `golputin/arcfun` (deploy key enabled)
