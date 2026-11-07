# 手绘动作人物修正 · 0.4.1

这组 18 张透明 PNG 取代运行时的几何 SVG 人物稿。使用内建 `image_gen`，以项目原 `sister-v2` 角色为身份与服饰参照，生成后逐张查看，再在实际游戏里检查比例、脚线、动作与前后场景。原有 PNG 没有覆盖。

## 当前人物

| 文件 | 身份与动作 |
| --- | --- |
| `father-standing-crutch.png` | 父亲：双腿完整、跛行，一支木制腋拐支撑；摊前起身护女与家中站姿 |
| `father-drag.png` | 同一父亲：被带向右侧，回头看家人，仍握木拐；两条腿与两只鞋均完整 |
| `hero-fear.png`、`hero-help.png` | 努拉变装前：暗绿头巾、原长衫宽裤；后退与伸手扶人 |
| `hero-worker-crouch.png` | 努拉变装后：素浅灰圆帽、灰白长衫宽裤，屈膝藏身 |
| `friend-worker-crouch.png` | 莱拉：保留自己的脸、深褐帽与服饰，低蹲警戒 |
| `mother-standing.png`、`mother-shield.png`、`mother-fallen.png` | 母亲公共场景：灰蓝全身罩袍和细密面网；站立、护头与倒地侧坐，没有凳椅、露肤或换脸 |
| `patrol.png`、`patrol-raised.png`、`patrol-strike.png` | 同一年轻巡查：指责、举棍与棍落；窄脸、无胡须、棕缠头与暗橄榄服装 |
| `armed-patrol.png`、`armed-patrol-grab.png` | 同一年长武装者：站立看守与伸手抓人；背枪，与年轻巡查及阿明不同 |
| `relative.png`、`relative-pull.png` | 贾维德：白小帽、栗褐背心、米灰长衫；命令与强拉 |
| `merchant.png` | 摊主：灰蓝长衫，掌心拒绝，无武器 |
| `adult-builder.png` | 成年的阿提什：绿头巾与长外衣，手持素色本子、开放手掌，无盾牌或武器 |

父亲在市场席地读信和救后卧木推车，继续使用 `sister-v2/father-market.png` 与 `father-rescued.png`。市场的拐杖由独立 SVG 道具放在身旁，救后同一道具收在推车边；这不是人物身体。家中养伤的母亲、姐妹与其余原角色继续使用一致的原 PNG。

## 尺度与动作

PNG 均约为 1:2 画布，带真实透明 alpha。动作角色故意保留上方透明空间：坐低、倒地、蹲姿不能裁空白后再放大到站姿高度。人物使用 `height:100%; width:auto`，不拉长四肢。公共场合母亲的三个姿态采用同一倍率；挥棍姿态只校正脚线，不用拉伸代替身体动作。

## 生成记录与边界

- `prompts-root.json`：父亲与成年阿提什的生成说明。
- `hero-action-prompts.json`：女孩与朋友的提示词、原资产引用和检查。
- `mother-action-prompts.json`：母亲三姿的精确提示词与检查。
- `prompts-oppressors.json`：压迫者的精确提示词、身份参照和检查。
- `asset-manifest.json`：实际文件尺寸、alpha 与实体包围盒。

本地影片只作角色、服饰与动作语境核查。公开仓库不包含影片、电影截图、对白音轨或裁切人物。这些是本作原创动作插画，不是影片原始美术，不宣称逐帧复刻。具体观看时码、旧缺腿推断的撤回及运行截图见 [人物修正验收](../../../docs/design/CHARACTER-ART-QA.md)。
