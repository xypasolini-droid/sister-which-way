import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import sharp from 'sharp';

// Encode from PNG masters without resizing. The ZIP builder independently
// rechecks every copied WebP against its master before allowing delivery.
const repo = path.resolve(import.meta.dirname, '..');
const folder = path.join(repo, 'public/art/sister-v6');
const cache = path.join(repo, '.minitool-build/v6-quality');
const minimumPsnr = 38.1;
const apply = process.argv.includes('--apply');
await fs.mkdir(cache, { recursive: true });
const definition = path.join(cache, 'presentation.cjs');
await build({ entryPoints: [path.join(repo, 'src/lib/six-story-presentation.ts')], outfile: definition, bundle: true, platform: 'node', format: 'cjs', logLevel: 'silent' });
const { SIX_ART } = createRequire(import.meta.url)(definition);
const names = [...new Set(Object.values(SIX_ART).map(art => path.basename(art.src, '.webp')))];
// Fail before changing any public file when an expected master is missing.
await Promise.all(names.map(name => fs.access(path.join(folder, name + '.png'))));
let prior = [];
try { prior = JSON.parse(await fs.readFile(path.join(cache, 'candidates.json'), 'utf8')); } catch {}
const records = [];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

for (const name of names) {
  const png = await fs.readFile(path.join(folder, name + '.png'));
  const sourceSha256 = hash(png);
  const before = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  async function compare(bytes) {
    const after = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (before.info.width !== after.info.width || before.info.height !== after.info.height || before.data.length !== after.data.length) throw Error('Dimension mismatch: ' + name);
    let error = 0, count = 0, alphaExact = true;
    for (let i = 0; i < before.data.length; i += 4) {
      if (before.data[i + 3] !== after.data[i + 3]) alphaExact = false;
      if (before.data[i + 3]) for (let c = 0; c < 3; c++) {
        error += ((before.data[i + c] - after.data[i + c]) * before.data[i + 3] / 255) ** 2;
        count++;
      }
    }
    return { alphaExact, psnrDb: error ? 10 * Math.log10(255 ** 2 / (error / count)) : null };
  }
  const passes = metrics => metrics.alphaExact && (metrics.psnrDb === null || metrics.psnrDb >= minimumPsnr);
  let selected, quality, encoding = 'WebP lossy RGB, exact alpha';
  const previous = prior.find(record => record.name === name && record.sourceSha256 === sourceSha256);
  if (previous) {
    try {
      const bytes = await fs.readFile(path.join(cache, name + '.webp'));
      if (passes(await compare(bytes))) { selected = bytes; quality = previous.quality; encoding = previous.encoding || encoding; }
    } catch {}
  }
  if (!selected) {
    const candidates = new Map();
    async function candidate(q) {
      if (!candidates.has(q)) {
        const bytes = await sharp(png).webp({ quality: q, effort: 6, smartSubsample: true, alphaQuality: 100 }).toBuffer();
        candidates.set(q, { bytes, metrics: await compare(bytes) });
      }
      return candidates.get(q);
    }
    let low = 78, high = 100;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (passes((await candidate(mid)).metrics)) high = mid; else low = mid + 1;
    }
    const best = await candidate(low);
    if (passes(best.metrics)) { selected = best.bytes; quality = low; }
    else {
      selected = await sharp(png).webp({ nearLossless: true, quality: 60, effort: 6 }).toBuffer();
      encoding = 'near-lossless WebP'; quality = 60;
      if (!passes(await compare(selected))) {
        selected = await sharp(png).webp({ lossless: true, effort: 6 }).toBuffer();
        encoding = 'lossless WebP'; quality = null;
      }
    }
  }
  const metrics = await compare(selected);
  if (!passes(metrics)) throw Error('Clarity gate failed: ' + name);
  await fs.writeFile(path.join(cache, name + '.webp'), selected);
  const record = { name, source: name + '.png', output: name + '.webp', width: before.info.width, height: before.info.height, sourceSha256, sha256: hash(selected), encoding, quality, ...metrics, bytes: selected.length };
  records.push(record);
  console.log(JSON.stringify({ name, quality, psnrDb: metrics.psnrDb, bytes: selected.length }));
}
await fs.writeFile(path.join(cache, 'candidates.json'), JSON.stringify(records, null, 2) + '\n');
const report = { version: '0.6.0', storyRevision: 6, storyContentRevision: 7, checkedAt: new Date().toISOString(), minimumPsnrDb: minimumPsnr, resized: false, alphaExact: true, count: records.length, totalBytes: records.reduce((sum, record) => sum + record.bytes, 0), images: records };
if (apply) {
  for (const record of records) await fs.copyFile(path.join(cache, record.output), path.join(folder, record.output));
  await fs.writeFile(path.join(folder, 'encoding-audit.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ applied: apply, images: report.count, imageBytes: report.totalBytes, resized: false }));
