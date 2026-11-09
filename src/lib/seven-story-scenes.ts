export type SevenMotion = 'breathe' | 'step' | 'run' | 'reach' | 'recoil' | 'fall' | 'rise' | 'work' | 'cut' | 'hold' | 'sit' | 'sway';

export interface SevenActor {
  id: string;
  src: string;
  x: number;
  y: number;
  height: number;
  motion?: SevenMotion;
  mirror?: boolean;
  delay?: number;
  z?: number;
  kind?: 'actor' | 'prop';
  dim?: boolean;
}

export interface SevenScene {
  background: string;
  alt: string;
  actors: SevenActor[];
  atmosphere?: 'dust' | 'hearth' | 'dream' | 'lantern';
  light?: 'warm' | 'cool' | 'dusk';
  foreground?: string;
  foregroundClip?: string;
}

const art = '/art/';
const rooms = {
  home: art + 'sister/home.png',
  door: art + 'sister-v2/clinic-exterior.png',
  market: art + 'sister/market.png',
  checkpoint: art + 'sister/checkpoint.png',
  well: art + 'sister-v7/well-plate.png',
  shelter: art + 'sister/clinic.png',
  cave: art + 'scene-cave.png',
  forest: art + 'scene-forest.png',
  spring: art + 'sister-v7/dream-table-plate.png',
  village: art + 'sister-v2/dream-land.png',
  truck: art + 'sister-v7/truck-plate.png',
  lantern: art + 'sister-v7/lantern-courtyard.png',
};

const sprites = {
  nura: art + 'sister-v2/hero-cloak.png',
  reaching: art + 'sister-v3/hero-help.png',
  cutting: art + 'sister-v7/nura-cutting.png',
  cropped: art + 'sister-v2/hero-worker-indoor.png',
  atish: art + 'sister-v2/hero-worker.png',
  atishReach: art + 'sister-v7/nura-reaching.png',
  crouch: art + 'sister-v3/hero-worker-crouch.png',
  travel: art + 'sister-v2/hero-travel-indoor.png',
  fallen: art + 'sister-v7/nura-fallen.png',
  sister: art + 'sister-v2/sister.png',
  sisterCovered: art + 'sister-v2/sister-covered.png',
  sisterOutside: art + 'sister-v2/sister-outdoor.png',
  mother: art + 'sister-v2/mother.png',
  motherOutside: art + 'sister-v3/mother-standing.png',
  motherSeatedOutside: art + 'sister-v2/mother-outdoor.png',
  sami: art + 'sister-v2/young-brother.png',
  layla: art + 'sister-v2/friend-worker.png',
  laylaCrouch: art + 'sister-v3/friend-worker-crouch.png',
  laylaReach: art + 'sister-v7/layla-reaching.png',
  laylaBareheaded: art + 'sister-v7/layla-bareheaded.png',
  merchant: art + 'sister-v3/merchant.png',
  relative: art + 'sister-v3/relative.png',
  patrol: art + 'sister-v3/patrol-raised.png',
  armed: art + 'sister-v3/armed-patrol-grab.png',
  sulayman: art + 'sister-v7/sulayman.png',
  elephant: art + 'sister-v7/elephant.png',
  father: art + 'sister-v3/father-standing-crutch.png',
  ali: art + 'sister-v7/ali.png',
  adult: art + 'sister-v3/adult-builder.png',
  laylaAdult: art + 'sister-v7/adult-layla.png',
  neighbor: art + 'sister-v7/helper-neighbor.png',
  pupil: art + 'companion.png',
  bag: art + 'sister/bag.png',
  bread: art + 'sister/bread.png',
  letter: art + 'sister/letter.png',
  book: art + 'sister/book.png',
  lantern: art + 'sister/lantern.png',
  scissors: art + 'sister-v7/scissors.svg',
  bowl: art + 'sister-v7/bowl.svg',
  grain: art + 'sister-v7/grain.svg',
  cap: art + 'sister-v7/cap.svg',
  crate: art + 'sister-v7/crate.svg',
  coat: art + 'sister-v7/old-coat.svg',
  kettle: art + 'sister-v7/kettle.svg',
  grainBowl: art + 'sister-v7/grain-bowl.svg',
  coins: art + 'sister-v7/coins.svg',
};

function person(id: string, sprite: keyof typeof sprites, x: number, y: number, height: number, motion?: SevenMotion, options?: Pick<SevenActor, 'mirror' | 'delay' | 'z' | 'dim'>): SevenActor {
  return { id, src: sprites[sprite], x, y, height, motion, ...options };
}

function prop(id: keyof typeof sprites, x: number, y: number, height: number, options?: Pick<SevenActor, 'mirror' | 'delay' | 'z'>): SevenActor {
  return { ...person(id, id, x, y, height, undefined, options), kind: 'prop' };
}

const nura = (x: number, y: number, motion?: SevenMotion, mirror = false) => person('nura', 'nura', x, y, 49, motion, { mirror });
const atish = (x: number, y: number, motion?: SevenMotion, mirror = false) => person('nura', 'atish', x, y, 48, motion, { mirror });
const layla = (x: number, y: number, motion?: SevenMotion, mirror = false) => person('layla', 'layla', x, y, 46, motion, { mirror, delay: 140 });
const sister = (x: number, y: number, motion?: SevenMotion, mirror = false) => person('maryam', 'sister', x, y, 56, motion, { mirror });
const mother = (x: number, y: number, motion?: SevenMotion) => person('mother', 'mother', x, y, 56, motion);
const sami = (x: number, y: number, motion?: SevenMotion) => person('sami', 'sami', x, y, 46, motion);
const relative = (x: number, y: number, motion?: SevenMotion) => person('relative', 'relative', x, y, 60, motion, { mirror: true });
const patrol = (x: number, y: number, motion?: SevenMotion) => person('patrol', 'patrol', x, y, 65, motion, { mirror: true });
const fallen = (x: number, y: number, motion?: SevenMotion) => person('nura', 'fallen', x, y, 21, motion, { z: 3 });
const sulayman = (x: number, y: number, motion?: SevenMotion) => person('sulayman', 'sulayman', x, y, 42, motion);
const crouchedLayla = (x: number, y: number, motion?: SevenMotion, mirror = false) => person('layla', 'laylaCrouch', x, y, 68, motion, { mirror, z: 2 });

function scene(room: keyof typeof rooms, alt: string, actors: SevenActor[], atmosphere?: SevenScene['atmosphere'], light?: SevenScene['light']): SevenScene {
  return { background: rooms[room], alt, actors, atmosphere, light };
}

const home = (alt: string, actors: SevenActor[], light?: SevenScene['light']) => scene('home', alt, actors, light === 'cool' ? undefined : 'hearth', light);
const outside = (alt: string, actors: SevenActor[], light?: SevenScene['light']) => scene('door', alt, actors, 'dust', light);
const market = (alt: string, actors: SevenActor[], light?: SevenScene['light']) => scene('market', alt, actors, 'dust', light);
const checkpoint = (alt: string, actors: SevenActor[]) => scene('checkpoint', alt, actors, 'dust', 'dusk');
const dream = (room: 'forest' | 'cave' | 'spring' | 'village', alt: string, actors: SevenActor[]) => scene(room, alt, actors, 'dream');
const springTable = (alt: string, actors: SevenActor[]): SevenScene => ({
  ...dream('spring', alt, actors),
  foreground: rooms.spring,
  foregroundClip: 'polygon(28.6% 81.3%, 34.7% 76.5%, 36% 65.5%, 41% 62%, 44.7% 70.3%, 51% 68.6%, 57.2% 73.4%, 61.7% 70.5%, 65.3% 73.3%, 70% 80.7%, 71% 91.5%, 65% 94.5%, 34% 94.5%, 28.6% 89%)',
});
const shelter = (alt: string, actors: SevenActor[]) => scene('shelter', alt, actors, undefined, 'cool');
const lantern = (alt: string, actors: SevenActor[]) => scene('lantern', alt, actors, 'lantern', 'dusk');
const truck = (alt: string, actors: SevenActor[]): SevenScene => ({
  ...scene('truck', alt, actors, 'dust', 'dusk'),
  foreground: rooms.truck,
  foregroundClip: 'polygon(0 56.5%, 16% 57.8%, 45.5% 59.2%, 53% 58.2%, 79.5% 53.5%, 100% 53.5%, 100% 100%, 0 100%)',
});

const scissorsOnRug = prop('scissors', 43, 84, 8, { z: 4 });
const firstBowl = prop('grainBowl', 54, 88, 9);
const openingFamily = [nura(38, 82, 'breathe'), sister(52, 77, 'breathe', true), mother(70, 79, 'sit'), sami(76, 83, 'sit')];
const frontDoor = [relative(75, 78, 'hold'), sister(56, 80, 'breathe'), nura(42, 84, 'hold')];
const twoFriends = [atish(43, 83, 'hold'), layla(57, 81, 'breathe', true)];
const outstretchedHands = [
  person('nura', 'atishReach', 45, 86, 48, 'reach'),
  person('layla', 'laylaReach', 57.8, 82.7, 48, 'reach', { delay: 150 }),
];
const readyToLeave = [person('mother', 'motherOutside', 36, 82, 53, 'step'), person('maryam', 'sisterOutside', 52, 83, 52, 'step'), sami(46, 87, 'step'), atish(66, 84, 'reach', true)];
const inTruck = [person('mother', 'motherSeatedOutside', 21, 76, 57, 'sway'), sami(28, 68, 'hold'), person('maryam', 'sisterCovered', 40, 78, 48, 'hold'), atish(52, 84, 'hold', true)];
const nearWell = (alt: string, actors: SevenActor[], light?: SevenScene['light']) => scene('well', alt, actors, 'dust', light);
const adultNura = (x: number, y: number, motion?: SevenMotion) => person('nura', 'adult', x, y, 53, motion);
const neighbor = (x: number, y: number, motion?: SevenMotion) => person('neighbor', 'neighbor', x, y, 51, motion);
const adultLayla = (x: number, y: number, motion?: SevenMotion) => person('layla', 'laylaAdult', x, y, 50, motion);
const schoolChild = (x: number, y: number) => person('child', 'pupil', x, y, 32, 'reach');

const scenes: Readonly<Record<string, SevenScene>> = {
  // Opening. The tiny bowl and the scissors share the foreground of an occupied room.
  'last-grain': home('努拉盯着最后一点粮食，母亲和萨米坐在后面。', [nura(49, 81, 'reach'), mother(68, 77, 'sit'), sami(75, 81, 'sit'), firstBowl]),
  'father-absent': home('父亲的位置空着，母亲、姐姐、努拉和幼弟在家。', openingFamily, 'cool'),
  'scissors-between': home('剪刀放在地毯上，姐姐等努拉自己伸手。', [...openingFamily, scissorsOnRug, firstBowl]),
  'layla-note': home('字条落在门边，努拉走向门口。', [nura(74, 77, 'step'), sister(52, 76, 'breathe'), mother(37, 80, 'sit'), prop('letter', 80, 82, 11), scissorsOnRug]),
  'brothers-coat': home('姐姐守在衣箱旁，努拉看着哥哥的旧衣和剪刀。', [nura(44, 84, 'breathe'), sister(60, 81, 'reach', true), prop('coat', 55, 84, 15), prop('cap', 56, 87, 7), scissorsOnRug]),
  'home-or-street': home('努拉在粮碗、剪刀和莱拉的字条之间犹豫。', [...openingFamily, firstBowl, scissorsOnRug, prop('letter', 62, 87, 10)]),
  'opening-choice': home('剪刀仍在地毯上，努拉和姐姐隔着一只碗相对。', [...openingFamily, firstBowl, scissorsOnRug, prop('letter', 62, 87, 10)]),

  // Home. Nura's braid stays visible, and the guest never replaces Maryam in the frame.
  'give-sami-bowl': home('努拉俯身把剩下的粮让给萨米。', [person('nura', 'reaching', 45, 85, 52, 'reach'), sami(62, 84, 'reach'), mother(70, 77, 'sit'), prop('grainBowl', 58, 85, 9)]),
  'close-scissors': home('努拉合上剪刀，姐姐把衣箱留在旁边。', [nura(43, 83, 'reach'), sister(58, 79, 'hold', true), scissorsOnRug, prop('bag', 53, 87, 14)]),
  'write-door-list': home('努拉在纸背排下求援的顺序。', [nura(48, 82, 'work'), sister(61, 78, 'breathe', true), prop('letter', 51, 74, 13, { z: 4 })]),
  'knock-door': outside('受托的邻居敲门，门里的人推回一只空袋。', [person('neighbor', 'relative', 61, 78, 56, 'reach'), prop('bag', 66, 85, 14)], 'cool'),
  'cross-off-door': home('努拉在家把没有借到粮的一户划掉。', [nura(45, 85, 'work'), prop('letter', 49, 74, 12, { z: 92 })], 'cool'),
  'sell-kettle': home('姐姐把仅剩的水壶递来，努拉盘算能不能换点粮。', [nura(45, 84, 'reach'), sister(61, 79, 'hold', true), prop('kettle', 53, 87, 17)], 'cool'),
  'try-last-name': home('萨米用指头压住纸上最后一个没被划掉的人名。', [nura(44, 81, 'hold'), sami(58, 86, 'reach'), prop('letter', 54, 82, 10, { z: 94 })], 'cool'),
  'face-marriage-offer': home('亲戚站在门边开条件，努拉和姐姐面对他。', frontDoor, 'cool'),
  'sister-at-table': home('姐姐看着来人，努拉转身给她留出说话的位置。', [relative(74, 76, 'hold'), sister(52, 84, 'hold'), nura(40, 80, 'step'), mother(28, 78, 'sit')], 'cool'),
  'home-choice': home('努拉站在姐姐和门口的亲戚之间。', frontDoor, 'cool'),

  // Haircut is three poses, including Nura's own hands on her own braid.
  'she-takes-scissors': home('努拉向地毯上的剪刀伸手，姐姐在一旁扶镜。', [person('nura', 'reaching', 37, 85, 53, 'reach'), sister(60, 78, 'hold', true), scissorsOnRug]),
  'she-cuts': home('努拉跪坐着亲手剪自己的发辫，姐姐站在后面。', [person('nura', 'cutting', 48, 87, 50, 'cut', { z: 3 }), sister(65, 76, 'hold', true)]),
  'sister-keeps-name': home('努拉剪短了头发，姐姐递来哥哥的小帽。', [person('nura', 'cropped', 45, 84, 49, 'hold'), sister(59, 83, 'reach', true), prop('cap', 54, 73, 9, { z: 94 })]),

  // Market. The same two actors keep their left/right relation until the war cuts in.
  'set-home-signal': home('努拉已经换上旧衣，和姐姐在门边约好暗号。', [atish(74, 80, 'reach', true), sister(58, 81, 'hold'), mother(39, 78, 'sit')]),
  'ask-price': market('戴帽子的努拉站在铺面前问清工钱。', [atish(44, 85, 'reach'), person('merchant', 'merchant', 61, 79, 58, 'hold', { mirror: true }), prop('crate', 57, 90, 19)]),
  'carry-crate': market('努拉和莱拉在货物旁俯身，店主从后方喝令。', [person('nura', 'crouch', 46, 88, 72, 'work'), crouchedLayla(59, 87, 'work', true), person('merchant', 'merchant', 71, 76, 56, 'hold', { mirror: true }), prop('crate', 53, 90, 21, { z: 3 })]),
  'count-coins': market('两个孩子在木箱边核对刚领到的工钱。', [person('nura', 'crouch', 46, 86, 76, 'work'), crouchedLayla(57, 86, 'work', true), prop('crate', 52, 89, 18), prop('coins', 52, 75, 6, { z: 95 })]),
  'split-bread': market('努拉把饼推到莱拉手边。', [person('nura', 'crouch', 46, 85, 80, 'reach'), crouchedLayla(57, 86, 'reach', true), prop('bread', 52, 78, 9, { z: 95 })]),
  'blast-nearby': market('爆响从街口传来，努拉和莱拉缩身回头。', [atish(43, 83, 'recoil'), layla(58, 81, 'recoil', true)], 'dusk'),
  'shutters-fall': market('商铺落闸，两个孩子赶向封锁的路口。', [atish(52, 85, 'run'), layla(64, 81, 'run')], 'dusk'),
  'market-choice': checkpoint('封锁的路口前，努拉一边看向莱拉一边找回家的路。', [...outstretchedHands, person('armed', 'armed', 76, 73, 48, 'hold', { mirror: true, dim: true })]),

  // The well, the separation, and the fall are distinct placements and silhouettes.
  'read-note': outside('努拉站到自家门外，重新看莱拉留下的字条。', [atish(54, 83, 'hold'), prop('letter', 58, 71, 12, { z: 3 })]),
  'meet-at-well': nearWell('努拉按字条找到莱拉，两人在井边碰面。', [atish(43, 83, 'step'), layla(56, 79, 'hold', true)]),
  'agree-signal': nearWell('努拉和莱拉在井边把失散后的约定说清。', twoFriends),
  'show-cap': nearWell('两个戴小帽的孩子在水井附近面对盘查。', [atish(48, 83, 'hold'), layla(39, 80, 'hold'), person('armed', 'armed', 68, 82, 63, 'reach', { mirror: true })]),
  'hands-part': market('爆响后，努拉与莱拉伸出的两只手错开。', [person('nura', 'atishReach', 39, 85, 47, 'recoil'), person('layla', 'laylaReach', 63, 81, 46, 'recoil')], 'dusk'),
  'back-for-layla': market('努拉转身往回跑，莱拉不在她身旁。', [atish(52, 86, 'run', true)], 'dusk'),
  'find-layla': nearWell('努拉在水井附近找到莱拉，朝她伸手。', [...outstretchedHands, person('armed', 'armed', 78, 72, 48, 'hold', { mirror: true, dim: true })], 'dusk'),
  'shield-face': nearWell('巡查举棍，努拉侧身挡在莱拉前面。', [person('nura', 'cropped', 55, 85, 48, 'recoil', { mirror: true }), crouchedLayla(43, 84, 'recoil'), patrol(66, 82, 'reach'), prop('cap', 50, 89, 7)], 'dusk'),
  'collapse': nearWell('努拉倒在地上，莱拉俯身，巡查只剩远处的背影。', [fallen(48, 88, 'fall'), crouchedLayla(59, 84, 'reach', true), person('patrol', 'patrol', 77, 72, 39, 'step', { dim: true }), prop('cap', 42, 88, 6)], 'dusk'),
  'tell-sulayman': dream('forest', '红叶间，少年苏莱曼带着空种袋向前。', [sulayman(42, 85, 'step')]),
  'carry-seeds': dream('forest', '苏莱曼抱紧种袋穿过山路。', [sulayman(56, 83, 'hold')]),
  'bind-knee': dream('cave', '受伤的苏莱曼在洞口停下，有人过来帮忙。', [sulayman(44, 88, 'recoil'), person('helper', 'mother', 62, 87, 55, 'reach', { dim: true })]),
  'face-elephant': dream('cave', '苏莱曼在折纸般巨大的象王面前站住。', [sulayman(29, 88, 'hold'), person('elephant', 'elephant', 70, 89, 64, 'breathe')]),
  'name-ali': dream('cave', '象王垂下鼻子，梦中的努拉想起亡兄阿里。', [sulayman(37, 86, 'reach'), person('elephant', 'elephant', 71, 89, 58, 'breathe')]),
  'voices-cross': dream('forest', '苏莱曼在红叶间停住，听见从不同地方传来的两个声音。', [sulayman(49, 85, 'hold')]),

  // 01. Closed door, cold room and four untouched bowls.
  'block-door': home('努拉自己站到门前，把婚事条件挡回去。', [nura(67, 85, 'reach'), sister(48, 81, 'hold'), relative(80, 76, 'step')], 'cool'),
  'write-last-name': home('努拉把仍有希望的名字写在纸背。', [nura(48, 84, 'work'), mother(63, 79, 'sit'), sami(71, 83, 'sit'), prop('letter', 53, 76, 12, { z: 3 })], 'cool'),
  'last-door': outside('努拉走到最后一扇门前，伸手等了一会儿。', [nura(64, 81, 'reach')], 'dusk'),
  'empty-bowls': home('四只空碗排在暗下来的房间里，旧衣盖住萨米的腿。', [nura(40, 80, 'hold'), sister(55, 76, 'hold', true), mother(65, 80, 'sit'), sami(75, 82, 'sit'), prop('coat', 75, 83, 12, { z: 94 }), ...[39, 48, 57, 66].map(x => ({ ...prop('bowl', x, 89, 8), id: 'bowl-' + x }))], 'cool'),
  'door-stays-shut': home('冷灶旁只剩空碗、剪刀和写满名字的纸，木门依旧关着。', [...[37, 46, 55, 64].map(x => ({ ...prop('bowl', x, 87, 9), id: 'bowl-' + x })), prop('letter', 69, 94, 10), prop('scissors', 42, 96, 7)], 'cool'),

  // 02. A bag of grain stands in for the person who is no longer at the meal.
  'give-sister-word': home('努拉请亲戚退到门外，自己退开半步，把话留给姐姐。', [nura(44, 82, 'step', true), sister(56, 84, 'hold'), relative(81, 75, 'step')], 'cool'),
  'record-promises': home('姐姐当面问清条件，努拉拿起纸把许诺记下。', [sister(56, 83, 'reach'), relative(76, 78, 'hold'), nura(41, 85, 'work'), prop('letter', 43, 72, 13, { z: 4 })]),
  'sister-leaves': outside('姐姐提着布包跨出家门，亲戚等在门外。', [person('maryam', 'sisterOutside', 63, 84, 53, 'step'), relative(75, 78, 'step'), nura(43, 79, 'hold'), prop('bag', 65, 75, 12, { z: 95 })], 'dusk'),
  'grain-arrives': home('粮袋被放到原来搁书的位置，努拉看着门口。', [nura(52, 81, 'hold'), mother(65, 82, 'sit'), sami(72, 84, 'sit'), prop('grain', 40, 87, 29)], 'cool'),
  'empty-place': home('粮袋到了，饭桌边有三个人，姐姐的碗前空着。', [nura(56, 78, 'hold', true), mother(65, 80, 'sit'), sami(73, 83, 'sit'), prop('grain', 31, 88, 33), prop('bowl', 44, 90, 11)], 'cool'),

  // 03. They move together, then lose their caps and are marched beyond the gate.
  'read-road': checkpoint('努拉先看清栏杆和守卫的位置。', [atish(43, 84, 'hold'), layla(54, 81, 'hold'), person('armed', 'armed', 76, 74, 48, 'hold', { mirror: true })]),
  'take-layla-hand': checkpoint('努拉拉住莱拉，两个人一起往前。', outstretchedHands),
  'hats-fall': checkpoint('兵抓住两个孩子，两顶小帽落在尘土里。', [person('nura', 'cropped', 45, 84, 46, 'recoil'), person('layla', 'laylaBareheaded', 54, 82, 47, 'recoil', { mirror: true }), person('armed', 'armed', 64, 84, 65, 'reach', { mirror: true }), prop('cap', 44, 92, 8), { ...prop('cap', 57, 90, 7, { mirror: true }), id: 'layla-cap' }]),
  'load-truck': checkpoint('守卫催两个失去帽子的孩子搬箱子。', [person('nura', 'cropped', 47, 85, 47, 'work'), person('layla', 'laylaBareheaded', 56, 85, 46, 'work', { mirror: true }), person('armed', 'armed', 72, 79, 59, 'hold', { mirror: true }), prop('crate', 51.5, 82, 21, { z: 96 })]),
  'carry-orders': checkpoint('两个孩子被迫带着军用物资离开城门。', [person('nura', 'travel', 52, 85, 47, 'step'), person('layla', 'laylaBareheaded', 61, 80, 46, 'step', { delay: 160 }), person('armed', 'armed', 40, 82, 61, 'step', { dim: true })]),
  'two-wrong-names': checkpoint('道路越过封锁线，两个孩子在武装看守下被送往远处。', [person('nura', 'travel', 60, 75, 32, 'step'), person('layla', 'laylaBareheaded', 67, 75, 32, 'step', { delay: 160 }), person('armed', 'armed', 49, 80, 46, 'hold', { dim: true }), prop('cap', 37, 94, 10), { ...prop('cap', 48, 96, 8), id: 'layla-cap' }]),

  // 04. The cargo bed is outdoors, and its near rail sits in front of the cast.
  'count-crossroads': market('努拉在落闸的街口数清回家的方向。', [atish(53, 86, 'hold', true)], 'dusk'),
  'run-home': outside('努拉逆着出城的方向跑回家。', [atish(62, 87, 'run')], 'dusk'),
  'bring-family-out': outside('努拉把母亲、姐姐和幼弟带出门。', readyToLeave, 'dusk'),
  'help-family-board': truck('努拉伸手扶幼弟，一家人爬进露天货斗。', [person('mother', 'motherSeatedOutside', 21, 75, 57, 'sway'), sami(32, 67, 'rise'), person('maryam', 'sisterCovered', 42, 78, 48, 'reach'), atish(53, 82, 'reach', true)]),
  'count-four': truck('努拉在货斗里逐一数母亲、姐姐、萨米和自己。', inTruck),
  'gate-behind': truck('四个人在露天货斗里离开城，父亲和莱拉都没有上车。', inTruck),

  // 05. The dream's reunion yields to the reality of Nura still lying unconscious.
  'return-seeds': dream('village', '苏莱曼把种子还给村人。', [sulayman(44, 87, 'reach'), person('villager', 'mother', 59, 86, 58, 'reach'), prop('grain', 53, 91, 17)]),
  'spring-harvest': dream('village', '村里迎来丰收，苏莱曼在谷物边停下。', [sulayman(46, 83, 'step'), prop('grain', 33, 91, 23), { ...prop('grain', 62, 89, 18), id: 'grain-2' }]),
  'father-at-table': springTable('父亲拄着木拐走向饭桌，双腿完整。', [person('father', 'father', 72, 82, 58, 'step'), nura(44, 83, 'reach')]),
  'dream-table': springTable('努拉梦见父亲、母亲、姐姐、亡兄阿里和萨米一同吃饭。', [sister(30, 81, 'hold'), mother(39, 82, 'sit'), nura(48, 83, 'reach', true), sami(55, 80, 'sit'), person('ali', 'ali', 64, 83, 34, 'sit', { mirror: true }), person('father', 'father', 75, 82, 54, 'hold', { mirror: true })]),
  'reality-unwaking': shelter('现实中的努拉仍在遮蔽处闭着眼，莱拉守在旁边。', [fallen(48, 88, 'hold'), crouchedLayla(59, 84, 'sit', true)]),

  // 06. Two girls escape. The adult courtyard is civilian and organized together.
  'grip-layla-hand': shelter('努拉还躺着，莱拉蹲下把手递过来。', [fallen(48, 88, 'reach'), crouchedLayla(59, 83, 'reach', true)]),
  'open-eyes': shelter('努拉醒来，莱拉在身边托住她。', [person('nura', 'crouch', 46, 87, 82, 'rise'), crouchedLayla(60, 86, 'hold', true)]),
  'bind-wound': shelter('有人带来布，莱拉和努拉一起处理伤口。', [person('nura', 'crouch', 47, 86, 82, 'hold'), crouchedLayla(59, 85, 'reach', true), neighbor(70, 80, 'reach'), prop('bag', 64, 91, 13)]),
  'leave-city': outside('两人相互照应着离开战乱的城市。', [atish(55, 85, 'step'), layla(48, 86, 'step')], 'dusk'),
  'teach-letters': lantern('多年后，努拉和莱拉在院里陪孩子识字。', [adultNura(45, 82, 'work'), adultLayla(60, 82, 'reach'), schoolChild(53, 85), prop('book', 53, 75, 13, { z: 95 })]),
  'open-door': lantern('努拉和邻居共同开门，留出让人进院的路。', [adultNura(39, 80, 'reach'), adultLayla(60, 82, 'hold'), neighbor(72, 79, 'step'), schoolChild(65, 84)]),
  'share-lantern': lantern('成年努拉、莱拉和邻居在一盏灯旁照看孩子，安排共同守望。', [adultNura(42, 84, 'reach'), adultLayla(58, 84, 'hold'), neighbor(71, 80, 'reach'), schoolChild(50, 86), prop('lantern', 52.2, 64.5, 17, { z: 95 })]),
};

export function getSevenScene(shot: { id: string; art: string; realm?: string }): SevenScene {
  const result = scenes[shot.id];
  if (!result) throw new Error('Missing layered scene for shot ' + shot.id);
  return result;
}
