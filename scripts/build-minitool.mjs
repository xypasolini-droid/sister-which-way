import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';
import postcss from 'postcss';
import { transform } from 'lightningcss';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(repo, 'dist/minitool');
const cache = path.join(repo, '.minitool-build');
const pkg = JSON.parse(await fs.readFile(path.join(repo, 'package.json'), 'utf8'));
const zip = path.join(repo, `dist/姐姐，我该怎么走-小红书-${pkg.version}.zip`);
await fs.mkdir(cache, { recursive: true });
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

// Enumerate actual engine states, including every cinematic shot and fallback.
await build({ entryPoints: [path.join(repo, 'scripts/collect-minitool-assets.ts')], outfile: path.join(cache, 'collect.cjs'), bundle: true, platform: 'node', format: 'cjs', target: 'node22', logLevel: 'warning' });
execFileSync(process.execPath, [path.join(cache, 'collect.cjs'), path.join(cache, 'assets.json')], { cwd: repo, stdio: 'inherit' });
execFileSync(process.execPath, [path.join(repo, 'scripts/prepare-minitool-assets.mjs'), path.join(cache, 'assets.json'), out, path.join(cache, 'image-integrity.json')], { cwd: repo, stdio: 'inherit' });

// Keep one codebase. Only container capabilities and local asset URLs differ.
await build({
  entryPoints: [path.join(repo, 'src/minitool/entry.tsx')], outfile: path.join(out, 'app.js'),
  absWorkingDir: repo, bundle: true, format: 'iife', platform: 'browser', target: ['es2017', 'chrome61'],
  minify: true, sourcemap: false, legalComments: 'none', charset: 'utf8', jsx: 'automatic',
  // React's optional bandwidth estimate must use its no-connection fallback;
  // navigator.connection is prohibited by the minitool contract.
  define: { 'process.env.NODE_ENV': '"production"', 'navigator.connection': 'undefined' },
  alias: { '@/lib/game-runtime': path.join(repo, 'src/minitool/platform.ts') },
  plugins: [{ name: 'offline-art-paths', setup(api) {
    api.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, async args => {
      if (args.path.includes('node_modules')) return;
      const text = await fs.readFile(args.path, 'utf8');
      const contents = text.replaceAll('/art/', './assets/art/').replaceAll('.png', '.webp');
      const ext = path.extname(args.path).slice(1);
      return { contents, loader: ext === 'tsx' ? 'tsx' : ext === 'ts' ? 'ts' : 'jsx', resolveDir: path.dirname(args.path) };
    });
  } }], logLevel: 'info',
});

const css = await fs.readFile(path.join(out, 'app.css'), 'utf8');
const sheet = postcss.parse(css);
const rules = [];
sheet.walkRules(rule => rules.push(rule));
const flex = new Map();
for (const rule of rules) {
  const display = rule.nodes.find(n => n.type === 'decl' && n.prop === 'display')?.value;
  const direction = rule.nodes.find(n => n.type === 'decl' && n.prop === 'flex-direction')?.value;
  if (/^(inline-)?flex$/.test(display ?? '') || direction) for (const selector of rule.selectors) flex.set(selector, direction ?? flex.get(selector) ?? 'row');
}

// Balanced CSS function parsing; minmax() is deliberately left as Grid syntax.
function splitArgs(value) { let level = 0, start = 0, parts = []; for (let i = 0; i < value.length; i++) { if (value[i] === '(') level++; else if (value[i] === ')') level--; else if (value[i] === ',' && level === 0) { parts.push(value.slice(start, i)); start = i + 1; } } parts.push(value.slice(start)); return parts.map(p => p.trim()); }
function fallbackFunctions(value) {
  let result = '', cursor = 0;
  const matcher = /\b(min|max|clamp)\(/g;
  for (let match; (match = matcher.exec(value));) {
    let end = matcher.lastIndex, level = 1;
    while (end < value.length && level) { if (value[end] === '(') level++; if (value[end] === ')') level--; end++; }
    const parts = splitArgs(value.slice(matcher.lastIndex, end - 1));
    let chosen = match[1] === 'clamp' ? parts[0] : match[1] === 'max' ? parts[0] : parts.find(p => /%|vw/.test(p)) ?? parts[0];
    chosen = fallbackFunctions(chosen);
    result += value.slice(cursor, match.index) + chosen; cursor = end; matcher.lastIndex = end;
  }
  return result + value.slice(cursor);
}
for (const rule of rules) {
  const direction = rule.nodes.find(n => n.type === 'decl' && n.prop === 'flex-direction')?.value;
  for (const decl of [...rule.nodes].filter(n => n.type === 'decl')) {
    decl.value = decl.value.replace(/([\d.]+)[dsl]vh/g, (_, n) => `calc(var(--app-height, 100vh) * ${Number(n) / 100})`);
    // CSS variables are defined even in Chrome 61, avoiding unsupported env().
    if (!decl.prop.startsWith('--')) decl.value = decl.value.replace(/env\((safe-area-inset-(?:top|right|bottom|left))(?:\s*,[^)]*)?\)/g, (_, name) => `var(--${name}, 0px)`);
    if (decl.prop === 'inset') { const parts = decl.value.split(/\s+(?![^()]*\))/); const [a,b=a,c=a,d=b] = parts; ['top','right','bottom','left'].forEach((prop,i)=>decl.cloneBefore({prop,value:[a,b,c,d][i]})); decl.remove(); continue; }
    const logical = /^(margin|padding)-(inline|block)(?:-(start|end))?$/.exec(decl.prop);
    if (logical) { const [,kind,axis,edge] = logical; const sides = axis === 'inline' ? ['left','right'] : ['top','bottom']; const vals = decl.value.split(/\s+(?![^()]*\))/); (edge ? [edge === 'start' ? 0 : 1] : [0,1]).forEach(i=>decl.cloneBefore({prop:`${kind}-${sides[i]}`,value:edge ? decl.value : vals[i] ?? vals[0]})); decl.remove(); continue; }
    if (decl.prop === 'overflow' && decl.value === 'clip') decl.value = 'hidden';
    if (decl.prop === 'aspect-ratio') { const nums = decl.value.split('/').map(Number); decl.cloneAfter({prop:'--legacy-aspect',value:decl.value === 'auto' ? '0' : String(nums[0] / (nums[1] ?? 1))}); }
    if (/\b(?:min|max|clamp)\(/.test(decl.value)) {
      const fallback = fallbackFunctions(decl.value);
      if (decl.prop.startsWith('--')) throw new Error(`Modern math in custom property needs explicit @supports: ${decl.toString()}`);
      decl.cloneBefore({value:fallback});
      const cap = /^min\((\d+px),/.exec(decl.value);
      if (decl.prop === 'width' && cap) decl.cloneBefore({prop:'max-width',value:cap[1]});
    }
    if (decl.prop === 'gap') {
      decl.cloneBefore({prop:'grid-gap'});
      const selectors = rule.selectors.filter(selector => flex.has(selector));
      if (selectors.length) {
        const child = postcss.rule({selector:selectors.map(s=>`html.no-flex-gap ${s} > * + *`).join(',')});
        const column = direction?.startsWith('column') ?? selectors.every(s=>flex.get(s)?.startsWith('column'));
        child.append({prop:column?'margin-top':'margin-left',value:decl.value.split(/\s+/).at(column?0:-1)});
        rule.after(child);
      }
    }
  }
}
const compiled = transform({filename:'style.css',code:Buffer.from(sheet.toString()),minify:true,sourceMap:false,targets:{chrome:61<<16,ios_saf:(18<<16)|(4<<8)}});
await fs.writeFile(path.join(out,'style.css'),compiled.code);
await fs.rm(path.join(out,'app.css'));
await fs.writeFile(path.join(out,'index.html'), `<!DOCTYPE html>\n<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><title>姐姐，我该怎么走</title><link rel="stylesheet" href="./style.css"></head><body><div id="root"><p style="padding:32px;color:#eee;background:#111">正在打开故事…</p></div><script src="./app.js"></script></body></html>\n`);

// Standard ZIP, no wrapper folder, no source files, deterministic ordering.
execFileSync('python3',['-c',`import pathlib,sys,zipfile\np=pathlib.Path(sys.argv[1]);z=pathlib.Path(sys.argv[2])\nwith zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as f:\n for a in sorted(p.rglob('*')):\n  if a.is_file(): f.write(a,a.relative_to(p).as_posix())\n`,out,zip]);
execFileSync(process.execPath,[path.join(repo,'scripts/validate-minitool.mjs'),out,zip],{cwd:repo,stdio:'inherit'});
console.log(`Final minitool ZIP: ${zip}`);
