import type { Metadata } from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SANELi | Brooklyn NY',
  description: 'SANELi — Music & Merch from Brooklyn, NY. Stream on Spotify, Apple Music & YouTube.',
  openGraph: {
    title: 'SANELi | Brooklyn NY',
    description: 'Music & Merch from Brooklyn, NY',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bebasNeue.variable} ${inter.variable} font-body antialiased bg-white`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
