# Design System

> **历史原型设计系统。** 下列纸色、侧栏布局与 `StoryStage.tsx` / `story.ts` 入口属于早期原型，保留供追溯；不能据此覆盖当前黑白磨砂界面与分支舞台。当前结构见 [README](../../README.md)，最新发布检查见 [PUBLICATION-QA.md](PUBLICATION-QA.md)。

Tokens live in src/app/globals.css. Story world data lives in src/lib/story.ts. Runtime stage lives in src/components/StoryStage.tsx. Assets live in public/art and are generated originals.

Palette: paper #f5f0e6; ink #28271f; secondary ink #736d60; line #d9d1c3; accent #aa4e37; focus #805331; moss #52624b.
Type: serif title/narrator, system sans labels and controls. Font sizes 12/14/16/18/24/36; readable Chinese lines, no giant display hero. Spacing 4/8/12/16/24/32/48/64. Corners 4 and 8; book sheet edges mostly square.

Desktop: max-width 1360, main scene + 268px story margin. Below 1000: main scene full width, companion margin becomes compact horizontal strip. Below 600: padded full-width scene, clear narrator and textarea; primary control remains reachable; touch targets >=44px.

Motion: input acknowledgment immediate; updates after validated operations. No timer advances while writing. Stage observes reduced motion and background visibility. Missing graphics preserve readable narrative and controls.

Icon family: Lucide strokes. Game art is raster; programmatic particles/paths are actual world effects, not image placeholders. No captured movie imagery. Status has text as well as color. History modal traps focus, Escape closes, return focus restored. Storage errors preserve current play.
