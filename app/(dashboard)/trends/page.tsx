"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import PointsTrend from "@/components/points-trend"
import MultiSelect from "@/components/multi-select"
import { getUsers } from "@/lib/api/users"

interface Player {
  value: string
  label: string
};

export default function StatsPage() {
  const [selectedPlayers, setSelectedPlayers] = React.useState<string[]>([])
  const [players, setPlayers] = React.useState<Player[]>([])
  
  React.useEffect(() => {
    const loadPlayers = async () => {
      try {
        const users = await getUsers()
        setPlayers(users.map(user => ({
          value: user.id,
          label: user.name
        })))
        // Initially select all players
        setSelectedPlayers(users.map(user => user.id))
      } catch (error) {
        console.error('Error loading players:', error)
      }
    }
    
    loadPlayers()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 gap-24">
        <CardTitle className="flex-shrink-0">Standings Over Time</CardTitle>
        <MultiSelect
          className="max-w-[700px] hidden md:block"
          placeholder="Select players..."
          selected={selectedPlayers}
          options={players}
          onChange={setSelectedPlayers}
        />
      </CardHeader>
      <CardContent>
        <PointsTrend selectedPlayers={selectedPlayers} />
        <MultiSelect
          className="max-w-[700px] pt-8 block md:hidden"
          placeholder="Select players..."
          selected={selectedPlayers}
          options={players}
          onChange={setSelectedPlayers}
        />
      </CardContent>
    </Card>
  )
}