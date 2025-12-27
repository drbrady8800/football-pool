"use client"

import React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { interpolateRainbow } from 'd3-scale-chromatic'
import { Skeleton } from "@/components/ui/skeleton"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useYear } from "@/lib/contexts/year-context"
import { useStandingsChart } from "@/lib/api/hooks/use-standings"
import { useUsers } from "@/lib/api/hooks/use-users"
import { type StandingChartColumn } from "@/lib/types"

function ChartSkeleton({ miniture }: { miniture?: boolean }) {
  return (
    <div className={`relative w-full ${miniture ? 'md:h-96' : 'h-[600px]'}`}>
      <div className="absolute inset-0 flex items-end">
        {/* Y-axis ticks */}
        <div className="h-full pr-2 flex flex-col justify-between py-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={`y-${i}`} className="h-4 w-8" />
          ))}
        </div>

        <div className="flex-1 h-full pb-16">
          {/* Chart area with animated lines */}
          <div className="relative h-full">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={`grid-${i}`} 
                  className="w-full border-t border-gray-100"
                />
              ))}
            </div>

            {/* Animated line placeholders */}
            <div className="absolute inset-0">
              {[...Array(4)].map((_, i) => (
                <div
                  key={`line-${i}`}
                  className="absolute inset-x-0 h-0.5 animate-pulse"
                  style={{
                    top: `${25 + (i * 15)}%`,
                    background: `linear-gradient(90deg, 
                      transparent 0%, 
                      ${interpolateRainbow(i / 4)} 50%, 
                      transparent 100%
                    )`,
                    opacity: 0.5
                  }}
                />
              ))}
            </div>
          </div>

          {/* X-axis ticks */}
          <div className="absolute bottom-0 w-full flex justify-between px-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton 
                key={`x-${i}`} 
                className="h-4 w-12 -rotate-45 origin-top-left"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


interface PointsTrendProps {
  miniture?: boolean;
  selectedPlayers?: string[];
}

export default function PointsTrend({ miniture, selectedPlayers }: PointsTrendProps) {
  const { year } = useYear()
  const { data: standingChartData = [] } = useStandingsChart(year)
  const { data: allUsers = [] } = useUsers(year)
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>()
  const [key, setKey] = React.useState(0) // Key for forcing chart redraw

  // Calculate maxPoints considering selectedPlayers if defined
  const maxPoints = React.useMemo(() => 
    standingChartData.length > 0
      ? Math.max(...standingChartData.map(data => 
          Math.max(...Object.entries(data)
            .filter(([key]) => !selectedPlayers || selectedPlayers.includes(key))
            .map(([_, value]) => Number(value) || 0))
        )) 
      : 0
  , [standingChartData, selectedPlayers]);

  // Update chart config when selectedPlayers changes
  React.useEffect(() => {
    if (!allUsers.length) return;

    // Filter users if selectedPlayers is defined
    const relevantUsers = selectedPlayers 
      ? allUsers.filter(user => selectedPlayers.includes(user.id))
      : allUsers;

    // Update chart config with colors only for relevant users
    const newChartConfig = relevantUsers.reduce((prev, cur, index) => ({
      ...prev,
      [cur.id]: {
        label: cur.name,
        color: interpolateRainbow(index / relevantUsers.length)
      }
    }), {});

    setChartConfig(newChartConfig);
    setKey(prev => prev + 1); // Force chart redraw
  }, [selectedPlayers, allUsers]);

  return (
    <>
      {chartConfig && standingChartData ? (
        <ChartContainer 
          key={key} // Force redraw when key changes
          config={chartConfig} 
          className={miniture ? 'md:h-96 w-full' : ''}
        >
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
            <YAxis tickLine={false} axisLine={false} type="number" domain={[0, maxPoints + 1]} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
              itemSorter={(item) => Number(item.value)}
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
      ) : (
        <ChartSkeleton miniture={miniture} />
      )}
    </>
  )
}
