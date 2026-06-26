import type {Metadata} from 'next';
import { Inter, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'ArtStudy Workspace | Professional Gesture Drawing & Anatomy',
  description: 'An interactive gesture drawing and anatomy study workspace with adjustable timers, custom reference guides, skeletal overlays, dynamic drawing pad, and AI anatomy critiques.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} dark`}>
      <body suppressHydrationWarning className="bg-[#131313] text-[#e5e2e1] antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
