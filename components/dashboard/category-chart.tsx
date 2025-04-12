"use client"

import { useTheme } from "next-themes"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface CategoryChartProps {
  data: {
    [key: string]: number
  }
}

export function CategoryChart({ data }: CategoryChartProps) {
  const { theme } = useTheme()

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--destructive))",
    "#10b981",
    "#8b5cf6",
    "#f59e0b",
  ]

  const chartData = Object.entries(data).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length],
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
              borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
