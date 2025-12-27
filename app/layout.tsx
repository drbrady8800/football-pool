import './globals.css';

import { Toaster } from "@/components/ui/toaster";
import { Analytics } from '@vercel/analytics/react';
import { QueryProvider } from '@/lib/providers/query-provider';
import { YearProvider } from '@/lib/contexts/year-context';

export const metadata = {
  title: "Big George's Football Pool",
  description:
    'A college football pickem pool for the Kunberger family.',
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col">
        <QueryProvider>
          <YearProvider>
            {children}
          </YearProvider>
        </QueryProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
