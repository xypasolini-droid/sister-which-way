# Modern Web Guidance 核查与实现记录

日期：2026-11-07。根据用户明确要求，在这次沉浸界面改造前读取本机 `modern-web-guidance/SKILL.md`，通过最新 CLI 搜索并检索相关指南。

## 实际执行

```sh
npx -y modern-web-guidance@latest search "Build an immersive fullscreen narrative game with accessible modal drawers, frosted glass, mobile dynamic viewport safe areas and reduced motion" --skill-version 2026_05_16-c5e78707
npx -y modern-web-guidance@latest retrieve "navigation-drawer,responsive-design,accessibility"
```

检索返回 navigation-drawer、responsive-design、accessibility 等结果。已读取这三个主题的完整合并指南。CLI 提示本机技能版本旧于其最新索引；实际搜索与检索使用 `@latest`，没有据旧版本号推定浏览器支持范围。

## 落地决定

- **原生模态窗口**：手记、行囊、设置使用 `<dialog>.showModal()`。由浏览器处理 top layer、背景 inert、焦点限制与返回；没有另叠一套自制焦点陷阱。Escape、关闭按钮与点击窗口外部都能返回。
- **渐进披露**：本游戏的手记是临时阅读窗口，不是应用主导航，因此采用 accessibility 指南的 dialog，而不生搬 navigation-drawer 的横向滑动导航结构。结局只展示已经达成的内容。
- **动态屏幕高度**：舞台与窗口使用 `dvh`，保留 `vh` 基础回退；支持 safe-area-inset。窄竖屏对白在底部，短横屏对白在右侧、人物在左侧。
- **键盘与输入法**：原生按钮、明确表单标签、可见焦点；只在非表单控件焦点下接受正文空格/右箭头和选择 1–3。中文输入法组合期间不把 Enter 当提交；文字可用按钮或 Command/Ctrl+Enter 提交。
- **阅读体验**：不强制打字机效果、自动推进或限时决定。完整正文保留在手记；阅读节拍以原文字符和顺序为基础，能够重读与返回上一段。
- **运动偏好**：响应系统 `prefers-reduced-motion`，也提供游戏内减少运动设置；关闭演员移动和场景过渡，不影响任何故事内容。
- **玻璃可读性**：只保留一个主要对白面板，深灰半透明底加磨砂；颜色不是状态的唯一表达。没有 backdrop-filter 的浏览器使用较实的深底回退。
- **离线字体**：使用系统中文衬线字体回退，不依赖 Google Fonts 网络请求。
- **存档与异步状态**：旧剧情快照通过重放验证，读取时更新修订后的后果文字；阅读位置按完整路线保存。切换路线、撤回或重新开始会取消旧文字解释请求，并用 epoch 防止迟到响应写入新局。

本记录说明采用了哪些指南，不等于已通过所有浏览器或 WCAG 认证。实际执行的检查与未覆盖项见 `IMMERSION-QA.md`。

## 短字幕追加检索

用户提出主视觉不要大段文字后，再次运行最新CLI搜索：

```sh
npx -y modern-web-guidance@latest search "Create a cinematic narrative game with a compact subtitle bar, unobstructed scene, progressive disclosure, accessible keyboard reading controls and responsive mobile safe areas" --skill-version 2026_05_16-c5e78707
npx -y modern-web-guidance@latest retrieve "content-first-noise-reduction"
```

已阅读完整指南。将主屏正文拆成≤34字的字幕；次级说明收进手记及“先想一想”；取消舞台中部常驻静看按钮，移入更多菜单。保持原生对话框及键盘支持。游戏没有滚动阅读主页面，因此不生搬指南中的滚动隐藏导航，也未引入新的Popover兼容负担。字体放大时允许字幕条自然变高，不截断文字。

后续节奏反馈：用户明确否定单场13次点击，因而将主屏从“全文切短”改为每场2–4轮另写人物对话；完整背景与后果放入手记。少量童话段切换独立画面，不把它们叠成同一场景的长旁白。原34字拆分实现被新会话呈现取代，不再作为最终验收标准。
