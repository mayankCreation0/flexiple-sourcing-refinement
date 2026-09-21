import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Inter } from 'next/font/google';
import './globals.css';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Flexiple AI Recruiter | Sourcing Refinement Loop',
  description:
    'AI sourcing platform: translate hiring requirements into filters, fit rubrics, and cited candidate shortlists. Powered by Gemini AI.',
  keywords: ['AI recruiter', 'sourcing', 'talent', 'Flexiple', 'hiring', 'candidate'],
  authors: [{ name: 'Flexiple' }],
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${barlowCondensed.variable} ${inter.variable}`}>
      <body className="min-h-[100dvh] flex flex-col bg-[#0A0A0A] text-[#F5F5F5] font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
