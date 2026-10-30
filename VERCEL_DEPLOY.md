# Deploy VESTORA to Vercel

This release fixes the repository packaging and includes an early validation step for the **exact error in your Vercel log**:

```text
[vite:build-html] Failed to resolve /src/main.tsx from /vercel/path0/index.html
```

The log shows npm installed dependencies and TypeScript finished, then Vite could not find the React entry file in the GitHub checkout. This is most consistent with **a missing file in the pushed commit**, the wrong directory structure or a mismatched Vercel root. It is **not** the TS5097 import-extension error. This archive contains `src/main.tsx` and `src/App.tsx`.

This ZIP is **flat at its root**: `package.json`, `index.html`, `src/`, `api/` and `vercel.json` are siblings. Upload **all** of them to your GitHub repository. **Do not set the Vercel root to `src/`**, and do not deploy just `src/main.tsx`. The early deployment check now reports a precise missing-file error before Vite starts.

## Recommended: GitHub → Vercel

1. Extract `VESTORA-vercel-ready.zip`. Copy **the contents**, not the ZIP, into the root of `gitshubhamkray/my-project` (or whichever repository Vercel imports). Ensure you can see `index.html`, `package.json`, `vercel.json` and `src/main.tsx` beside each other in GitHub's file browser. If your repository instead has a parent folder named `vestora`, choose **Root Directory: `vestora`** in Vercel.
2. From your local GitHub repository root, commit the corrected files:

   ```bash
   git add -A
   git commit -m "Fix VESTORA Vite entrypoint and Vercel deployment"
   git push origin main
   ```

   You can also upload the extracted files through the GitHub website. Confirm the latest commit's `src/main.tsx` exists under the chosen Vercel Root Directory.
3. In Vercel choose **Add New → Project → Import Git Repository** (or open your existing project).
4. Select **Framework Preset: Vite**, **Root Directory: `./`** when `package.json` is at the repository root, **Build Command: `npm run build`**, **Output Directory: `dist`**, **Install Command: `npm install`**, and **Node.js: 22.x**. The included `vercel.json` already sets the build and output settings.
5. Redeploy the **latest** Git commit (turn off Use existing Build Cache for troubleshooting). No API keys are needed for the demo UI or educational fallback responses.
6. Test: the home page, `/marketplace`, `/assets/gold`, `/wallet`, `/api/health` and `/api/providers`.

Alternatively, install the Vercel CLI globally with `npm i -g vercel`, run `vercel` at the folder root, and `vercel --prod` when ready.

## Optional environment variables (Vercel → Project Settings → Environment Variables)

| Name | Example / use | Mandatory? |
| --- | --- | --- |
| `TWELVE_DATA_API_KEY` | Authorized commodity price references | No |
| `METALS_DEV_API_KEY` | Gold, silver, platinum and palladium references | No |
| `FRED_API_KEY` | US 10-year Treasury yield reference | No |
| `OPENAI_API_KEY` | Server-side VESTORA Intelligence | No |
| `OPENAI_MODEL` | `gpt-4.1-mini` (or model enabled in your account) | No |
| `VITE_TESTNET_CHAIN_ID` | `11155111` (Sepolia) | No (default) |
| `VITE_BLOCK_EXPLORER` | `https://sepolia.etherscan.io` | No (default) |
| `VITE_ASSET_TOKEN_ADDRESS` | Deployed ERC-1155 contract address | Only for on-chain flow |
| `VITE_COMPLIANCE_ADDRESS` | Deployed mock-KYC contract address | Only for on-chain flow |
| `DATABASE_URL` | PostgreSQL connection string | Only for optional sync |
| `SESSION_SECRET` | Random 32+ character secret | Only for optional sync |
| `DATABASE_SSL` | `true` if your database requires SSL | No |

**Never set `DEPLOYER_PRIVATE_KEY` or `SEPOLIA_RPC_URL` in frontend environment variables.** Solidity deployment is separate from Vercel deployment. Never prefix API secrets with `VITE_` — Vite exposes those variables in the browser. After changing environment variables, redeploy.

## Common failures

| What you see | What to check |
| --- | --- |
| `[vite:build-html] Failed to resolve /src/main.tsx` | Confirm the **deployed GitHub commit** includes the case-sensitive `src/main.tsx` under Vercel Root Directory. This specific log means Vite could not find the file while bundling. The included `deploy:check` catches it earlier. |
| `Could not resolve './App'` | Confirm `src/App.tsx` exists beside `src/main.tsx`, preserving case. It is present in this archive. |
| `TS5097` | Remove `.ts`/`.tsx` from imports, or configure TypeScript extension imports. The entry imports in this package use extension-free local paths. |
| `Cannot find module 'react'` | Ensure npm installs from the root package. Do not deploy a copy of `src/` alone. |
| `npm ci` fails because there is no `package-lock.json` | Set **Install Command** to `npm install` until you generate and commit a lockfile. |
| Vercel shows `404` on direct URL `/assets/gold` | Ensure the root `vercel.json` is committed. It provides the Vite SPA rewrite. |
| UI loads, market or AI requests fail | Test `/api/health`. Check Functions logs and optional API keys; the UI can still run in demo mode. |
| Wrong Node or `engines` error | Use Node.js **22.x** in Vercel project settings. |

## Before pushing

```bash
npm install
npm run deploy:check
npm test
npm run build
```

For local development run `npm run dev`. The root build deploys the React/Vite app, while Vercel automatically deploys the standalone `api/*.ts` serverless functions. You **do not** deploy `server/index.ts` (the Express development server) as a separate Vercel service.

## Verification and current limitations

The no-dependency deployment checks and educational prototype tests have been run in the artifact environment. The **full production build could not be run here** because the environment cannot resolve npm's package registry, so a successful remote Vercel deployment cannot yet be claimed. If the next deployment fails, check Vercel **Deployments → [failed deployment] → Build Logs** for the first error. Verify the commit hash and Root Directory match the corrected checkout.

This is a **demo and testnet-only** educational product. Tokens do not represent real legal ownership or have redemption rights.
