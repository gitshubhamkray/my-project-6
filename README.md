# VESTORA — Own a fraction. Build a fortune.

**A premium, educational tokenised micro-investing prototype** built with React, TypeScript, Vite, Tailwind CSS utilities + a bespoke design system, Node/Express, Recharts, ethers v6, Solidity, and Hardhat. It includes a complete responsive product UI, source-attributed market data, fictional sample investments, a local portfolio, optional PostgreSQL workspace sync, optional server-side AI, and capped ERC-1155 claims on **Ethereum Sepolia testnet**.

> **IMPORTANT:** VESTORA is an educational prototype, not a brokerage, investment adviser, exchange, bank, custodian, real-property platform or identity-verification service. The sample asset values and sample tokens are fictional. **No real money changes hands and tokens do not confer title to gold, commodities, crypto, securities, real estate, cash flows or any legally enforceable asset interest.** Mock KYC has no regulatory significance. Never deploy these demo contracts for real assets or real funds.

## Deploy on Vercel

**For Vercel setup, see [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)**. This release pins Node 22, checks entry files, supports SPA deep links and Vercel Functions, and provides `npm run deploy:check`. The new Vercel-ready ZIP has `package.json` at its root, not inside an extra `vestora/` folder. **Important:** replace the files in your GitHub repository; updating a ZIP locally does not change what Vercel builds.

## Quick start

Prerequisites: **Node.js 20+**, npm, and internet access to download packages. A testnet wallet is optional.

```bash
# From this project directory
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5173**. The Vite frontend proxies `/api` to the Express backend at `http://localhost:8787`. The development command starts both processes. The app works in **browser-only demo mode** with no credentials; external price and news data will show actual provider results when accessible, or an explicit unavailable state.

To build and serve the compiled production frontend:

```bash
npm run build
NODE_ENV=production npm start
# http://localhost:8787
```

To run the included local arithmetic/catalogue/educational-fallback tests:

```bash
npm test
```

To run contract tests (downloads a separate Solidity toolchain and compiler on first use):

```bash
cd contracts
npm install
npm test
```

> **Build verification status in the creation environment:** Node test suite, TypeScript syntax parsing, and deployment structure checks passed. The sandbox lacked DNS/npm package-registry access, so `npm install`, Vite's dependency build, and the Hardhat compiler/test suite could **not** be executed here. Run `npm install && npm run build` and `cd contracts && npm install && npm test` in a network-enabled environment. A successful production build is **not claimed** until you run those commands.

## Screens and functionality

| Page | Features |
| --- | --- |
| Overview | Editorial hero, ticker, source-labeled market summaries, curated samples, educational journey, AI preview, illustrative tokenisation comparison, blockchain disclosures and CTA |
| Marketplace | 27 educational assets, search, 7 category filters, token price/risk/market movement sorting, persistent watchlist, 2–3 asset comparison and invest actions |
| Markets | Live or delayed **external market reference** table, verified provider history, 1D/1W/1M/3M/1Y/ALL chart filters, sources/units/timestamps, real BBC business RSS when accessible |
| Asset Details | Market reference vs sample token price, historical chart, risk model, tokenisation methodology, ownership calculator, price alerts (local), asset-specific AI link |
| My Portfolio | Browser-local seeded *demo* holdings, allocation donut, risk exposure bar, sample P/L, simulated scenario chart **clearly marked not historical or predictive** |
| Wallet | Real MetaMask provider connection, Sepolia chain switching, ERC-1155 balanceOf, network info, copied address, explorer links, local disconnect |
| Investment Flow | Asset/amount → quantity → disclosures → **simulated** KYC → demo/testnet mode → confirmation → result; only confirmed testnet hashes are identified as on-chain |
| AI Intelligence | Contextual asset selection and educational questions, secure optional OpenAI backend, **labeled** predefined educational responses without a configured key |
| Transactions | Distinct demo/testnet records, confirmations, explorer verification for chain transactions, locally generated CSV export |
| Learn | Six expandable lessons, a three-question interactive quiz and educational disclosures |
| Settings | Dark/light theme, simulated onboarding profile, locally saved price alerts, browser data deletion, optional user-initiated anonymous PostgreSQL sync |

Navigation, wallet controls, filtering, watchlists, calculators, simulation and education features work without live commodity API credentials. No artificial price observations or historical market series are generated. The `Portfolio` *example scenario* is explicitly described as a fabricated educational illustration, not market data.

## Market data — actual providers, never fabricated quotes

The `server/providers.ts` provider abstraction supports:

| Asset class | Provider | Configuration | Notes |
| --- | --- | --- | --- |
| Bitcoin, Ethereum, Solana, XRP | CoinGecko public API | No key by default | Public pricing and provider-provided 24h change; rate limits and market history availability vary. Live is only used for sufficiently recent provider timestamps. |
| Gold, silver, platinum, palladium | Metals.Dev | `METALS_DEV_API_KEY` | Latest snapshot in USD per troy ounce **when the endpoint reports a valid value**. Provider market coverage and exact contract basis must be verified. |
| Metals, energy, agriculture, supplementary precious metals | Twelve Data | `TWELVE_DATA_API_KEY` | Provider-specific quote/time series mappings; unsupported tickers/intervals and free-plan restrictions show **Unavailable**. Coverage and units must be confirmed with the provider for any production deployment. |
| US Treasury 10-year benchmark yield | Federal Reserve FRED (`DGS10`) | `FRED_API_KEY` | Historical/delayed yield observations; not a bond token price. |
| Fictional real estate | No external public quote | N/A | **Unavailable** by design; there is no underlying real property. |
| Business headlines | BBC News Business RSS | No key | Actual fetched RSS headlines, publication timestamps, and links, or an unavailable message. |

**Data handling:** API calls use timeouts, rate-limit/missing-result handling, in-memory caching, explicit provider attribution, timestamps, correct asset display-unit labels, and a 5-minute frontend refresh. Prices/changes are `null` when not accessible. The backend never substitutes random or stale fabricated prices. Provider statuses are `Live`, `Delayed`, or `Unavailable`; not every public provider offers exchange-real-time access. Twelve Data symbol codes are illustrative adapter mappings and need confirmation against your chosen subscription before relying on an instrument. Time-zone and measurement conventions vary between data sources.

Example server-side `.env`:

```dotenv
PORT=8787
TWELVE_DATA_API_KEY=your_server_only_key
METALS_DEV_API_KEY=your_server_only_key
FRED_API_KEY=your_server_only_key
OPENAI_API_KEY=your_server_only_key
OPENAI_MODEL=gpt-4.1-mini
```

Keep keys on the backend. **Never** prefix secret keys with `VITE_`. The only `VITE_` environment values are public testnet settings/contract addresses.

## Optional AI assistance

`POST /api/intelligence` runs a server-side OpenAI Responses API request when `OPENAI_API_KEY` is set. The model receives the educational asset identifier, prompt, and **editorial** risk score. It is instructed not to invent quotes, historical volatility, assured returns or ownership rights. Without the key—or after an AI request failure—the route supplies a clearly labelled **Educational demo** using predefined explanations for common assets and a generic fallback for others. Educational output is *not* personal financial advice.

## Blockchain: Sepolia ERC-1155 demo claims

The Solidity project lives in [`contracts/`](contracts/):

- **ComplianceManager.sol**: testnet-only mock KYC; `selfAttestForDemo()` lets any wallet mark itself approved. This deliberately **is not** real KYC/AML and is unfit for production.
- **AssetToken.sol**: OpenZeppelin ERC-1155 multi-token with admin-controlled registration, supply caps, `MINTER_ROLE`, per-wallet faucet limits, recipient/sender mock-approval checks and emergency pause.
- **scripts/deploy.js**: deploys both contracts and registers token IDs **1–27**, matching `src/data/assets.ts`.
- **test/AssetToken.test.js**: tests mint/claims, missing approval, claim cap, transfer restrictions, and admin permissions/pause.

### Deploy to a testnet

1. Use a **dedicated test-only** MetaMask/deployer account and acquire **free Sepolia ETH** from a trusted faucet for gas. Never transfer mainnet ETH or real funds.
2. `cd contracts && npm install && cp .env.example .env`
3. Set `SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY` in **`contracts/.env`**, never frontend `.env`. The key must be prefixed `0x`. Do not commit it.
4. Optionally host `public/metadata/*.json` at a public HTTPS origin and set `METADATA_BASE_URI=https://your-domain/metadata` in `contracts/.env`. Without this, the deployment script embeds minimal **self-contained data-URI metadata** for every token.
5. Run `npm run compile && npm test`.
6. Run `npm run deploy:sepolia`. Deployment makes many on-chain transactions (two contracts plus 27 registrations), so allow sufficient **test ETH** and check RPC limits.
7. Copy `compliance` and `assetToken` from `contracts/deployment.json` to the **root** `.env`:

```dotenv
VITE_COMPLIANCE_ADDRESS=0xYourDeployedComplianceManager
VITE_ASSET_TOKEN_ADDRESS=0xYourDeployedAssetToken
VITE_TESTNET_CHAIN_ID=11155111
VITE_BLOCK_EXPLORER=https://sepolia.etherscan.io
```

8. Restart Vite, connect MetaMask, select Sepolia and choose **Sepolia testnet** during the investment flow. On first claim, MetaMask will ask you to **self-attest** simulated KYC in one transaction before claiming ERC-1155 demo units in a second transaction.
9. Confirm the `claimDemo` transaction, inspect its transaction hash in Sepolia Etherscan, and refresh the Wallet page to fetch `balanceOf`. Only testnet receipts are shown as blockchain transactions.

**Free demo claims are capped per-wallet by the contract** (100 or fewer tokens per asset). The on-chain flow does **not** charge the illustrative USD investment amount. Sepolia gas is paid in test ETH; the UI states this. Testnet tokens have no redemption value. The deployment script intentionally refuses networks other than local Hardhat or Sepolia.

### Contract security boundaries

The demo uses `selfAttestForDemo()` by design, public faucet claims, and basic restrictions. It is **not audited**, cannot secure real-world custody or asset backing, and must not be used for real-money transactions, production permissioned KYC, investment contracts, or claims on property. Real production tokenisation would require asset custody, off-chain enforceability, regulatory counsel, independent audit, and robust identity checks.

## Optional PostgreSQL workspace persistence

Demo state lives in the browser by default. To enable **optional, explicitly user-initiated** sync:

1. Provision PostgreSQL and set a server-side `DATABASE_URL`.
2. Set `SESSION_SECRET` to an unpredictable 32+ character string and, where required, `DATABASE_SSL=true`.
3. Apply `database/schema.sql` (`psql "$DATABASE_URL" -f database/schema.sql`).
4. Restart the API and open **Settings → Optional PostgreSQL workspace sync**.
5. Click **Save to server** or **Restore from server**. The server uses a signed, HttpOnly, SameSite cookie to isolate an anonymous demo workspace per browser session.

Sync only includes demo holdings, watchlist, transactions, alerts, cash and theme. Mock-KYC display name/email, private keys and documents are **never included** in the synced object. This is an anonymous prototype; it is **not** an authenticated multi-device portfolio service. The save API validates basic shape and size limits. Use a real identity service, authorization, CSRF defense, retention rules, database migrations and security review before accepting sensitive information in any real deployment.

## Project structure

```text
vestora/
├── src/
│   ├── App.tsx / main.tsx / styles.css
│   ├── components/       # sidebar, topbar, charts, cards, ticker, investment flow
│   ├── pages/            # all 10 connected screens
│   ├── context/          # demo state, watchlist, wallet, quotes, activity
│   ├── data/             # all 27 educational asset definitions
│   └── lib/              # quote API, MetaMask/ethers, arithmetic utilities
├── server/
│   ├── index.ts          # REST endpoints, error handling, static UI
│   ├── providers.ts      # reusable market data adapters and cache
│   ├── news.ts           # external RSS feed, with unavailable fallback
│   ├── ai.ts             # secure AI + labelled educational demo mode
│   └── database.ts       # optional anonymous PostgreSQL workspace API
├── contracts/
│   ├── contracts/        # AssetToken.sol, ComplianceManager.sol
│   ├── scripts/deploy.js
│   ├── test/AssetToken.test.js
│   └── hardhat.config.js
├── database/schema.sql
├── tests/prototype.test.mjs
├── .env.example / contracts/.env.example
└── vite.config.ts / package.json / tsconfig.json
```

## HTTP API

- `GET /api/health` — service readiness.
- `GET /api/markets?ids=gold,bitcoin` — attributed price references, units, timestamps, changes and statuses.
- `GET /api/history/:assetId?range=1M` — provider observations (range: `1D`, `1W`, `1M`, `3M`, `1Y`, `ALL`).
- `GET /api/news` — external business news only when retrieved.
- `POST /api/intelligence` — optional secure LLM or educational demo.
- `GET /api/providers` — configured integrations (no secrets).
- `GET /api/workspace`, `POST /api/workspace` — optional anonymous PostgreSQL demo persistence.

## Testing and known prototype limitations

- No real-money payments, order book, securities trading, commodity custody, fiat wallet, liquidity pool, valuation engine, or investment advice.
- No guarantees of price-provider coverage; real-time access is subject to API plans, instrument mapping and market hours.
- The portfolio uses fixed illustrative token prices, so its P/L is **$0 until a revaluation model is introduced**; a synthetic example chart is clearly labeled as educational, not actual performance.
- Watchlist alerts are stored locally only. There is **no** background notification/monitoring process.
- The UI shows recorded browser transactions and on-chain wallet balances; it is not a full historical chain indexer.
- Market-news RSS is external and may be unavailable under network restrictions.
- Solidity contract compiler tests and npm/Vite production build require an internet-enabled installation; they were not run in this artifact-generation sandbox.

Made for hackathons, university competitions and learning the mechanics of responsible tokenisation.
