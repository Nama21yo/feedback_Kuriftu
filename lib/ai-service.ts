// lib/ai-service.ts
import { Feedback, FeedbackStats } from "@/lib/types";
import { CohereClient } from "cohere-ai";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAllFeedbacks } from "@/lib/firebase-service";

// Initialize Cohere client
const cohereClient = new CohereClient({
  token:
    process.env.COHERE_API_KEY || "wMFYau4GejldfEYjd8BEtLtmtoEiPTj9T8PoOA7f",
});

// Kuriftu Resort specific knowledge base
const kuriftuKnowledge = {
  about:
    "Kuriftu Resorts & Spa is a premier luxury resort chain in Ethiopia with locations in Bishoftu, Lake Tana, and Entoto. We offer world-class accommodations, dining, and spa experiences.",
  locations: {
    bishoftu: "Our flagship location with beautiful views of Lake Babogaya",
    lakeTana: "Set on the shores of Ethiopia's largest lake",
    entoto: "Located in the mountains with spectacular views of Addis Ababa",
  },
  amenities: {
    rooms: [
      {
        type: "Egypt-Guinea",
        features: "Premium rooms with luxury amenities and cultural decor",
      },
      {
        type: "Guinea Bissau-Mauritius",
        features: "Elegant rooms with unique African-inspired design",
      },
      {
        type: "Chad-Djibouti",
        features: "Spacious accommodations with private balconies",
      },
      {
        type: "Botswana-CAR",
        features:
          "Premium rooms (105-110) with stone finishes and natural elements",
      },
    ],
    dining: {
      summit: "Our flagship restaurant offering panoramic views",
      international:
        "American-style breakfast with potatoes, eggs, sausages, and bacon",
      ethiopian: "Traditional Ethiopian cuisine section in our buffet",
    },
    recreation: [
      "Water park suitable for different age groups",
      "Swimming pools",
      "Spa and wellness center",
      "Kayaking activities",
      "Cinema",
      "The Butchery restaurant",
    ],
    events: [
      "Large wedding hall with natural stone architecture",
      "Conference facilities",
      "Private event spaces",
    ],
  },
  features: {
    architecture:
      "Natural stone walls and large windows offering views of Addis Ababa",
    rooms:
      "Sitting areas, fireplaces, balconies, minibars, mosquito nets, large showers, and dedicated closet space",
    entertainment:
      "Water park with circus features, family-friendly activities",
  },
  languages: ["Amharic", "English", "French", "Arabic"],
};

// Categories based on Kuriftu's specific offerings
const feedbackCategories = [
  "Room Comfort",
  "Staff Service",
  "Dining Experience",
  "Water Park",
  "Spa Services",
  "Family Facilities",
  "Events & Weddings",
  "Nature & Views",
  "Security & Safety",
  "Value for Money",
];

interface AIFeedbackResponse {
  suggestedResponse: string;
  sentimentScore: number;
  topIssues: string[];
  recommendedActions: string[];
}

// Analyze feedback sentiment and generate tailored response
export async function analyzeAndRespondToFeedback(
  feedback: Feedback
): Promise<AIFeedbackResponse> {
  try {
    // Get context from previous guest feedback if available
    const previousFeedbackContext = await getPreviousFeedbackContext(
      feedback.userEmail
    );

    // Construct the prompt with specific Kuriftu knowledge
    const prompt = `
    You are an AI assistant for Kuriftu Resort & Spa, a luxury resort in Ethiopia.
    
    RESORT DETAILS:
    - Premium luxury experience with African-inspired design and architecture
    - Multiple locations: Bishoftu (flagship), Lake Tana, and Entoto
    - Features: water park, spa, summit restaurant, kayaking, cinema, wedding venue
    - Room types themed after African countries (Egypt-Guinea, Guinea Bissau-Mauritius, etc.)
    - Natural stone architecture with large windows offering views
    - Family-friendly with activities for children
    
    FEEDBACK FROM GUEST:
    Rating: ${feedback.rating}/5
    Category: ${feedback.category}
    Comment: "${feedback.comment}"
    
    ${
      previousFeedbackContext
        ? `Previous feedback from this guest: ${previousFeedbackContext}`
        : ""
    }
    
    TASK:
    1. Analyze the sentiment (positive, negative, or mixed)
    2. Identify specific aspects of their experience (room, food, staff, facilities)
    3. Create a personalized response that:
       - Addresses their specific comments
       - References relevant Kuriftu Resort features
       - Offers solutions to any issues raised
       - Is warm, professional and authentic
       - Thanks them for their feedback
       - Invites them to return
    4. Suggest 1-2 actionable steps for staff to address any concerns
    5. Identify top issues mentioned (if any)
    
    RESPONSE FORMAT:
    {
      "response": "The complete response to send to the guest",
      "sentimentScore": A number from -10 (very negative) to +10 (very positive),
      "topIssues": ["List of main issues mentioned"],
      "recommendedActions": ["Actions for staff to take"]
    }
    `;

    // Generate response using Cohere
    const response = await cohereClient.generate({
      prompt,
      maxTokens: 500,
      temperature: 0.7,
      model: "command-xlarge",
    });

    // Parse the response
    const aiResponse = JSON.parse(response.generations[0].text);

    return {
      suggestedResponse: aiResponse.response,
      sentimentScore: aiResponse.sentimentScore,
      topIssues: aiResponse.topIssues,
      recommendedActions: aiResponse.recommendedActions,
    };
  } catch (error) {
    console.error("Error analyzing feedback:", error);

    // Fallback response if AI fails
    return {
      suggestedResponse: `Thank you for your feedback about Kuriftu Resort. We appreciate your rating of ${feedback.rating}/5 and your comments. Our team will review your feedback carefully and we hope to welcome you back soon.`,
      sentimentScore: feedback.rating > 3 ? 5 : 0,
      topIssues: ["AI analysis failed"],
      recommendedActions: ["Review feedback manually"],
    };
  }
}

// Get previous feedback from the same guest for context
async function getPreviousFeedbackContext(
  userEmail?: string
): Promise<string | null> {
  if (!userEmail) return null;

  try {
    const feedbacks = await getAllFeedbacks();
    const previousFeedbacks = feedbacks
      .filter((f) => f.userEmail === userEmail)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3);

    if (previousFeedbacks.length === 0) return null;

    return previousFeedbacks
      .map(
        (f) =>
          `Previous feedback (${f.createdAt.toLocaleDateString()}): Rating ${
            f.rating
          }/5 - "${f.comment}"`
      )
      .join("\n");
  } catch (error) {
    console.error("Error fetching previous feedback:", error);
    return null;
  }
}

// Detect significant changes in ratings and alert management
export async function detectRatingTrends(): Promise<any> {
  const feedbacks = await getAllFeedbacks();

  // Calculate 7-day and 30-day average ratings
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentFeedbacks = feedbacks.filter((f) => f.createdAt >= sevenDaysAgo);
  const monthFeedbacks = feedbacks.filter((f) => f.createdAt >= thirtyDaysAgo);

  const recentAvg =
    recentFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
    (recentFeedbacks.length || 1);
  const monthAvg =
    monthFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
    (monthFeedbacks.length || 1);

  // Calculate rating trend by category
  const categoryTrends: Record<
    string,
    { recent: number; month: number; change: number }
  > = {};

  feedbackCategories.forEach((category) => {
    const recentCategoryFeedbacks = recentFeedbacks.filter(
      (f) => f.category === category
    );
    const monthCategoryFeedbacks = monthFeedbacks.filter(
      (f) => f.category === category
    );

    const recentCatAvg =
      recentCategoryFeedbacks.length > 0
        ? recentCategoryFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
          recentCategoryFeedbacks.length
        : 0;

    const monthCatAvg =
      monthCategoryFeedbacks.length > 0
        ? monthCategoryFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
          monthCategoryFeedbacks.length
        : 0;

    categoryTrends[category] = {
      recent: recentCatAvg,
      month: monthCatAvg,
      change: recentCatAvg - monthCatAvg,
    };
  });

  // Update the trends in Firestore
  const trendsRef = doc(db, "analytics", "ratingTrends");
  await setDoc(
    trendsRef,
    {
      overallRecent: recentAvg,
      overallMonth: monthAvg,
      overallChange: recentAvg - monthAvg,
      categoryTrends,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    overallRecent: recentAvg,
    overallMonth: monthAvg,
    overallChange: recentAvg - monthAvg,
    categoryTrends,
  };
}

// Generate feedback summaries for management insights
export async function generateFeedbackSummary(): Promise<any> {
  const feedbacks = await getAllFeedbacks();
  const recentFeedbacks = feedbacks
    .filter((f) => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return f.createdAt >= oneMonthAgo;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (recentFeedbacks.length === 0) {
    return "No recent feedback available for summary.";
  }

  // Prepare feedbacks for summarization
  const feedbacksText = recentFeedbacks
    .map(
      (f) =>
        `Rating: ${f.rating}/5, Category: ${f.category}, Comment: "${f.comment}"`
    )
    .join("\n\n");

  try {
    // Generate summary using Cohere
    const response = await cohereClient.summarize({
      text: feedbacksText,
      length: "medium",
      format: "paragraph",
      extractiveness: "medium",
      temperature: 0.3,
      additionalCommand:
        "Focus on recurring themes, highest praised aspects, and most common complaints specific to Kuriftu Resort. Highlight areas for improvement and maintenance priorities.",
    });

    // Store the summary in Firestore
    const summaryRef = doc(db, "analytics", "feedbackSummary");
    await setDoc(
      summaryRef,
      {
        summary: response.summary,
        basedOn: recentFeedbacks.length,
        period: "Past 30 days",
        generatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return response.summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Failed to generate feedback summary. Please try again later.";
  }
}

// Generate language-specific responses based on guest preferences
export async function generateLocalizedResponse(
  feedback: Feedback,
  language: "English" | "Amharic" | "French" | "Arabic" = "English"
): Promise<string> {
  const aiResponse = await analyzeAndRespondToFeedback(feedback);

  if (language === "English") {
    return aiResponse.suggestedResponse;
  }

  try {
    // Translate the response using Cohere
    const response = await cohereClient.generate({
      prompt: `Translate the following hotel guest response from English to ${language}. 
               Maintain the professional, warm tone and all specific details about Kuriftu Resort.
               
               Text to translate:
               "${aiResponse.suggestedResponse}"`,
      maxTokens: 500,
      temperature: 0.2,
      model: "command-xlarge",
    });

    return response.generations[0].text.trim();
  } catch (error) {
    console.error(`Error translating to ${language}:`, error);
    return aiResponse.suggestedResponse;
  }
}

// Save AI-generated responses to Firestore
export async function saveAIResponse(
  feedbackId: string,
  aiResponse: AIFeedbackResponse
): Promise<void> {
  const responseRef = doc(db, "feedbacks", feedbackId);

  await updateDoc(responseRef, {
    response: aiResponse.suggestedResponse,
    responseDate: serverTimestamp(),
    status: "responded",
    updatedAt: serverTimestamp(),
    aiAnalysis: {
      sentimentScore: aiResponse.sentimentScore,
      topIssues: aiResponse.topIssues,
      recommendedActions: aiResponse.recommendedActions,
    },
  });
}
