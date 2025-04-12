"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FeedbackStats } from "@/lib/types"
import { getFeedbackStats } from "@/lib/firebase-service"
import { RatingChart } from "@/components/dashboard/rating-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { TrendsChart } from "@/components/dashboard/trends-chart"
import { StatsCards } from "@/components/dashboard/stats-cards"

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getFeedbackStats()
        setStats(data)
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64 md:ml-64">Loading...</div>
  }

  if (!stats) {
    return <div className="md:ml-64">Failed to load statistics</div>
  }

  return (
    <div className="space-y-6 md:ml-64">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Detailed analytics and insights from your feedback data</p>
      </div>

      <StatsCards stats={stats} />

      <Tabs defaultValue="ratings">
        <TabsList>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <CardDescription>Breakdown of feedback by rating</CardDescription>
            </CardHeader>
            <CardContent>
              <RatingChart data={stats.ratingDistribution} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Feedback by category</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryChart data={stats.categoryBreakdown} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Trends</CardTitle>
              <CardDescription>Feedback volume and ratings over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendsChart data={stats.trendsData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
