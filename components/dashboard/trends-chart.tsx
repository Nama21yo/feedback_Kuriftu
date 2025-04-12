"use client"

import { useTheme } from "next-themes"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"

interface TrendsChartProps {
  data: {
    date: string
    count: number
    averageRating: number
  }[]
}

export function TrendsChart({ data }: TrendsChartProps) {
  const { theme } = useTheme()

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
          <XAxis
            dataKey="date"
            stroke={theme === "dark" ? "#888888" : "#888888"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              const date = new Date(value)
              return `${date.getMonth() + 1}/${date.getDate()}`
            }}
          />
          <YAxis
            stroke={theme === "dark" ? "#888888" : "#888888"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            yAxisId="left"
          />
          <YAxis
            stroke={theme === "dark" ? "#888888" : "#888888"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            orientation="right"
            yAxisId="right"
            domain={[0, 5]}
            tickCount={6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
              borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            yAxisId="left"
            name="Feedback Count"
          />
          <Line
            type="monotone"
            dataKey="averageRating"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            yAxisId="right"
            name="Average Rating"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
