"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface RatingChartProps {
  data: {
    [key: string]: number
  }
}

export function RatingChart({ data }: RatingChartProps) {
  const { theme } = useTheme()

  const chartData = [
    { name: "1 Star", value: data["1"] || 0 },
    { name: "2 Stars", value: data["2"] || 0 },
    { name: "3 Stars", value: data["3"] || 0 },
    { name: "4 Stars", value: data["4"] || 0 },
    { name: "5 Stars", value: data["5"] || 0 },
  ]

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            stroke={theme === "dark" ? "#888888" : "#888888"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={theme === "dark" ? "#888888" : "#888888"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
              borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            }}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
