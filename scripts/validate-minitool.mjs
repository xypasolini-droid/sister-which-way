import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
import postcss from 'postcss';
const require = createRequire(import.meta.url);
const acorn = require('next/dist/compiled/acorn');
const repo = path.resolve(import.meta.dirname, '..');
const directory = path.resolve(process.argv[2] ?? path.join(repo,'dist/minitool'));
const zip = process.argv[3] && path.resolve(process.argv[3]);
const errors = [], warnings = [];
const skillDirectories=[process.env.MINITOOL_SKILL_DIR,path.join(repo,'.codex/skills/minitool-zip-builder'),path.resolve(repo,'../../.codex/skills/minitool-zip-builder'),path.join(os.homedir(),'.codex/skills/minitool-zip-builder')].filter(Boolean);
let skillAudit;
for(const candidate of skillDirectories){const file=path.join(candidate,'scripts/audit_artifact.py');try{await fs.access(file);skillAudit=file;break;}catch{}}
if(!skillAudit)throw Error('Install minitool-zip-builder 1.10.0 into .codex/skills, or set MINITOOL_SKILL_DIR to its directory.');
async function files(root) { const result = []; for (const entry of await fs.readdir(root,{withFileTypes:true})) { const full = path.join(root,entry.name); if (entry.isSymbolicLink()) errors.push(`Symlink: ${full}`); else if (entry.isDirectory()) result.push(...await files(full)); else result.push(full); } return result; }
const list = await files(directory);
const allowed = new Set(['.html','.css','.js','.png','.jpg','.jpeg','.gif','.webp','.svg','.woff','.woff2','.json']);
for (const file of list) if (!allowed.has(path.extname(file)) || /(?:^|\/)(?:\.git|node_modules|\.DS_Store)(?:\/|$)/.test(file)) errors.push(`Unsupported file: ${file}`);
const html = await fs.readFile(path.join(directory,'index.html'),'utf8');
if (!/^<!doctype html>/i.test(html)||!/<html lang="zh-CN"/i.test(html)||!/charset="UTF-8"/i.test(html)) errors.push('HTML language/encoding/doctype');
if (!/viewport-fit=cover/.test(html)||!/width=device-width/.test(html)) errors.push('Viewport');
if (/<(?:iframe|object|base)\b|http-equiv\s*=|\bon\w+\s*=|javascript:|type\s*=\s*["']module/i.test(html)) errors.push('Forbidden HTML');
for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) if (!/src=/.test(script[1])||script[2].trim()) errors.push('Inline script');
for (const ref of html.matchAll(/(?:src|href)="([^"]+)"/g)) { if (!ref[1].startsWith('./')) errors.push(`Nonlocal HTML reference ${ref[1]}`); else try { await fs.access(path.join(directory,ref[1])); } catch { errors.push(`Missing HTML reference ${ref[1]}`); } }

for (const file of list.filter(name=>name.endsWith('.svg'))) {
  const svg=await fs.readFile(file,'utf8');
  if (/<(?:script|foreignObject)\b|\bon\w+\s*=|(?:href|src)=["'](?:https?:|\/\/)/i.test(svg)) errors.push(`Active or external SVG content: ${file}`);
}
const source = await fs.readFile(path.join(directory,'app.js'),'utf8');
let ast;
try { ast = acorn.parse(source,{ecmaVersion:2017,sourceType:'script'}); } catch (error) { errors.push(`ES2017 parser: ${error.message}`); }
const forbiddenNames = new Set(['fetch','XMLHttpRequest','WebSocket','EventSource','RTCPeerConnection','Worker','SharedWorker','Accelerometer','Gyroscope','Magnetometer','eval','Function','WebAssembly','PaymentRequest','Notification','SharedArrayBuffer']);
const forbiddenProperties = new Set(['requestFullscreen','webkitRequestFullscreen','getDisplayMedia','enumerateDevices','getBattery','getCurrentPosition','watchPosition','writeText','readText','bluetooth','usb','hid','serial','credentials','locks','connection','persist','serviceWorker','geolocation','clipboard','execCommand']);
let nodeCount = 0;
function walk(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { for (const child of node) walk(child); return; }
  nodeCount++;
  if ((node.type === 'CallExpression'||node.type === 'NewExpression') && node.callee?.type==='Identifier' && forbiddenNames.has(node.callee.name)) errors.push(`Forbidden call ${node.callee.name}`);
  if (node.type==='MemberExpression') {
    const prop = node.computed ? node.property?.value : node.property?.name;
    if (forbiddenProperties.has(prop)) errors.push(`Forbidden capability .${prop}`);
    if (['window','globalThis','self'].includes(node.object?.name) && forbiddenNames.has(prop)) errors.push(`Forbidden global ${prop}`);
    if (node.object?.name==='window' && ['open','prompt'].includes(prop)) errors.push(`Forbidden window.${prop}`);
  }
  if (node.type==='ImportDeclaration'||node.type?.startsWith('Export')) errors.push('Module syntax');
  for (const [key,value] of Object.entries(node)) if (key!=='type') walk(value);
}
walk(ast);
if (/写自己的决定|写下自己的决定|先写一句/.test(source)) errors.push('Removed free-input UI remains');
if (/\.\/assets\/art\/[^"'`\s]+\.png/.test(source)) errors.push('Unconverted PNG URL');
// The graph manifest covers dynamic image names; static literals get an extra
// independent existence check. Namespace/error-help URLs are never fetched.
for (const ref of source.matchAll(/["'`](\.\/assets\/art\/[^"'`$\s]+\.(?:webp|svg))["'`]/g)) try { await fs.access(path.join(directory,ref[1])); } catch { errors.push(`Missing literal image ${ref[1]}`); }
const css = await fs.readFile(path.join(directory,'style.css'),'utf8');
const sheet = postcss.parse(css);
sheet.walkDecls(decl=>{ if (/url\(\s*["']?(?:https?:|\/\/)/i.test(decl.value)) errors.push(`External CSS URL: ${decl.value}`); if (/\d[dsl]vh\b/.test(decl.value)) errors.push(`Unconverted dynamic viewport ${decl.value}`); if (decl.prop==='inset'||/^(padding|margin)-(inline|block)/.test(decl.prop)) errors.push(`Unconverted logical CSS ${decl.prop}`); });
if (!css.includes('--legacy-aspect')||!css.includes('.no-aspect-ratio')||!css.includes('.no-flex-gap')) errors.push('CSS baseline fallbacks missing');
if (!/\.no-flex-gap/.test(css)||!css.includes('grid-gap')) errors.push('Layout spacing fallbacks missing');

let skillResults=[];
for (const target of [directory,...(zip?[zip]:[])]) {
  try { skillResults.push({target,output:execFileSync('python3',[skillAudit,target],{encoding:'utf8'}).trim()}); } catch (error) { errors.push(`Bundled skill audit failed: ${error.stdout ?? error.message}`); }
}
let zipBytes = 0, sha256 = null;
if (zip) {
  const bytes = await fs.readFile(zip); zipBytes = bytes.length; sha256=createHash('sha256').update(bytes).digest('hex');
  if (zipBytes>10000000) errors.push('ZIP exceeds conservative decimal 10 MB gate');
  if (zipBytes>2*1024*1024) warnings.push('ZIP exceeds recommended 2 MiB target; full-size artwork retained. Hard 10 MB gate enforced.');
  try { execFileSync('python3',['-c',`import pathlib,sys,zipfile\nwith zipfile.ZipFile(sys.argv[1]) as z:\n names=z.namelist()\n assert 'index.html' in names and sum(n.endswith('.html') for n in names)==1\n assert len(names)==len(set(names))\n for n in names:\n  assert not n.startswith('/') and '..' not in pathlib.PurePosixPath(n).parts\n  assert z.read(n)==(pathlib.Path(sys.argv[2])/n).read_bytes()\n assert z.testzip() is None\n`,zip,directory]); } catch { errors.push('ZIP integrity/path/content check failed'); }
}
let images = null, graph = null;
try { images=JSON.parse(await fs.readFile(path.join(repo,'.minitool-build/image-integrity.json'),'utf8')); graph=JSON.parse(await fs.readFile(path.join(repo,'.minitool-build/assets.json'),'utf8')); } catch { errors.push('Graph/image integrity reports missing'); }
if(graph && (graph.storyRevision!==7 || graph.storyContentRevision!==8 || graph.routeCount!==6 || graph.decisionCount!==4 || graph.optionCount!==9 || graph.routes?.some(route=>route.choices.length!==2))) errors.push('0.7 story graph coverage mismatch');
const report = {status:errors.length?'FAILED':'STATIC_PASS_PLATFORM_PENDING',version:JSON.parse(await fs.readFile(path.join(repo,'package.json'),'utf8')).version,zip,zipBytes,sha256,fileCount:list.length,javaScriptBytes:Buffer.byteLength(source),cssBytes:Buffer.byteLength(css),es2017AstNodes:nodeCount,graph,images,skillResults,errors:[...new Set(errors)],warnings,pending:['创服平台模拟器：待用户验证（未上传）','Android 真机扫码：待用户验证','iOS 真机扫码：待用户验证','Chrome 61 JS/CSS 兼容性：未实测','首屏耗时、帧率、内存：未实测'],contract:'https://miniapp-sandbox.xiaohongshu.com/minitool/doc',contractUpdated:'2026-11-06',contractChecked:'2026-11-09',skillVersion:'1.10.0',onlineDocumentSha256:'8cb0ca1e02dc6a48e9a56237ffc28e133f2f38611998191e972073c94aa5f669'};
await fs.writeFile(path.join(repo,'dist/minitool-audit.json'),JSON.stringify(report,null,2));
const markdown = `# 小红书小工具静态校验\n\n版本：${report.version}。状态：${report.status}。\n\n- ZIP：${zipBytes.toLocaleString()} bytes；${(zipBytes/1048576).toFixed(2)} MiB。\n- 文件：${list.length}；经典脚本 ES2017 语法解析完成。\n- JS：${report.javaScriptBytes.toLocaleString()} bytes；CSS：${report.cssBytes.toLocaleString()} bytes。\n- SHA-256：\`${sha256}\`。\n- 故事穷举与图像完整性细项见同目录 minitool-audit.json。\n\n## 错误\n\n${report.errors.map(e=>'- '+e).join('\n')||'无。'}\n\n## 提醒\n\n${warnings.map(e=>'- '+e).join('\n')||'无体积提醒。'}\n\n## 平台与真机\n\n${report.pending.map(e=>'- '+e).join('\n')}\n\n普通浏览器诊断不作为小红书平台验收依据。将本 ZIP 上传创服平台后，须先跑完整功能，再用 Android 与 iOS 扫码验证同一份产物。\n`;
await fs.writeFile(path.join(repo,'dist/minitool-audit.md'),markdown);
console.log(JSON.stringify({status:report.status,zipBytes,fileCount:list.length,errors:report.errors,warnings},null,2));
if (errors.length) process.exitCode=1;
