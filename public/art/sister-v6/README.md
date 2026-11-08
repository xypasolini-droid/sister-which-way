# 0.6.0 六路线画面

本目录保留17幅PNG原稿与对应WebP，用于新故事图的69个短镜头。它们是项目的生成插画，不是电影截图；画面用途以`src/lib/six-story-presentation.ts`为准，结局模式由故事数据明确声明。

| 文件基名 | 用途 |
| --- | --- |
| opening-scissors | 最后粮食、家中四人、姐姐拿剪刀；父亲不在 |
| work-street | 剪发后男孩装束、小帽、与莱拉做工、老板与巡查压迫 |
| war-together | 战乱分叉前与共同逃离，两人的手仍相握 |
| war-street | 回找路线先被人流冲散，再逆人流寻找 |
| street-assault | 年轻巡查认出女孩、举棍施暴、莱拉护住她 |
| unconscious-rescue | 闭眼受伤、被照料；05现实始终未醒 |
| rescue-awake | 相同服装和伤势，睁眼抬手；06选择醒来 |
| tale-village | 苏莱曼离开失去种子的村庄 |
| tale-journey | 山谷旅途、膝伤、清水与包扎 |
| tale-elephant | 面对象王、种子与亡兄的记忆 |
| growth-learning | 离城后多年互助、识字、急救与守望 |
| end-no_smoke | 01冷灶、空碗、家中四人，父亲不在 |
| end-sister_married | 02姐姐离家、剩下三人的饭桌 |
| end-conscripted | 03两人被当作男孩征用，负重前往前线 |
| end-family_escape | 04四名家人在后方露天木板货斗离城 |
| end-unwaking_spring | 05梦中六人团聚，亡兄与幼弟分开，父亲完整双腿与木腋拐 |
| end-guardian_future | 06成年女性护卫队长、伙伴与前往学校的女孩 |

## 复用与原创边界

本轮新制15幅，另复用两幅已确认的项目插画。已按PNG字节哈希核对：

- `end-family_escape.png`等同`../sister-v4/end-caravan.png`，保留露天货斗、四位家人的构图。
- `end-guardian_future.png`等同`../sister-v4/end-dream_guardian.png`。仅复用成年群像美术；新版06是醒来后多年成长的原创未来，不继承旧版梦境判定、编号、存档或家人已登车的状态。

六种具体命运是游戏原创，不是影片的六个实际结局。05明确为梦；06明确为醒来后的原创未来。

SD卡原片本轮未挂载，实际查看的缓存抽帧范围为00:24:00–00:26:30、00:29:20–00:31:50、01:20:00–01:22:30，核对服饰、短发与小帽、种子故事和象王片段。没有声明重新通看整部影片。人物连续性另按全图逐幅检查；具体网页观察范围见`../../../docs/design/QA-v060.md`。没有把本地影片帧纳入公开游戏贴图。

## 编码与完整性

PNG原稿保留1659×948或1672×941原尺寸。最终WebP由`../../../scripts/encode-six-story-art.mjs --apply`统一产生，在全部原稿齐全后执行；[encoding-audit.json](encoding-audit.json)记录每幅原稿及WebP的SHA-256、尺寸、质量与合成PSNR。

本次17幅WebP共7,900,056字节，最小合成PSNR为38.1044 dB，透明通道一致，没有缩小尺寸。RGB采用有损WebP；PSNR是编码误差门槛，不等同主观画质认证，也不能称作全包无损。打包阶段再独立比较每幅WebP与PNG，按字节复制已通过检查的WebP，缺图或低于38 dB会阻止构建。
