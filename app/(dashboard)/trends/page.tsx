"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import PointsTrend from "@/components/points-trend"

export default function StatsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Standings Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <PointsTrend />
      </CardContent>
    </Card>
  )
}
