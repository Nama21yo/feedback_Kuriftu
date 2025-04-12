import { db } from "@/lib/firebase";
import type { Feedback, FeedbackStats } from "@/lib/types";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// Collection reference
const feedbacksCollection = collection(db, "feedbacks");

// Get all feedbacks
export async function getAllFeedbacks(): Promise<Feedback[]> {
  const snapshot = await getDocs(
    query(feedbacksCollection, orderBy("createdAt", "desc"))
  );

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      responseDate: data.responseDate?.toDate() || null,
    } as Feedback;
  });
}

// Get feedback by ID
export async function getFeedbackById(id: string): Promise<Feedback | null> {
  const docRef = doc(db, "feedbacks", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    responseDate: data.responseDate?.toDate() || null,
  } as Feedback;
}

// Add new feedback
export async function addFeedback(
  feedback: Omit<Feedback, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(feedbacksCollection, {
    ...feedback,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

// Update feedback
export async function updateFeedback(
  id: string,
  data: Partial<Feedback>
): Promise<void> {
  const docRef = doc(db, "feedbacks", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Delete feedback
export async function deleteFeedback(id: string): Promise<void> {
  const docRef = doc(db, "feedbacks", id);
  await deleteDoc(docRef);
}

// Respond to feedback
export async function respondToFeedback(
  id: string,
  response: string
): Promise<void> {
  const docRef = doc(db, "feedbacks", id);
  await updateDoc(docRef, {
    response,
    responseDate: serverTimestamp(),
    status: "responded",
    updatedAt: serverTimestamp(),
  });
}

// Get feedback statistics
export async function getFeedbackStats(): Promise<FeedbackStats> {
  const snapshot = await getDocs(feedbacksCollection);

  const feedbacks = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Feedback;
  });

  // Calculate total count
  const totalCount = feedbacks.length;

  // Calculate average rating, ensuring that rating is not undefined
  const ratings = feedbacks
    .map((f) => f.rating)
    .filter((rating) => rating !== undefined) as number[];
  const averageRating = ratings.length
    ? Number.parseFloat(
        (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      )
    : 0;

  // Calculate category breakdown
  const categoryBreakdown: { [key: string]: number } = {};
  feedbacks.forEach((f) => {
    if (f.category) {
      categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + 1;
    }
  });

  // Calculate rating distribution
  const ratingDistribution: { [key: string]: number } = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };

  feedbacks.forEach((f) => {
    if (f.rating !== undefined) {
      ratingDistribution[f.rating.toString()] =
        (ratingDistribution[f.rating.toString()] || 0) + 1;
    }
  });

  // Count by status
  const pendingCount = feedbacks.filter((f) => f.status === "pending").length;
  const respondedCount = feedbacks.filter(
    (f) => f.status === "responded"
  ).length;
  const reviewedCount = feedbacks.filter((f) => f.status === "reviewed").length;

  // Calculate trends data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const trendsData = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayFeedbacks = feedbacks.filter((f) => {
      const createdAt = f.createdAt;
      return createdAt >= date && createdAt < nextDate;
    });

    const dayRatings = dayFeedbacks
      .map((f) => f.rating)
      .filter((rating) => rating !== undefined) as number[];
    const dayAvgRating = dayRatings.length
      ? Number.parseFloat(
          (dayRatings.reduce((a, b) => a + b, 0) / dayRatings.length).toFixed(1)
        )
      : 0;

    trendsData.push({
      date: date.toISOString().split("T")[0],
      count: dayFeedbacks.length,
      averageRating: dayAvgRating,
    });
  }

  // Reverse to get chronological order
  trendsData.reverse();

  return {
    totalCount,
    averageRating,
    categoryBreakdown,
    ratingDistribution,
    pendingCount,
    respondedCount,
    reviewedCount,
    trendsData,
  };
}
