"use client"

import React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { interpolateRainbow } from 'd3-scale-chromatic'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { toast } from "@/hooks/use-toast"
import { fetchStandingsChartData } from "@/lib/api/standings"
import { fetchUsers } from "@/lib/api/users"
import { type StandingChartColumn } from "@/lib/types"
import { type User } from "@/db/types"

export default function StatsPage() {
  const [standingChartData, setStandingCartData] = React.useState<StandingChartColumn[]>()
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>()
  const [isLoading, setIsLoading] = React.useState(false)

  // Initial load
  React.useEffect(() => {
    const initializeChart = async () => {
      try {
        setIsLoading(true)
        const data = await fetchStandingsChartData();
        const users = await fetchUsers();
        setStandingCartData(data);

        const chartConfig = users.reduce((prev, cur, index) => ({
          ...prev, [cur.id]: { label: cur.name, color: interpolateRainbow(index / users.length) }
        }), {})
        setChartConfig(chartConfig)
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: 'Error fetching initial data:', description: error.message, variant: 'destructive' })
        } else {
          toast({ title: 'Error fetching initial data', variant: 'destructive' })
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeChart()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stadings Over Time</CardTitle>
        <CardDescription>Through the first {standingChartData?.length} {standingChartData?.length === 1 ? "game" : "games"}</CardDescription>
      </CardHeader>
      <CardContent>
        {chartConfig && standingChartData && (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={standingChartData}
              margin={{
                left: 12,
                right: 12,
                bottom: 60,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="game"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
                itemSorter={(item) => {
                  return Number(item.value)
                }}
              />
              {Object.entries(chartConfig).map(([userId, { label, color }]) => (
                <Line
                  key={userId}
                  dataKey={userId}
                  type="monotone"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
