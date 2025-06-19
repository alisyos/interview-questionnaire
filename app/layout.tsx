import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '면접 질문지 생성 시스템',
  description: 'AI를 활용한 직무별/지원자별 맞춤 면접 질문 생성 도구',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header />
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
} 