import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '姐姐，我该怎么走 · 一纸童话',
  description: '一对姐妹，一座被封锁的山城。30个分支节点，10种结局，含2种愿望梦境。你写下的决定，会改变她们的关系与去路。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
