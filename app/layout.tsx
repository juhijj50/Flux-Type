import './globals.css';
import type { Metadata } from 'next';
import {
  JetBrains_Mono,
  Bricolage_Grotesque,
  Lilita_One,
  Fredoka,
} from 'next/font/google';

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  weight: ['400', '500', '600', '700', '800'],
});

const lilita = Lilita_One({
  subsets: ['latin'],
  variable: '--font-lilita',
  weight: ['400'],
});

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Flux Type — Perform your intro',
  description:
    'A browser-based motion studio for creators. Perform your channel intro with your hands. No software, no templates. Webcam never leaves your device.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${mono.variable} ${bricolage.variable} ${lilita.variable} ${fredoka.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
