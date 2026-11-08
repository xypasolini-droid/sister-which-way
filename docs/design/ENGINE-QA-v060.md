# 0.6.0 引擎与运行时收尾审计

审计日期：2026-11-08。审计对象为当前工作区的 0.6.0 源码。此文档记录独立代码审查、合法路线穷举及 Node 环境下的存储往返检查，**不代表网页、创服模拟器、Android 或 iOS 真机实测**。

## 结论

新版运行入口只能恢复 `storyRevision: 6`、`storyContentRevision: 7` 的进行中状态。六条路线没有调用旧五结局分类器，六个当前终幕均使用 `sister-v6` 的独立构图。新旧收藏在序列化、原生存储模拟与重新载入后仍分别保存，新收藏保持 **6 / 6**，旧记录没有加入该计数。

本轮未发现新的引擎或收藏合并逻辑阻塞。资源引用清单完整；主任务已确认 17 幅美术原图齐全。最终逐图核查、编码质量与 ZIP 结果见 [0.6.0 最终验收](QA-v060.md)，本文的独立代码与存储审计不代替这些检查。

## 方法与边界

- 读取 `SisterGame.tsx`、`branch-story.ts`、`six-ending-story.ts`、`six-story-presentation.ts`、`ending-collection.ts`、`EndingTableau.tsx`、`play-flow.ts`、小红书 `platform.ts`、`entry.tsx` 与构建脚本。
- 将最新 `collect-minitool-assets.ts` 用 esbuild 编译到临时目录，实际运行合法选择穷举。
- 运行独立 Node 检查：从六条合法路线生成真实快照，合并旧记录，经过 `createMinitoolRuntime` 的模拟 SDK 写入，再创建一个全新 runtime 重新 hydration，最后调用真实 `restoreEndingCollections` 核查计数与身份。
- 比较 UI 实际使用的持久键与 `PROGRESS_KEYS`，检查六终幕路径是否在 collector 中、是否引用旧 `sister-v4` 画面。
- 本轮没有再次运行全量测试。此前同日 20:41 的全量结果为 23 文件、262 项通过，`npm run typecheck` 通过；该结果不替代后续真实画面与网页验收。

## 新故事与旧终幕隔离

| 检查点 | 事实结果 |
| --- | --- |
| 新建游戏 | `createInitialState('short')` 从 `v6-opening` 的剪刀开场开始，父亲已经被捕。 |
| 分支 | 4 处分叉、9 个有效选项、6 条完整路线；每局 2–3 次选择。 |
| 末次选择 | 直接设置六个新 `endingId` 之一；`choose()` 拒绝在已结束状态继续提交。 |
| 旧分类器 | 只有旧版本路径才会调用旧五结局规则；revision 6 的 `finish` 直接对应新结局。 |
| 当前终幕 | `no_smoke`、`sister_married`、`conscripted`、`family_escape`、`unwaking_spring`、`guardian_future`。 |
| 画面路径 | 六个终幕均为 `/art/sister-v6/end-<id>.webp`；没有使用旧五终幕画面。 |
| 历史兼容代码 | 旧图、旧正文与旧 `EndingTableau` 映射仍保留，供旧档认证及历史记录使用；当前六个 ID 不会命中这些旧终幕。 |
| 梦与醒 | 05 为 `mode: dream`；06 为 `mode: future`，有醒来、获救、逃离、成长和成年守护镜头。 |
| 家人去向 | 05、06 没有 `boarded` / `familyEscaped` / `familyTogether`，父亲仍为被关押状态，现实家人下落未知。 |

演出推进函数只改变播放位置，不调用 `choose()`。`commit()` 在更新 React 状态之前先改变 route ref，阻止旧分叉在同一更新边界被再次提交。播放位置键含版本、完整选择历史、节点与结局 ID，分支与终局位置不会仅因步数相同而互相复用。终局阶段归一已修复：终局恢复到过时的非演出 phase 时会显示终幕，不会落入无选择的空白探索页。

上述为代码与纯逻辑结论；暂停、后台切换、双击和撤回的网页实际操作仍应以浏览器验收记录为准。

## 原生持久键覆盖

UI 使用的 13 个持久键全部包含在 `PROGRESS_KEYS` 的 14 个键中，没有遗漏：

- 新版：`play.r7`、`reading.r7`、`endings.r7`、`ending-states.r7`。
- 共用偏好：`preferences.v3`。
- 旧主进度：`v3`。
- 旧收藏：`endings.r6`、`ending-states.r6`、`endings.r5`、`ending-states.r5`、`endings.v3`、`ending-states.v3`。
- 原十结局归档：`ten-ending-archive.v1`。
- allowlist 额外保留 `reading.v6`，不把旧播放位置恢复到新版。

以上键均带 `sister-which-way.` 前缀。`sister-entered.r7` 是独立的进入状态，走 `readSession` / `writeSession` 的 session map，不是漏掉的原生持久进度键。

`entry.tsx` 在 `prepareRuntime()` 完成后才挂载 React。SDK 存储按键 hydration；失败读取的键会受到写保护。每个键的原生写入串行排队，避免旧写入晚于新写入完成。浏览器保存与原生保存机制不同，本次模拟检查没有使用真实小红书 SDK 或设备。

## 收藏与归档往返结果

本次构造并写入全部六个合法新版快照，同时合并一条 r6 记录、一条 r5 记录及十条原十结局记录。完成模拟 SDK 写入并创建全新 runtime 重新读取后：

| 类别 | 重新读取的结果 |
| --- | --- |
| 新版收藏 | 六个新 ID 全部恢复，计数仍为 6 / 6。 |
| r6 五结局 | `r5c6:reunited` 独立保留。 |
| r5 五结局 | `r5c0:dream_guardian` 独立保留，原编号 04。 |
| 原十结局 | 十条 `legacy10:<id>` 独立保留，其中卫队梦原编号 09、自治梦原编号 10。 |
| 新旧同名 | 原十结局、旧五结局的相同 ID 不互相覆盖。 |
| 原始归档 | `ten-ending-archive.v1` 的原数据未被写回或覆盖。 |

真实十结局归档格式从历史提交 `6972188` 确认，为 `{ collection: [...], states: {...} }`，由 `restoreTenEndingArchive()` 读取。原十结局正文和编号从历史提交 `692d19e` 恢复，归档 UI 在 `legacy10:` 源下优先使用该原文，避免旧认证把末章类别规范化后展示成另一个版本的结局。

新收藏只接受可按合法选择历史重放认证的 revision 6 / content 7 快照。仅有一个新 ID 字符串不能解锁新结局。旧版只有 ID 的记录可在明确历史版本下展示原文，但不计入新收藏。旧进行中快照仍保留在原键，未作为新版选择重新提交。

## 资源引用与时长

最新 collector 实际输出：

- 17 个不同画面路径。
- 69 个不同镜头 ID。
- 10 个合法引擎状态、4 处分叉、9 个选项、6 个终局，每个终局恰有一条完整路线。
- 17 个路径与 `SIX_ART` 一一对应，六个当前终幕均已包含，没有旧 `sister-v4` 引用回流。

不含玩家停留、暂停与重看的自动演出时长：

| 结局 | 时长 |
| --- | --- |
| 01 没有升起的炊烟 | 118 秒 |
| 02 姐姐出嫁的那一天 | 119 秒 |
| 03 没有返程的路 | 131.5 秒 |
| 04 离城的四个人 | 131.5 秒 |
| 05 没有醒来的春天 | 204 秒 |
| 06 守护之地 | 221 秒 |

小红书构建遍历这些合法状态收集资源，已经包含终局选择之后的结果演出。构建会先读取全部资源，再打包；缺文件时 `prepare-minitool-assets.mjs` 会失败，而不会静默交付缺图 ZIP。清单使用现成 WebP，打包阶段按字节复制，不再缩小或重新编码。该事实只能证明打包没有进一步改变 WebP 清晰度，不能代替生成 PNG 转换为 WebP 时的画质与尺寸核查。

## 资源完成状态与最终核查

主任务已确认 17 幅 PNG 美术原图全部落盘，包含六幅独立终幕，以及开场、谋生、战乱、施暴、获救、童话与多年成长等中间镜头。资源位于 `public/art/sister-v6/`，17 项画面引用与 `SIX_ART` 对应。

最终人物服饰／年龄／伤势／动作的逐图核查、PNG 到 WebP 的原尺寸与清晰度校验、ZIP 结果，统一见 [0.6.0 最终验收](QA-v060.md)。本次文档更新只同步资源完成状态，没有新增浏览器实测或测试运行；本文的纯逻辑审计不代替视觉验收，也不把 ALT 文本视为画面正确的证据。创服模拟器及 Android／iOS 真机状态仍须单独记录。
