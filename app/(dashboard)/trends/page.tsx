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
import { useYear } from "@/lib/contexts/year-context"
import { useUsers } from "@/lib/api/hooks/use-users"

interface Player {
  value: string
  label: string
};

export default function StatsPage() {
  const { year } = useYear()
  const { data: users = [] } = useUsers(year)
  const [selectedPlayers, setSelectedPlayers] = React.useState<string[]>([])
  
  const players = React.useMemo(() => {
    return users.map(user => ({
      value: user.id,
      label: user.name
    }))
  }, [users])
  
  React.useEffect(() => {
    if (users.length > 0 && selectedPlayers.length === 0) {
      // Initially select all players
      setSelectedPlayers(users.map(user => user.id))
    }
  }, [users, selectedPlayers])

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