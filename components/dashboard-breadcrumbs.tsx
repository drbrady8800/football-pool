"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { capitalize } from 'lodash';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { type GameWithTeams, type User } from '@/db/types';
import { fetchGameById } from '@/lib/api/games';
import { fetchUserById } from '@/lib/api/users';

function GameBreadcrumb({ gameId }: { gameId: string }) {
  const [game, setGame] = useState<GameWithTeams | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGame() {
      try {
        const response = await fetchGameById(gameId);
        setGame(response);
      } catch (error) {
        console.error('Error fetching game:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGame();
  }, [gameId]);

  if (isLoading) {
    return <Skeleton className="h-4 w-20" />;
  }

  return <span>{game?.name || gameId}</span>;
}

function UserBreadcrumb({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetchUserById(userId);
        setUser(response);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  
  if (isLoading) {
    return <Skeleton className="h-4 w-20" />;
  }

  return <span>{user?.name || userId}</span>;
}

export default function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const splitPathname = pathname.split("/");
  const linkRoutes = splitPathname.slice(1, -1);
  const finalRoute = splitPathname.slice(-1);

  // Function to check if a route is a game UUID
  const isGameRoute = (routePath: string) => {
    return routePath.match(/\/games\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  };

  // Function to check if a route is a game UUID
  const isUserRoute = (routePath: string) => {
    return routePath.match(/\/leaderboard\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  };

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
                  <Link href={routePath}>
                    {isGameRoute(routePath) ? (
                      <GameBreadcrumb gameId={route} />
                    ) : isUserRoute(routePath) ? (
                      <UserBreadcrumb userId={route} />
                    ) : (
                      capitalize(route)
                    )}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
        {finalRoute.length > 0 && finalRoute[0] && (
          <React.Fragment key="final-route">
            <BreadcrumbSeparator />
            <BreadcrumbItem key="current-page">
              <BreadcrumbPage>
                {isGameRoute(pathname) ? (
                  <GameBreadcrumb gameId={finalRoute[0]} />
                ) : isUserRoute(pathname) ? (
                  <UserBreadcrumb userId={finalRoute[0]} />
                ) : (
                  capitalize(finalRoute[0])
                )}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </React.Fragment>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
