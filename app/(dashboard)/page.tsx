"use client"

import React from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import GamesList from "@/components/games-list";
import Leaderboard from "@/components/leaderboard";
import PointsTrend from "@/components/points-trend";
import { toast } from "@/hooks/use-toast";

import { fetchGames } from "@/lib/api/games";
import { fetchUsers } from "@/lib/api/users";
import { type GameWithTeams, type User } from "@/db/types";
import { set } from "lodash";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter()
  const [games, setGames] = React.useState<GameWithTeams[]>([])
  const [users, setUsers] = React.useState<User[]>([])
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        // Then fetch initial standings
        const initialGames = await fetchGames()
        const initialUsers = await fetchUsers()

        const today = new Date()
        // Check if the game is happening or has happened today
        setGames(initialGames.filter(game => new Date(game.gameDate).toDateString() === today.toDateString()))
        setUsers(initialUsers)
        setSelectedUser(initialUsers[0])
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: 'Error fetching games:', description: error.message, variant: 'destructive' })
        } else {
          toast({ title: 'Error fetching games', variant: 'destructive' })
        }
      } finally {
        setLoading(false)
      }
    }
    initializeData()
  }, [])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Leaderboard userCount={5} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>View Your Picks</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row items-center gap-4">
          <Select
            defaultValue={selectedUser?.id}
            onValueChange={(value) => {
              const user = users.find(u => u.id === value)
              setSelectedUser(user || null)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a person" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => router.push(`/leaderboard/${selectedUser?.id}`)}>View Picks</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Points Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <PointsTrend miniture={true} />
        </CardContent>
      </Card>
      <GamesList games={games} isLoading={loading} title="Today's Games"/>
    </>
  );
}
