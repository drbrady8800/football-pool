"use client"
import Link from "next/link"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useYear } from "@/lib/contexts/year-context"
import { useStandings } from "@/lib/api/hooks/use-standings"
import { type Standing } from "@/lib/types"
import { isLastPlace, isFirstPlace } from '@/lib/utils';

interface LeaderboardProps {
  condensed?: boolean;
  gameCount?: number;
  userCount?: number;
  standingsOverride?: Array<Standing>;
  loading?: boolean;
  sortBy?: 'total' | 'max';
}

function LeaderboardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="hidden md:block h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Leaderboard({ 
  condensed,
  gameCount, 
  userCount,
  standingsOverride,
  loading: loadingProp = false,
  sortBy = 'total'
}: LeaderboardProps) {
  const { year } = useYear()
  const { data: standings = [], isLoading: standingsLoading } = useStandings(year, gameCount)

  const allGameCompleted = standings.every(standing => standing.maxPoints === standing.points);
  
  const displayStandings = standingsOverride || standings;
  const isLoading = loadingProp || standingsLoading;

  if (displayStandings.length === 0 || isLoading) {
    return <LeaderboardSkeleton count={userCount ?? 5} />
  }

  // Sort by total points to determine overall rankings
  const totalPointsStandings = [...displayStandings].sort((a, b) => b.points - a.points);
  
  // Create the sorted list based on selected sort method
  const sortedStandings = [...displayStandings].sort((a, b) => {
    if (sortBy === 'max' && a.maxPoints && b.maxPoints) {
      return b.maxPoints - a.maxPoints
    }
    return b.points - a.points
  })

  return (
    <div className="space-y-4">
      {sortedStandings
        .slice(0, userCount)
        .map((standing, index) => {
          // Always determine first/last place based on total points
          const isInFirstPlace = isFirstPlace(standing, totalPointsStandings)
          const isInLastPlace = isLastPlace(standing, totalPointsStandings)
          
          // Calculate display rank based on current sort method
          const previousPlayer = index > 0 ? sortedStandings[index - 1] : null
          const displayRank = previousPlayer && 
            (sortBy === 'max' 
              ? previousPlayer.maxPoints === standing.maxPoints
              : previousPlayer.points === standing.points)
            ? sortedStandings.findIndex(s => 
                sortBy === 'max' 
                  ? s.maxPoints === standing.maxPoints
                  : s.points === standing.points
              ) + 1
            : index + 1

          return (
            <Link
              href={`/leaderboard/${standing.userId}`}
              key={standing.userId}
              className="block"
            >
              <div className="flex items-center justify-between p-4 border bg-card hover:bg-accent/50 transition-colors rounded-lg cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <span className="text-sm font-bold">
                      {displayRank}
                    </span>
                  </div>
                  <Avatar className="hidden md:block h-10 w-10">
                    <AvatarImage src={`https://avatar.vercel.sh/${standing.name}`} />
                    <AvatarFallback>{standing.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{standing.name}</p>
                  </div>
                  {isInFirstPlace && !condensed && (
                    <span className="text-2xl" role="img" aria-label="Crown">
                      👑
                    </span>
                  )}
                  {isInLastPlace && !condensed && (
                    <span className="text-2xl" role="img" aria-label="Last Place">
                      🚽
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    variant={
                      isInFirstPlace 
                        ? "success"
                        : isInLastPlace 
                          ? "destructive" 
                          : "secondary"
                    }
                    className="text-sm"
                  >
                    {standing.points} points
                  </Badge>
                  {standing.maxPoints && !allGameCompleted && (
                    <Badge 
                      variant="outline"
                      className="text-sm"
                    >
                      Max: {standing.maxPoints} points
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
    </div>
  )
}
