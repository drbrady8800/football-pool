"use client"
import Link from "next/link"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getStandings } from "@/lib/api/standings"
import { type Standing } from "@/lib/types"
import { isLastPlace, isFirstPlace } from '@/lib/utils';
import { toast } from "@/hooks/use-toast"

interface LeaderboardProps {
  condensed?: boolean;
  gameCount?: number;
  userCount?: number;
  standingsOverride?: Array<Standing>;
  loading?: boolean;
}

function LeaderboardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-lg border bg-card"
        >
          {/* Rank & User Info */}
          <div className="flex items-center gap-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="hidden md:block h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-24" />
            </div>
          </div>

          {/* Points Badge */}
          <Skeleton className="h-6 w-20" />
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
  loading: loadingProp = false
}: LeaderboardProps) {
  const [standings, setStandings] = React.useState<Array<Standing>>([])
  const [loading, setLoading] = React.useState<boolean>(false)

  // Initial load - only if we don't have standingsOverride
  React.useEffect(() => {
    if (standingsOverride) return;

    const initializeLeaderboard = async () => {
      try {
        setLoading(true)
        const initialStandings = await getStandings({ numGames: gameCount })
        setStandings(initialStandings)
      } catch (error) {
        if (error instanceof Error) {
          toast({ 
            title: 'Error fetching initial data:', 
            description: error.message, 
            variant: 'destructive' 
          })
        } else {
          toast({ 
            title: 'Error fetching initial data', 
            variant: 'destructive' 
          })
        }
      } finally {
        setLoading(false)
      }
    }
    initializeLeaderboard()
  }, [gameCount, standingsOverride])
  
  // Use override standings if provided, otherwise use fetched standings
  const displayStandings = standingsOverride || standings;
  const isLoading = loadingProp || loading;

  if (displayStandings.length === 0 || isLoading) {
    return <LeaderboardSkeleton count={userCount ?? 5} />
  }

  return (
    <div className="space-y-4">
      {displayStandings
        .sort((a, b) => b.points - a.points)
        .slice(0, userCount)
        .map((standing, index) => {
          const isInFirstPlace = isFirstPlace(standing, displayStandings)
          const isInLastPlace = isLastPlace(standing, displayStandings)
          const previousPlayer = index > 0 ? displayStandings[index - 1] : null
          const displayRank = previousPlayer && previousPlayer.points === standing.points
            ? displayStandings.findIndex(s => s.points === standing.points) + 1
            : index + 1

          return (
            <Link
              href={`/leaderboard/${standing.userId}`}
              key={standing.userId}
              className="block"
            >
              <div className="flex items-center justify-between p-4 border bg-card hover:bg-accent/50 transition-colors rounded-lg cursor-pointer">
                {/* Rank & User Info */}
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

                {/* Points */}
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
              </div>
            </Link>
          )
        })}
    </div>
  )
}
