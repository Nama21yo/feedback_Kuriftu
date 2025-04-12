"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Feedback } from "@/lib/types"
import { getAllFeedbacks } from "@/lib/firebase-service"
import { formatDate, truncateText } from "@/lib/utils"
import { StarRating } from "@/components/feedback/star-rating"

export function RecentFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const data = await getAllFeedbacks()
        setFeedbacks(data.slice(0, 5))
      } catch (error) {
        console.error("Error loading feedbacks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeedbacks()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-32">Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Feedbacks</CardTitle>
        <CardDescription>The latest feedback submissions from your users</CardDescription>
      </CardHeader>
      <CardContent>
        {feedbacks.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No feedbacks yet</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{feedback.userName}</h4>
                    <p className="text-sm text-muted-foreground">{formatDate(feedback.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={feedback.rating} />
                    <Badge
                      variant={
                        feedback.status === "pending"
                          ? "outline"
                          : feedback.status === "responded"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {feedback.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm mb-2">{truncateText(feedback.comment, 150)}</p>
                <div className="flex justify-end">
                  <Link href={`/dashboard/feedbacks?id=${feedback.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            <div className="flex justify-center mt-4">
              <Link href="/dashboard/feedbacks">
                <Button variant="outline">View All Feedbacks</Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
