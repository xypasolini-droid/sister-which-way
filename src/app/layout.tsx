import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '姐姐，我该怎么走 · 一纸童话',
  description: '一对姐妹，一座被封锁的山城。七次单选，五种不同的命运。你的行动改变她与家人的去路，其中两种结局是明确标示的成年童话。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
