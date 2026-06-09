import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Jay Amol Wani — Full Stack + AI Engineer',
  description:
    'Portfolio of Jay Amol Wani — Full Stack Developer and AI Engineer specializing in RAG pipelines, LLM integration, and scalable web applications. B.Tech CSE at KIT Kolhapur, CGPA 8.78.',
  keywords: [
    'Jay Wani',
    'Full Stack Developer',
    'AI Engineer',
    'RAG Pipeline',
    'React',
    'FastAPI',
    'Next.js',
    'LLM',
    'Machine Learning',
    'Kolhapur',
  ],
  authors: [{ name: 'Jay Amol Wani', url: 'https://github.com/Jax-2207' }],
  openGraph: {
    title: 'Jay Amol Wani — Full Stack + AI Engineer',
    description: 'Full Stack Developer & AI Engineer | RAG · LLMs · React · FastAPI · AWS',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
