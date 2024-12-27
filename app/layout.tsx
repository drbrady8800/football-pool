import './globals.css';

import { Toaster } from "@/components/ui/toaster";
import { Analytics } from '@vercel/analytics/react';

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
        {children}
        <Toaster />
      </body>
      <Analytics />
    </html>
  );
}
