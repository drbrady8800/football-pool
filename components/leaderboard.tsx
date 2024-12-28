"use client"
import Link from "next/link"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchStandings } from "@/lib/api/standings"
import { type Standing } from "@/lib/types"
import { isLastPlace, isFirstPlace } from '@/lib/utils';
import { toast } from "@/hooks/use-toast"

interface LeaderboardProps {
  gameCount?: number;
  userCount?: number;
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

export default function Leaderboard({ gameCount, userCount }: LeaderboardProps) {
  const [standings, setStandings] = React.useState<Array<Standing>>([])
  const [loading, setLoading] = React.useState<boolean>(false)

  // Initial load
  React.useEffect(() => {
    const initializeLeaderboard = async () => {
      try {
        setLoading(true)
        // Then fetch initial standings
        const initialStandings = await fetchStandings({ numGames: gameCount })
        setStandings(initialStandings)
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: 'Error fetching initial data:', description: error.message, variant: 'destructive' })
        } else {
          toast({ title: 'Error fetching initial data', variant: 'destructive' })
        }
      } finally {
        setLoading(false)
      }
    }
    initializeLeaderboard()
  }, [gameCount])
  
  if (standings.length === 0 || loading) {
    return <LeaderboardSkeleton count={userCount ?? 5} />
  }

  return (
    <div className="space-y-4">
      {standings.slice(0, userCount).map((standing, index) => {
        const isInFirstPlace = isFirstPlace(standing, standings)
        const isInLastPlace = isLastPlace(standing, standings)
        const previousPlayer = index > 0 ? standings[index - 1] : null
        const displayRank = previousPlayer && previousPlayer.points === standing.points
          ? standings.findIndex(s => s.points === standing.points) + 1
          : index + 1

        return (
          <Link
            href={`/leaderboard/${standing.userId}`}
            key={standing.userId}
            className="block"
          >
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors rounded-lg cursor-pointer">
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
                {isInFirstPlace && (
                  <span className="text-2xl" role="img" aria-label="Crown">
                    👑
                  </span>
                )}
                {isInLastPlace && (
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
