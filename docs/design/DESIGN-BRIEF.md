# Design Brief

> **历史原型设计记录。** 本页记录《把我写回来》的三场景、两结局方案与早期纸质界面，不是当前游戏的产品说明。当前内容见 [README](../../README.md)，最新发布检查见 [PUBLICATION-QA.md](PUBLICATION-QA.md)。

## Decision summary
- Product: 把我写回来 — an original, Chinese, interactive paper-cut fairy tale.
- Target: responsive desktop/mobile browser, Next.js + React + PixiJS.
- Primary task: write a sentence and observe a meaningful world-state and stage change.
- Success: complete three short scenes, restore a companion's story, undo and resume reliably.
- Approved direction: purple paper cave, crimson forest, green banquet; layered illustrated theatre inside a warm paper storybook interface.

## Context and scope
User supplied a film excerpt as visual/structural reference; no film assets are shipped. Build original generated art. Two characters, three scenes, finite composable actions, two endings. Offline story interpretation works without a key; an optional server-only model endpoint supports broader language. No multiplayer, combat, login, realtime video generation, or public hosting in this first local build.

## Direction contract
Thesis: a quiet storybook surrounding a richly layered, living paper theatre. Palette: parchment #f5f0e6, ink #28271f, muted #736d60, vermilion #aa4e37, moss #52624b, night #241c36. Chinese display uses local Songti SC/STSong/Noto Serif CJK SC; body uses PingFang SC/Microsoft YaHei/system. Composition: slender book masthead; dominant landscape theatre; narrow companion story margin; narration then writing desk. Signature: writing literally unfolds a path of petals. Aesthetic risk: tactile, illustrated game stage rather than app dashboard. Restraint: quiet controls, no gradients/cards for every item, no emoji. Motion: scene consequence plus subtle paper atmosphere, reduced-motion alternative. Copy: brief literary Chinese for story, plain Chinese for recovery and controls.

## Challenge and resolution
A plain chatbot would obscure causality: every accepted operation has persistent stage/state feedback. Generated video would delay interaction: use reusable images and state-driven effects. Arbitrary inputs cannot require unlimited art: support finite operations, honestly reject unsupported input, offer relevant alternatives. All accepted model results pass a rule validator. No health reduction or timed punishment.

## Acceptance
Build + typecheck + story tests; desktop and narrow browser screenshots; typing, IME, undo, save/reload, all chapters and both ending paths; focus, reduced-motion, and network recovery. Real mobile hardware remains unverified unless explicitly tested.
