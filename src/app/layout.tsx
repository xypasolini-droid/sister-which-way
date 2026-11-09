import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '姐姐，我该怎么走 · 一纸童话',
  description: '最后一点粮食，地毯上的剪刀，门缝里莱拉的字条。两次选择通往六条命运，手绘人物与场景分层演出的互动故事。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
