"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Home,
  LineChart,
  Trophy,
  TrendingUpDown,
  PanelLeft,
  ListOrdered
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type NavItemInfo = {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const navItems: Array<NavItemInfo> = [
  {
    icon: <Home className="h-5 w-5" />,
    label: 'Home',
    href: '/'
  },
  {
    icon: <ListOrdered className="h-5 w-5" />,
    label: 'Leaderboard',
    href: '/leaderboard'
  },
  {
    icon: <Trophy className="h-5 w-5" />,
    label: 'Games',
    href: '/games'
  },
  // {
  //   icon: <LineChart className="h-5 w-5" />,
  //   label: 'Stats',
  //   href: '/stats'
  // },
  // {
  //   icon: <TrendingUpDown className="h-5 w-5" />,
  //   label: 'Projections',
  //   href: '/projections'
  // }
];

interface NavItemProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

export function NavItem({
  href,
  label,
  children
}: NavItemProps) {
  const pathname = usePathname();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
            {
              'bg-accent text-black': pathname === href
            }
          )}
        >
          {children}
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        {navItems.map((item, index) => (
          <NavItem key={index} href={item.href} label={item.label}>
            {item.icon}
          </NavItem>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}