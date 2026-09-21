import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flexiple AI Recruiter | Sourcing Refinement Loop',
  description:
    'Cyber-tribal AI sourcing platform: translate free-text hiring requirements into objective filters, subjective fit rubrics, and cited candidate shortlists. Powered by Gemini AI.',
  keywords: ['AI recruiter', 'sourcing', 'talent', 'Flexiple', 'hiring', 'candidate'],
  authors: [{ name: 'Flexiple' }],
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-[100dvh] flex flex-col">
        {children}
      </body>
    </html>
  );
}
