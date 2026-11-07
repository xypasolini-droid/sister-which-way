import { z } from 'zod';

export type Chapter = 'cave' | 'forest' | 'banquet';

export interface StoryState {
  version: 1;
  chapter: Chapter;
  pathOpen: boolean;
  companionForm: 'shadow' | 'child';
  companionName: string;
  companionWish: string;
  flowers: boolean;
  light: boolean;
  weather: 'still' | 'rain' | 'stars';
  ending: null | 'together' | 'open';
  turn: number;
}

export const initialState: StoryState = Object.freeze({
  version: 1,
  chapter: 'cave',
  pathOpen: false,
  companionForm: 'shadow',
  companionName: '',
  companionWish: '',
  flowers: false,
  light: false,
  weather: 'still',
  ending: null,
  turn: 0,
});

export const OperationSchema = z.object({
  type: z.enum([
    'open_path', 'grow_flowers', 'light_scene', 'change_weather',
    'restore_companion', 'name_companion', 'give_wish',
    'shield_player', 'end_story',
  ]),
  value: z.string().max(120).optional(),
}).strict();

export type Operation = z.infer<typeof OperationSchema>;

export const RewriteSchema = z.object({
  accepted: z.boolean(),
  title: z.string().min(1).max(40),
  narration: z.string().min(1).max(400),
  operations: z.array(OperationSchema).max(10),
  suggestions: z.array(z.string().min(1).max(100)).max(3).optional(),
}).strict();

export type RewriteResult = z.infer<typeof RewriteSchema>;

const StateSchema = z.object({
  version: z.literal(1),
  chapter: z.enum(['cave', 'forest', 'banquet']),
  pathOpen: z.boolean(),
  companionForm: z.enum(['shadow', 'child']),
  companionName: z.string().max(16),
  companionWish: z.string().max(80),
  flowers: z.boolean(),
  light: z.boolean(),
  weather: z.enum(['still', 'rain', 'stars']),
  ending: z.enum(['together', 'open']).nullable(),
  turn: z.number().int().min(0).max(10000),
}).strict();

/** Persist only explicit story facts. A corrupt or incompatible save is not loaded. */
export function validateState(value: unknown): StoryState | null {
  const result = StateSchema.safeParse(value);
  if (!result.success) return null;
  const state = result.data;
  if (state.ending === 'together' && !hasOwnStory(state)) return null;
  if (state.chapter !== 'cave' && !state.pathOpen) return null;
  if (state.chapter === 'banquet' && state.companionForm !== 'child') return null;
  return state;
}

function hasOwnStory(state: StoryState): boolean {
  return state.companionForm === 'child'
    && Boolean(state.companionName.trim())
    && Boolean(state.companionWish.trim());
}

/** No health or mortality operation exists: the protagonist's invincibility is invariant. */
export function applyOperations(state: StoryState, operations: Operation[]): StoryState {
  if (!validateState(state) || state.ending) return { ...state };
  const checked = z.array(OperationSchema).max(10).safeParse(operations);
  if (!checked.success || checked.data.length === 0) return { ...state };

  // Validate the whole batch before changing any fact. Otherwise an AI response
  // could claim it gave a name while only the accompanying visual action ran.
  for (const operation of checked.data) {
    const value = operation.value?.trim() ?? '';
    if (operation.type === 'name_companion'
      && (!value || value.length > 16 || /[<>\n\r]/.test(value))) return { ...state };
    if (operation.type === 'give_wish'
      && (!value || value.length > 80 || /[<>\n\r]/.test(value))) return { ...state };
    if (operation.type === 'change_weather'
      && value !== 'still' && value !== 'rain' && value !== 'stars') return { ...state };
  }

  const next = { ...state };
  let applied = false;
  let wantsEnding = false;
  for (const operation of checked.data) {
    const value = operation.value?.trim() ?? '';
    switch (operation.type) {
      case 'open_path':
        next.pathOpen = true;
        applied = true;
        break;
      case 'grow_flowers':
        next.flowers = true;
        applied = true;
        break;
      case 'light_scene':
        next.light = true;
        applied = true;
        break;
      case 'change_weather':
        if (value === 'still' || value === 'rain' || value === 'stars') {
          next.weather = value;
          applied = true;
        }
        break;
      case 'restore_companion':
        next.companionForm = 'child';
        applied = true;
        break;
      case 'name_companion':
        if (value.length > 0 && value.length <= 16 && !/[<>\n\r]/.test(value)) {
          next.companionName = value;
          applied = true;
        }
        break;
      case 'give_wish':
        if (value.length > 0 && value.length <= 80 && !/[<>\n\r]/.test(value)) {
          next.companionWish = value;
          applied = true;
        }
        break;
      case 'shield_player':
        // This is a visible stage response, not a reduction in life or story energy.
        next.light = true;
        applied = true;
        break;
      case 'end_story':
        wantsEnding = true;
        break;
    }
  }
  if (wantsEnding) {
    if (state.chapter !== 'banquet' && !hasOwnStory(next)) return { ...state };
    next.ending = hasOwnStory(next) ? 'together' : 'open';
    applied = true;
  }
  if (!applied) return { ...state };
  next.turn = Math.min(state.turn + 1, 10000);
  return next;
}

export function canAdvance(state: StoryState): boolean {
  if (state.ending) return false;
  return state.chapter === 'cave'
    ? state.pathOpen
    : state.chapter === 'forest' && state.companionForm === 'child';
}

export function advanceChapter(state: StoryState): StoryState {
  if (!canAdvance(state)) return { ...state };
  return {
    ...state,
    chapter: state.chapter === 'cave' ? 'forest' : 'banquet',
    // Keep every authored fact; moving between pages costs no turn or resource.
  };
}

export function suggestedLines(state: StoryState): string[] {
  if (state.ending) return [];
  if (state.chapter === 'cave') return [
    '洞口开出一朵花，花瓣铺成出去的路。',
    '让星星落进洞穴，照亮我们的前方。',
    '我长出翅膀，带着同伴飞过黑暗。',
  ];
  if (state.chapter === 'forest') return [
    '怪物其实是一个迷路的孩子。',
    '她叫阿禾，一直想把春天带回家。',
    '树林下起温柔的雨，所有花都开了。',
  ];
  if (!state.companionName) return [
    '她的名字叫阿禾。',
    '她的愿望是把春天带回家。',
    '大家都有自己的故事，并且一起活了下来。',
  ];
  if (!state.companionWish) return [
    `${state.companionName}的愿望是把春天带回家。`,
    '她要在故乡种下一整片花海。',
    '故事在这里结束，未写完的明天留给我们。',
  ];
  return [
    '她写下了自己的结局，我们一起回家。',
    '让所有的花都盛开，星星为她亮起来。',
    '我们的故事到这里结束，但生活刚刚开始。',
  ];
}

function refusal(state: StoryState, narration: string, title = '这一句，还没有落在纸上'): RewriteResult {
  return { accepted: false, title, narration, operations: [], suggestions: suggestedLines(state) };
}

function isQuestion(clause: string): boolean {
  return /[?？]$/.test(clause)
    || /^(为什么|怎么|怎样|如何|是否|能否|能不能|可不可以|请问)/.test(clause)
    || /(?:吗|么|呢)$/.test(clause);
}

function nameFrom(clause: string): string | undefined {
  const patterns = [
    /(?:她|他|孩子|同伴|女孩|男孩)(?:的名字)?(?:叫做|叫|名叫|改名为)(.+)/,
    /(?:她|他|孩子|同伴)(?:的)?名字(?:是|为|：|:)(.+)/,
    /(?:取名|起名|命名)(?:为|叫|作|是)?(.+)/,
  ];
  for (const pattern of patterns) {
    const match = clause.match(pattern);
    if (!match) continue;
    const name = match[1].replace(/^[“”「」『』"'\s]+|[“”「」『』"'\s]+$/g, '')
      .split(/(?:并且|然后|从此|而且|她|他|一直|想要|希望)/)[0].trim();
    if (name && name.length <= 16 && /^[\p{L}\p{N}·\- ]+$/u.test(name)) return name;
  }
  return undefined;
}

function wishFrom(clause: string, state: StoryState): string | undefined {
  const namedSubject = state.companionName
    ? state.companionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    : '她|他|孩子|同伴|女孩|男孩';
  const subject = `(?:她|他|孩子|同伴|女孩|男孩|${namedSubject})`;
  const patterns = [
    new RegExp(`${subject}(?:的)?(?:愿望|梦想)(?:是|就是|为|：|:)?(.+)`),
    new RegExp(`${subject}(?:一直|终于|从此)?(?:想要|想|希望|要)(.+)`),
    /(?:一直|终于)(?:想要|想|希望)(.+)/,
    /(?:让|希望|愿)(?:她|他|同伴)(.+)/,
  ];
  for (const pattern of patterns) {
    const match = clause.match(pattern);
    if (match) {
      const wish = match[1].replace(/^[“”「」『』"'\s]+|[“”「」『』"'\s]+$/g, '').trim();
      if (wish && wish.length <= 80 && !/[<>]/.test(wish)) return wish;
    }
  }
  if (/(?:把|带).*(?:春天|花|光|故事).*(?:回家|故乡)/.test(clause)) return '把春天带回家';
  if (/(?:她|他|同伴|孩子).*(?:回到|找到|返回).*(?:家|故乡)/.test(clause)) return '找到回家的路';
  return undefined;
}

/**
 * A transparent, bounded offline interpreter. It recognizes story actions rather
 * than pretending to be a general-purpose language model. Unsupported or negated
 * clauses remain unchanged and get actionable examples instead of fake success.
 */
export function resolveLocalRewrite(state: StoryState, input: string): RewriteResult {
  if (state.ending) return refusal(state, '这一卷已经写完。你可以撤回上一句，或者重新打开这本故事。', '故事已合上');
  const text = input.normalize('NFKC').trim();
  if (text.length < 2) return refusal(state, '写下一句完整的变化吧。比如让花瓣变成路，或为同伴找回名字。', '让一句话开始生长');
  if (text.length > 240) return refusal(state, '这一页先容纳 240 个字。把最想发生的变化留在这一句里。', '这一句有一点长');

  const operations: Operation[] = [];
  const lines: string[] = [];
  let title = '世界听见了你的话';
  let ignored = false;
  const add = (type: Operation['type'], value?: string) => {
    const existing = operations.findIndex(operation => operation.type === type);
    const operation = value === undefined ? { type } : { type, value };
    if (existing === -1) operations.push(operation);
    else operations[existing] = operation;
  };

  // Keep question marks attached to their clause so questions never become commands.
  const clauses = text.split(/[，,。！!；;\n]/).map(part => part.trim()).filter(Boolean);
  for (const clause of clauses) {
    if (isQuestion(clause)) { ignored = true; continue; }
    const peaceful = /(?:怪物|影子|她|他).*(?:不再伤害|不再追逐|不再凶|不再害怕|停止追赶)/.test(clause);
    const protectedPlayer = /(?:我|主角).*(?:无敌|不会死|不会受伤|不受伤|不会被伤害|永远活)/.test(clause);
    if (/(?:不要|不能|不许|不想|不愿|不应该|不会|不再|别让|别把|别给|别开)|没有(?:打开|开花|开|长出|出现|下雨|变成|恢复)/.test(clause) && !peaceful && !protectedPlayer) {
      ignored = true;
      continue;
    }

    if (/(?:大家|所有人|我们|每个人).{0,10}(?:都有|拥有|有了).{0,6}(?:故事|名字)|(?:大家|所有人|我们).{0,8}(?:都活下|一起活下|都能活)/.test(clause)) {
      add('restore_companion');
      add('name_companion', state.companionName || '阿禾');
      add('give_wish', state.companionWish || '把新的故事讲给远方的人');
      add('grow_flowers');
      add('end_story');
      title = '每个人，都有下一页';
      lines.push('同伴找回了自己的名字，也决定把新的故事讲给远方的人。你们都留在了有颜色的世界里。');
      continue;
    }

    const before = operations.length;
    const name = nameFrom(clause);
    if (name) {
      add('name_companion', name);
      title = '一个名字，落在纸上';
      lines.push(`“${name}。”同伴轻轻念了一遍。这个名字终于有了可以住进去的人。`);
    }
    const wish = wishFrom(clause, state);
    if (wish && !/(?:怪物|影子).*(?:消失|杀|死)/.test(clause)) {
      add('give_wish', wish);
      title = '明天，有了一个方向';
      lines.push(`同伴把愿望写在空白处：${wish}。纸页开始有了温度。`);
    }

    if (/(?:怪物|影子|同伴|她|他).*(?:其实是|原来是|变成|成为|恢复|找回|朋友|孩子|女孩|男孩|保护我们|保护者)|(?:让|把).*(?:怪物|影子).*(?:温柔|友善)/.test(clause) || peaceful) {
      add('restore_companion');
      title = '影子里，藏着一个人';
      lines.push('尖利的影子一层层收起，一个孩子重新站在你身旁。她望向你，不再躲藏。');
    }

    if (/(?:花|花瓣|花朵|花海|种子|春天).*(?:开|长|生|铺|盛|绽|种|出现)|(?:开出|长出|生出|种下|种满|出现|让).*(?:花|花瓣|花海)/.test(clause)) {
      add('grow_flowers');
      title = '纸上的花，开了';
      lines.push('花瓣从纸缝间舒展开来，替这片沉默添上了颜色。');
    }

    const passage = /(?:门|洞口|出口|岩壁|墙壁).*(?:打开|开了|展开|消失|让开|裂开|融化|开出|变成)|(?:打开|推开|敞开|移开|穿过|走出).*(?:门|洞口|出口|墙|洞穴)|(?:桥|道路|小路|路|台阶).*(?:出现|铺|搭|架|长|通|延伸)|(?:铺成|铺出|变成|架起|搭起|开辟|长出|生出|出现).*(?:路|桥|台阶)|(?:飞|翅膀|飞毯).*(?:出|过|离开|黑暗)|(?:长出|拥有).*(?:翅膀|飞毯)|(?:带|让).*(?:飞出去|飞过去|离开洞穴)/.test(clause);
    if (passage) {
      add('open_path');
      title = '一句话，成为一条路';
      lines.push('封闭的纸层向两侧让开。一条可以继续前行的路，出现在你们脚下。');
    }

    if (/(?:光|灯|太阳|月亮|萤火虫|星).*(?:亮|照|出现|升|落|点|进)|(?:点亮|照亮|亮起|亮起来|生出|出现).*(?:光|灯|火|星)|(?:天亮|白昼|黎明|光明)/.test(clause)) {
      add('light_scene');
      if (/(?:星星|星光|星空|繁星)/.test(clause)) add('change_weather', 'stars');
      lines.push('一点暖光穿过纸面。黑暗仍在远处，但已经不再挡住视线。');
    }
    if (/(?:下起|下了|落下|开始下|飘起|来一场|让).*(?:雨|雨水)|(?:雨|雨水).*(?:落|下|出现)/.test(clause)) {
      add('change_weather', 'rain');
      title = '一场温柔的雨';
      lines.push('细细的雨落在纸叶上，每一滴都像故事停顿时的呼吸。');
    }
    if (/(?:雨停|停雨|放晴|晴朗|晴天|风停)/.test(clause)) {
      add('change_weather', 'still');
      lines.push('雨声停了，纸页安静下来，等待你们的下一句话。');
    }

    const harmfulToPlayer = /(?:我|主角|自己).*(?:死|受伤|被杀|消失|被吃|坠落|掉下|烧死|杀死)|(?:杀死|杀掉|伤害|攻击|吞掉|吃掉).*(?:我|主角)/.test(clause);
    if (protectedPlayer || harmfulToPlayer) {
      add('shield_player');
      title = '这是你的故事';
      lines.push('危险碰到你的名字，就折成了柔软的纸。你不会在自己的故事里死去。');
    }

    if (/(?:故事|童话|这一页|这一卷|我们的故事).*(?:结束|结局|合上|完结|落幕)|(?:结束|写下|完成|迎来).*(?:故事|结局)|(?:我们|你们).*(?:一起回家|回到了家)|(?:从此).*(?:幸福|快乐).*(?:生活|一起)/.test(clause)) {
      if (state.chapter === 'banquet' || hasOwnStory(applyOperations(state, operations))) {
        add('end_story');
        title = '故事，仍在继续';
      } else {
        ignored = true;
      }
    }
    if (operations.length === before && !name && !wish) ignored = true;
  }

  if (!operations.length) return refusal(state,
    '离线模式还没读懂这句改写，世界保持原样。可以试着改变道路、光与天气，或写下同伴的身份、名字和愿望。',
  );

  const after = applyOperations(state, operations);
  if (after.turn === state.turn) return refusal(state, '这项变化暂时无法在这一页发生。可以先替眼前的困境写一个新的可能。');
  if (after.ending === 'together') {
    title = '把我写回来';
    return {
      accepted: true,
      title,
      narration: `${after.companionName}拿起笔，写道：“我想${after.companionWish.replace(/^(?:想要|想|要)/, '')}。”她终于拥有了自己的故事。你们一起走向下一页。`,
      operations,
    };
  }
  if (after.ending === 'open') return {
    accepted: true,
    title: '留一页空白，给明天',
    narration: '故事在这里轻轻合上。同伴的明天还没有写完，但你为她留下了纸和笔。也许，下次由她开始。',
    operations,
  };
  // Limit prose; state changes and stage feedback carry the interaction.
  const narration = [...new Set(lines)].slice(0, 3).join('')
    || '这一句已写进故事，眼前的世界随之改变。';
  return {
    accepted: true,
    title,
    narration: narration + (ignored ? '这一页先呈现了能读懂的变化。' : ''),
    operations,
    suggestions: suggestedLines(after),
  };
}
