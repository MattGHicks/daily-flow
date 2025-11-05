import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import './globals.css';

// Temporarily disabled Google Fonts due to network restrictions
// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Daily Flow - Workflow Dashboard',
  description: 'Unified dashboard for managing projects, tasks, and client communications',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
