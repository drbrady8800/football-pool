"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { capitalize } from 'lodash';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

export default function DashboardBreadcrumbs() {
  const pathname = usePathname().split("/");
  const linkRoutes = pathname.slice(1, -1);
  const finalRoute = pathname.slice(-1);

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem key="home">
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {linkRoutes.map((route, index) => {
          if (route === '') return null;
          const routePath = `/${linkRoutes.slice(0, index + 1).join('/')}`;
          return (
            <React.Fragment key={routePath}>
              <BreadcrumbSeparator key={`${routePath}-separator`} />
              <BreadcrumbItem key={routePath}>
                <BreadcrumbLink asChild>
                  <Link href={routePath}>{capitalize(route)}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
        {finalRoute.length > 0 && finalRoute[0] && (
          <React.Fragment key="final-route">
            <BreadcrumbSeparator />
            <BreadcrumbItem key="current-page">
              <BreadcrumbPage>{capitalize(finalRoute[0])}</BreadcrumbPage>
            </BreadcrumbItem>
          </React.Fragment>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
