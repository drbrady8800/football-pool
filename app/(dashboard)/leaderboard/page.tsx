"use client"
import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Leaderboard from "@/components/leaderboard"
import { getGames } from "@/lib/api/games"
import { toast } from "@/hooks/use-toast"

export default function LeaderboardPage() {
  const [gameCount, setGameCount] = React.useState<number | undefined>()
  const [totalGames, setTotalGames] = React.useState(0)
  const [sortBy, setSortBy] = React.useState<'total' | 'max'>('total')

  // Initial load
  React.useEffect(() => {
    const initializeLeaderboard = async () => {
      try {
        const total = (await getGames()).filter(game => game.isComplete).length
        setTotalGames(total)
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: 'Error fetching initial data:', description: error.message, variant: 'destructive' })
        } else {
          toast({ title: 'Error fetching initial data', variant: 'destructive' })
        }
      }
    }

    initializeLeaderboard()
  }, [])
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div>
            <CardTitle className="text-2xl font-bold">Leaderboard</CardTitle>
          </div>
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: 'total' | 'max') => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total Points</SelectItem>
                <SelectItem value="max">Max Points</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={gameCount?.toString() || "-1"}
              onValueChange={(value) => {
                if (value === "-1") {
                  setGameCount(undefined)
                  return
                }
                setGameCount(parseInt(value))
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select game count" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalGames - 1 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num > 1 ? `First ${num} Games` : "First Game"}
                  </SelectItem>
                ))}
                <SelectItem value="-1">All Games</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Leaderboard gameCount={gameCount} sortBy={sortBy} />
      </CardContent>
    </Card>
  )
}
