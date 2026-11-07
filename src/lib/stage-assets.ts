import type { Chapter } from './story';

/** Original artwork generated for the prototype. Kept separate from story rules. */
export const STAGE_ASSETS: Record<Chapter, {
  background: string;
  description: string;
  glow: string;
  color: number;
}> = {
  cave: {
    background: '/art/scene-cave.png',
    description: '紫色层叠纸洞穴，两个孩子站在尚未写完的路前。',
    glow: '#d5a65a',
    color: 0xdeb980,
  },
  forest: {
    background: '/art/scene-forest.png',
    description: '红花森林，迷失的同伴等待自己的名字。',
    glow: '#e6a17c',
    color: 0xf1aa86,
  },
  banquet: {
    background: '/art/scene-banquet.png',
    description: '绿色林间宴会，一张空白的故事等待被写完。',
    glow: '#f1d597',
    color: 0xe7d3a0,
  },
};

export const CHARACTER_ASSETS = {
  hero: '/art/hero.png',
  companion: '/art/companion.png',
};
