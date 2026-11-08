import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '姐姐，我该怎么走 · 一纸童话',
  description: '最后一点粮食，姐姐握着剪刀。四处分叉、六条命运：在战乱中选择生存、家人与朋友。短镜头自动推进的互动故事。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
