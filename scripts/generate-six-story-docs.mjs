import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const repo = path.resolve(import.meta.dirname, '..');
const directory = path.join(repo, 'docs/design/decision-tree');
const cache = path.join(repo, '.minitool-build');
await fs.mkdir(directory, { recursive: true });
await fs.mkdir(cache, { recursive: true });
const bundle = path.join(cache, 'story-doc-data.cjs');
await build({ stdin: { contents: `
import { choose, getEnding } from './src/lib/branch-story';
import { createSixState, SIX_NODES, SIX_ENDING_ROUTES } from './src/lib/six-ending-story';
import { getSixShots } from './src/lib/six-story-presentation';
export const decisions = Object.values(SIX_NODES).filter(node => node.choices.length);
export const routes = Object.entries(SIX_ENDING_ROUTES).map(([id, choices]) => {
 let state = createSixState(); let shots = [...getSixShots(state)];
 for (const choice of choices) { state = choose(state, choice)!.state; shots.push(...getSixShots(state)); }
 const ending = getEnding(state)!;
 return { id, number: ending.number, title: ending.title, mode: ending.mode, choices, durationMs: shots.reduce((sum, shot) => sum + shot.durationMs, 0), shots: shots.map(s => ({ id: s.id, art: s.art, durationMs: s.durationMs })) };
});`, resolveDir: repo, loader: 'ts' }, bundle: true, platform: 'node', format: 'cjs', outfile: bundle, logLevel: 'silent' });
const { decisions, routes } = createRequire(import.meta.url)(bundle);
await fs.writeFile(path.join(directory, 'decision-tree-v060.json'), JSON.stringify({ version: '0.6.0', storyRevision: 6, storyContentRevision: 7, decisions, routes }, null, 2));
const mmd = `flowchart TD
 OPEN[最后一点粮食 · 父亲已被捕<br/>姐姐握着剪刀] --> CUT{是否剪发？}
 CUT -->|放下剪刀| AID[托买、赊账、变卖家当与求援<br/>接连失败]
 AID --> MARRIAGE{亲戚提出婚事<br/>提供粮食与住处}
 MARRIAGE -->|拒绝婚事，继续等待援助| HUNGER[家当卖尽 · 长期饥饿]
 HUNGER --> E01[01 没有升起的炊烟<br/>家中四人相继饿死 · 父亲不在]
 MARRIAGE -->|和家人一起，恳求姐姐答应| WEDDING[姐姐迫于生存压力出嫁]
 WEDDING --> E02[02 姐姐出嫁的那一天<br/>其他三人存活 · 饭桌少了姐姐]
 CUT -->|剪掉头发| WORK[亡兄旧衣、小帽、男孩名字阿提什<br/>与莱拉互助谋生，仍被欺负与克扣工钱]
 WORK --> WAR[爆炸、军车、商铺关闭<br/>两人即将被人流冲散]
 WAR --> WHERE{先往哪里走？}
 WHERE -->|先回家找母亲和姐弟| TRUCK[带家人赶上舅舅的露天货车]
 TRUCK --> E04[04 离城的四个人<br/>父亲仍被囚 · 莱拉去向不明]
 WHERE -->|拉住莱拉，跟人群出城| GATE[两人拉手到城门 · 被当作男孩征用]
 GATE --> MARCH[搬运、传令、越走越远]
 MARCH --> E03[03 没有返程的路<br/>被送往前线]
 WHERE -->|回找被冲散的莱拉| FIND[先失散 · 再逆人流找到她]
 FIND --> HIT[巡查认出女主 · 身份暴露<br/>遭打昏迷]
 HIT --> TALE[梦中成为苏莱曼<br/>寻找种子 → 恐惧受伤 → 得到帮助]
 TALE --> KING[面对象王 · 想起亡兄]
 KING --> VOICES{家人叫她回家<br/>莱拉叫她醒来}
 VOICES -->|走向梦中的家人| SPRING[种子发芽 · 丰收与团聚<br/>父亲、姐姐、幼弟、亡兄都在]
 SPRING --> E05[05 没有醒来的春天 · 梦境<br/>现实中始终未醒 · 家人去向未知]
 VOICES -->|回应莱拉：我要活下去| WAKE[醒来 → 获救 → 逃离]
 WAKE --> YEARS[多年女性互助、学习、自卫与组织守望]
 YEARS --> E06[06 守护之地 · 原创未来<br/>成年女性护卫队长 · 家人去向未知]
 classDef ending fill:#202529,color:#fff,stroke:#77818a,stroke-width:2px;
 class E01,E02,E03,E04,E05,E06 ending;
`;
await fs.writeFile(path.join(directory, '姐姐我该怎么走-v060.mmd'), mmd);
// Uncompressed draw.io XML: all boxes, labels and connectors are individually editable.
const boxes = [
 ['OPEN','最后一点粮食\n父亲已被捕，全家知情\n姐姐握着剪刀',650,10,260,80],['CUT','是否剪发？',650,130,260,70,'decision'],
 ['AID','托买、赊账、变卖家当、求援\n接连失败',150,260,260,80],['MARRIAGE','亲戚提出婚事\n提供粮食与住处',150,390,260,80,'decision'],
 ['HUNGER','家当卖尽\n长期饥饿加重',10,560,230,75],['WEDDING','姐姐迫于生存压力\n接受婚事、离家',280,560,230,75],
 ['E01','01 没有升起的炊烟\n家中四人相继饿死\n父亲不在',10,710,230,100,'ending'],['E02','02 姐姐出嫁的那一天\n其他三人活下来\n饭桌少了姐姐',280,710,230,100,'ending'],
 ['WORK','亡兄旧衣、小帽、阿提什\n与莱拉互助谋生，仍受欺负',1000,260,280,80],['WAR','爆炸、军车与商铺关闭\n两人即将被人流冲散',1000,380,280,80],['WHERE','混乱中先往哪里走？',1000,500,280,70,'decision'],
 ['TRUCK','先回家，带母亲、姐姐、幼弟\n赶上舅舅的露天货车',630,670,270,80],['E04','04 离城的四个人\n父亲仍被囚，莱拉去向不明',630,820,270,90,'ending'],
 ['GATE','拉住莱拉一同到城门\n被当作男孩征用',1000,670,280,80],['MARCH','被迫搬运、传令\n离家越来越远',1000,800,280,75],['E03','03 没有返程的路\n最后被送向前线',1000,930,280,90,'ending'],
 ['FIND','先失散，再逆着人流\n在封锁的街口找到莱拉',1400,670,280,80],['HIT','巡查认出女主，女孩身份暴露\n遭打昏迷，莱拉呼喊',1400,800,280,80],['TALE','梦中成为苏莱曼、寻找种子\n恐惧、受伤、得到帮助',1400,930,280,80],['KING','面对象王\n想起亡兄',1400,1060,280,75],['VOICES','梦中家人叫她回家\n现实莱拉叫她醒来',1400,1180,280,80,'decision'],
 ['SPRING','种子发芽，村庄丰收\n父亲、姐姐、幼弟与亡兄团聚',1170,1360,270,80],['E05','05 没有醒来的春天 · 梦境\n现实中始终没有醒来\n现实家人去向未知',1170,1500,270,110,'ending'],
 ['WAKE','醒来 → 获救 → 逃离',1510,1360,270,70],['YEARS','多年女性互助、学习与自卫\n共同组织守望',1510,1470,270,80],['E06','06 守护之地 · 原创未来\n成年女性护卫队长\n现实家人去向未知',1510,1600,270,110,'ending'],
];
const connections = [ ['OPEN','CUT'],['CUT','AID','放下剪刀'],['AID','MARRIAGE'],['MARRIAGE','HUNGER','拒绝婚事，继续等待'],['HUNGER','E01'],['MARRIAGE','WEDDING','家人恳求姐姐答应'],['WEDDING','E02'],['CUT','WORK','剪掉头发'],['WORK','WAR'],['WAR','WHERE'],['WHERE','TRUCK','先回家'],['TRUCK','E04'],['WHERE','GATE','拉住莱拉，随人群出城'],['GATE','MARCH'],['MARCH','E03'],['WHERE','FIND','回找失散的莱拉'],['FIND','HIT'],['HIT','TALE'],['TALE','KING'],['KING','VOICES'],['VOICES','SPRING','走向梦中的家人'],['SPRING','E05'],['VOICES','WAKE','回应莱拉：我要活下去'],['WAKE','YEARS'],['YEARS','E06'] ];
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll('\n','&#xa;');
const vertices = boxes.map(([id,text,x,y,w,h,type]) => `<mxCell id="${id}" value="${escape(text)}" style="${type === 'decision' ? 'rhombus;whiteSpace=wrap;' : 'rounded=1;whiteSpace=wrap;'}html=0;fontFamily=Arial;fontSize=14;${type === 'ending' ? 'fillColor=#202529;fontColor=#FFFFFF;' : 'fillColor=#F6F6F6;'}strokeColor=#9DA2A6;" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`).join('\n');
const edges = connections.map(([from,to,label=''],i)=>`<mxCell id="edge-${i}" value="${escape(label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=0;endArrow=block;fontSize=13;" edge="1" parent="1" source="${from}" target="${to}"><mxGeometry relative="1" as="geometry"/></mxCell>`).join('\n');
await fs.writeFile(path.join(directory,'姐姐我该怎么走-v060.drawio'),`<mxfile host="app.diagrams.net"><diagram id="story-v060" name="0.6.0 六条命运"><mxGraphModel dx="1800" dy="1800" grid="1" gridSize="10" page="1" pageScale="1" pageWidth="1900" pageHeight="1850"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${vertices}${edges}</root></mxGraphModel></diagram></mxfile>\n`);
const table = routes.map(r => `| ${r.number} ${r.title} | ${r.choices.join(' → ')} | ${r.mode} | ${Math.round(r.durationMs / 1000)}秒 |`).join('\n');
await fs.writeFile(path.join(directory,'决策树-v060.md'),`# 0.6.0 六条命运\n\n以用户新图为依据。四处分叉、九个选项、六条完整路线，每局两至三次决定。下表时长为镜头总和，不含玩家思考、暂停与重看。\n\n| 终幕 | 稳定行动 ID | 表现类型 | 自动镜头时长 |\n| --- | --- | --- | --- |\n${table}\n\n\`reality\` 为现实分支，\`dream\` 为未醒的梦，\`future\` 为醒来后的原创未来。05与06的现实家人去向未知。\n\n## 可编辑文件\n\n- [draw.io图](姐姐我该怎么走-v060.drawio)：使用 diagrams.net 打开，逐个修改节点、连线与标签。\n- [Mermaid源文件](姐姐我该怎么走-v060.mmd)：纯文本编辑。\n- [完整JSON](decision-tree-v060.json)：包含分叉、正文、行动和六条路线镜头索引。\n\n图与JSON是导出稿。游戏实际规则在 \`src/lib/six-ending-story.ts\`，镜头在 \`src/lib/six-story-presentation.ts\`；调整完运行 \`node scripts/generate-six-story-docs.mjs\` 重新导出。历史0.5.1图保留原文件名，不代表当前玩法。\n\n\`\`\`mermaid\n${mmd}\`\`\`\n`);
await fs.writeFile(path.join(repo,'docs/design/STORY-FLOW-v060-history.md'),`# 0.6.0 故事流程\n\n新版已替换历史五结局、七次选择的限制。见[六路线决策树与编辑文件](decision-tree/决策树-v060.md)。[0.5.1流程历史快照](STORY-FLOW-v051-history.md)仅用于版本研究。\n\n\`\`\`mermaid\n${mmd}\`\`\`\n`);
console.log(JSON.stringify({ routes: routes.length, options: decisions.reduce((sum,n)=>sum+n.choices.length,0), files: 5, directory }));
