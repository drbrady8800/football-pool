"use client"

import React from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import CarderHeaderWithLink from "@/components/card-header-link";
import GamesList from "@/components/games-list";
import Leaderboard from "@/components/leaderboard";
import PointsTrend from "@/components/points-trend";
import { useYear } from "@/lib/contexts/year-context";
import { useGames } from "@/lib/api/hooks/use-games";
import { useUsers } from "@/lib/api/hooks/use-users";
import { type User } from "@/db/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  const router = useRouter()
  const { year } = useYear()
  const { data: allGames = [], isLoading: gamesLoading } = useGames(year)
  const { data: users = [], isLoading: usersLoading } = useUsers(year)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0])
    }
  }, [users, selectedUser])

  const today = new Date()
  const games = allGames.filter(game => new Date(game.gameDate).toDateString() === today.toDateString())
  const loading = gamesLoading || usersLoading
  const initialized = !gamesLoading && !usersLoading

  return (
    <>
      <Card>
        <CarderHeaderWithLink title="Leaderboard" href="/leaderboard" />
        <CardContent className="flex flex-col gap-4">
          <Leaderboard userCount={5} />
          <Separator />
          <h2 className="text-lg font-bold">View Your Picks</h2>
          <div className="flex flex-row items-center gap-4">
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
          </div>
        </CardContent>
      </Card>
      <Card>
        <CarderHeaderWithLink title="Points Trend" href="/trends" />
        <CardContent>
          <PointsTrend miniture={true} />
        </CardContent>
      </Card>
      <GamesList games={games} isLoading={loading} isInitialized={initialized} title="Today's Games" href="/games"/>
    </>
  );
}
