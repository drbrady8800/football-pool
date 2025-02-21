import DashboardBreadcrumbs from '@/components/dashboard-breadcrumbs';
import { DesktopNav, MobileNav } from '@/components/navigation';

import { Analytics } from '@vercel/analytics/react';
import { User } from './user';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <DesktopNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div>
              <MobileNav />
              <DashboardBreadcrumbs />
            </div>
            {/* <div>
              <User />
            </div> */}
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </TooltipProvider>
  );
}
