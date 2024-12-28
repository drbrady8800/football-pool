"use client"

import React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { interpolateRainbow } from 'd3-scale-chromatic'

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

interface PointsTrendProps {
  miniture?: boolean;
}

export default function PointsTrend({ miniture }: PointsTrendProps) {
  const [standingChartData, setStandingCartData] = React.useState<StandingChartColumn[]>()
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>()

  // Initial load
  React.useEffect(() => {
    const initializeChart = async () => {
      try {
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
      }
    }

    initializeChart()
  }, [])

  return (
    <>
      {chartConfig && standingChartData ? (
        <ChartContainer config={chartConfig} className={miniture ? 'md:h-96 w-full' : ''}>
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
              wrapperStyle={{ zIndex: 100 }}
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
      ): (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      )}
    </>
  )
}
