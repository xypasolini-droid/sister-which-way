# 0.7.0 故事流程

每局两次决定。开场分别通往家门、市场和水井，三处后续分叉各有两个结局。勇敢、智慧、善良是行动描述。路线由选中的行动决定。

```mermaid
flowchart TD
 O["最后一点粮食<br/>父亲已被捕，姐姐放下剪刀，门下有莱拉的字条"] --> A{"今天先做什么？"}
 A -->|"合上剪刀，先把粮让给萨米"| H["列出求援人家<br/>赊粮、托买、变卖家当都没能接上"]
 H --> B{"亲戚以粮食和住处提出婚事"}
 B -->|"挡在门前，接着敲剩下的门"| E1["01 门一直关着<br/>冷灶、四只空碗，父亲仍被囚"]
 B -->|"请来人退到门外，让姐姐开口"| E2["02 粮袋旁少了她<br/>玛莉安出嫁，三人留在饭桌旁"]
 A -->|"自己剪发，去市场挣今天的饼"| M["以阿提什的身份找活<br/>和莱拉一起搬货、分饼"]
 M --> C{"军车堵路，封城前往哪里走？"}
 C -->|"看清封路方向，拉住莱拉一起走"| E3["03 两个被叫错的名字<br/>两人被征用，沿路搬运并传令"]
 C -->|"数清路口，逆着人流回家接人"| E4["04 货斗里数四个人<br/>一家四口乘露天货车离城，父亲仍被囚"]
 A -->|"自己剪发，先到水井赴约"| W["约定走散后回井边<br/>逆人流找回莱拉，被巡查打昏"]
 W --> D{"苏莱曼取回种子<br/>梦中的家人与现实的莱拉同时呼唤"}
 D -->|"把种子交还村庄，走向梦里饭桌"| E5["05 春天没有叫醒她 · 梦境<br/>梦中团聚，现实始终未醒"]
 D -->|"攥住莱拉的手，忍着疼睁眼"| E6["06 一盏灯，许多只手 · 原创未来<br/>醒来逃离，多年后与其他女性共建互助院"]
 classDef ending fill:#202529,color:#fff,stroke:#77818a,stroke-width:2px
 class E1,E2,E3,E4,E5,E6 ending
```

| 路线 | 首选 ID | 末选 ID | 结局 ID |
| --- | --- | --- | --- |
| 01 | `keep_bowl` | `close_door` | `doors_stay_closed` |
| 02 | `keep_bowl` | `let_sister_speak` | `grain_without_her` |
| 03 | `take_bread` | `hold_layla` | `two_borrowed_boys` |
| 04 | `take_bread` | `run_home` | `four_in_the_back` |
| 05 | `answer_note` | `follow_spring` | `spring_without_waking` |
| 06 | `answer_note` | `answer_layla` | `one_lantern_many_hands` |

[故事定义](../../src/lib/seven-ending-story.ts)维护行动、分支和因果，[镜头脚本](../../src/lib/seven-story-presentation.ts)维护自动演出，[舞台构图](../../src/lib/seven-story-scenes.ts)维护底图、站位与动作。旧版见 [0.6.0 故事流程](STORY-FLOW-v060-history.md)和 [0.6.0 可编辑决策树](decision-tree/决策树-v060.md)。
