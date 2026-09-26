import React from 'react';
import type { Metadata } from 'next';
import { AuthProvider } from '@/shared/providers/AuthProvider';
import { AppShell } from '@/shared/components/layout/AppShell';
import '@/shared/styles/globals.css';

export const metadata: Metadata = {
  title: 'Cognify — Educational Social Media Platform',
  description: 'A modern knowledge-sharing platform for learners, educators, and creators.',
  keywords: 'education, learning, social media, knowledge sharing, students, educators',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
