export interface Feedback {
  id: string
  userId: string
  userName: string
  userEmail: string
  rating: number
  comment: string
  category: string
  status: "pending" | "reviewed" | "responded"
  createdAt: Date
  updatedAt: Date
  response?: string
  responseDate?: Date
}

export interface FeedbackStats {
  totalCount: number
  averageRating: number
  categoryBreakdown: {
    [key: string]: number
  }
  ratingDistribution: {
    [key: string]: number
  }
  pendingCount: number
  respondedCount: number
  reviewedCount: number
  trendsData: {
    date: string
    count: number
    averageRating: number
  }[]
}

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
}
