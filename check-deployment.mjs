#!/usr/bin/env node
/** No-dependency checks for the files that Vercel needs to deploy VESTORA. */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(path.join(root, p), 'utf8');
const requireFile = p => { if (!existsSync(path.join(root, p))) throw Error(`Missing ${p}`); };
function check(label, f) { try { f(); console.log(`✓ ${label}`); } catch (err) { console.error(`✗ ${label}\n  ${err.message}`); process.exitCode = 1; } }
check('Vercel config is a supported Vite setup', () => {
  const config = JSON.parse(read('vercel.json'));
  if (config.framework !== 'vite' || config.outputDirectory !== 'dist') throw Error('Expected Vite and dist/');
  if (!config.rewrites?.some(x => x.source === '/(.*)' && x.destination === '/index.html')) throw Error('Missing SPA fallback');
});
check('Root directory contains the required Vercel entry files', () => {
  for (const p of ['package.json','index.html','vite.config.ts','tsconfig.json','src/main.tsx','src/App.tsx','public/favicon.svg']) requireFile(p);
  const html=read('index.html');
  if (!html.includes('src="/src/main.tsx"')) throw Error('HTML must load /src/main.tsx');
});
check('Build and runtime scripts are Vercel compatible', () => {
  const pkg = JSON.parse(read('package.json'));
  if (!pkg.scripts.build?.includes('vite build')) throw Error('Missing Vite production build');
  if (!pkg.engines?.node?.includes('22')) throw Error('Node.js 22 not configured');
});
check('Core API endpoints exist for serverless deployment', () => {
  for (const p of ['health','history','markets','news','providers','intelligence','workspace']) requireFile(`api/${p}.ts`);
  requireFile('api/history/[id].ts');
});
check('All relative imports in application source have matching local files', () => {
  const files=[];
  function walk(d){for(const entry of readdirSync(d)){const x=path.join(d,entry); if(statSync(x).isDirectory()) walk(x); else if(/\.(ts|tsx|mjs|js)$/.test(entry)) files.push(x);}}
  for(const dir of ['src','server','api','scripts']) walk(path.join(root,dir));
  const missing=[];
  for(const file of files) {
    const source=readFileSync(file,'utf8');
    for(const [,s] of source.matchAll(/(?:from\s*|import\s*\(|import\s*)['"](\.{1,2}\/[^'"\n]+)['"]/g)){
      const base=path.resolve(path.dirname(file),s);
      const ext=base.replace(/\.(js|jsx|ts|tsx)$/,'');
      if(![base,ext+'.ts',ext+'.tsx',ext+'.js',ext+'.jsx',path.join(base,'index.ts'),path.join(base,'index.tsx')].some(existsSync)) missing.push(`${path.relative(root,file)}: ${s}`);
    }
  }
  if(missing.length) throw Error(`Unresolved import(s):\n  ${missing.join('\n  ')}`);
});
if (process.exitCode) process.exit(process.exitCode);
console.log('\nDeployment structure checks passed. Run npm run build after installing dependencies.');
