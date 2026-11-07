# UX State Matrix

> **历史原型交互记录。** 本页的洞穴开场、三章流程与 Enter 提交等规则属于早期《把我写回来》原型。当前游戏使用短对白、分支行动和 Command/Ctrl+Enter 提交，完整操作见 [README](../../README.md)，最新发布检查见 [PUBLICATION-QA.md](PUBLICATION-QA.md)。

Entry → restored/new scene → write → parse/validate → world changes → continue chapter → ending → replay/undo.

| State | Feedback | Recovery/persistence |
|---|---|---|
| Initial | cave, first narrative, three editable examples | starts without authentication |
| Pending | ink/loading feedback, disabled duplicate submit | 15s network timeout, local fallback |
| Unsupported | preserve text, explain no world change, suggestions | edit or use example |
| Accepted | narration + visible stage + notebook update | append immutable snapshot; undo |
| Offline | offline rules still usable | optional AI is not required |
| Reload | restore validated versioned save | corrupt save ignored with message |
| Storage blocked | in-memory play, clear save notice | export story remains usable |
| Chapter complete | visible continue button | explicit transition, undo supported |
| Ending | summary, story export, new story | confirmation before reset |
| Dialog | labelled help/history with close | Escape, focus trap, restore focus |
| Reduced motion | all outcomes still visible without looping animation | obey system preference |
| Long/IME input | 240-char bound; composition-aware Enter | preserve unsubmitted draft |
