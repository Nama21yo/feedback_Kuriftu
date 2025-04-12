// app/dashboard/feedbacks/summary/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Sparkles,
  Star,
  ArrowRight,
  BarChart3,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Award,
} from "lucide-react";
import { generateFeedbackSummary } from "@/lib/ai-service";
import { getFeedbackStats } from "@/lib/firebase-service";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default function FeedbackSummaryPage() {
  const [summary, setSummary] = useState("");
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load existing summary if available
      const summaryRef = doc(db, "analytics", "feedbackSummary");
      const summarySnap = await getDoc(summaryRef);

      if (summarySnap.exists()) {
        const data = summarySnap.data();
        setSummary(data.summary || "");
        setSummaryData({
          basedOn: data.basedOn,
          period: data.period,
          generatedAt: data.generatedAt?.toDate() || new Date(),
        });
      }

      // Load rating trends
      const trendsRef = doc(db, "analytics", "ratingTrends");
      const trendsSnap = await getDoc(trendsRef);

      if (trendsSnap.exists()) {
        setTrends(trendsSnap.data());
      }

      // Load insights
      const insightsRef = doc(db, "analytics", "managementInsights");
      const insightsSnap = await getDoc(insightsRef);

      if (insightsSnap.exists()) {
        setInsights(insightsSnap.data());
      }

      // Load general stats
      const feedbackStats = await getFeedbackStats();
      setStats(feedbackStats);
    } catch (error) {
      console.error("Error loading summary data:", error);
      toast.error("Failed to load summary data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      const newSummary = await generateFeedbackSummary();
      setSummary(newSummary);

      // Reload data to get updated summary metadata
      await loadData();

      toast.success("Feedback summary generated");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary");
    } finally {
      setGenerating(false);
    }
  };

  // Helper function to determine if a trend is significant
  const isSignificantChange = (change: number) => {
    return Math.abs(change) >= 0.3; // Consider 0.3+ change in rating significant
  };

  // Helper function to get trend icon and color
  const getTrendIndicator = (change: number) => {
    if (change > 0.1) {
      return {
        icon: <TrendingUp className="h-5 w-5" />,
        color: "text-green-500",
      };
    } else if (change < -0.1) {
      return {
        icon: <TrendingDown className="h-5 w-5" />,
        color: "text-red-500",
      };
    } else {
      return {
        icon: <ArrowRight className="h-5 w-5" />,
        color: "text-yellow-500",
      };
    }
  };

  // Mock data for insights if not available
  const defaultInsights = {
    topStrengths: [
      "Exceptional staff service and hospitality",
      "Beautiful and well-maintained grounds",
      "High-quality food and dining experience",
    ],
    topImprovements: [
      "Inconsistent Wi-Fi connectivity in rooms",
      "Delays in check-in process during peak hours",
      "Limited entertainment options in the evening",
    ],
    actionableItems: [
      "Implement staff training for faster check-in procedures",
      "Upgrade Wi-Fi infrastructure in guest rooms",
      "Develop evening entertainment program for guests",
    ],
    competitiveInsights:
      "Kuriftu Resort maintains a strong position against local competitors with superior ratings for service quality and ambiance. However, nearby resorts are gaining ground in the 'value for money' category.",
  };

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6 md:ml-64">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Kuriftu Resort Feedback Summary
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-powered insights from guest feedback
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={loadData} disabled={loading}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button onClick={handleGenerateSummary} disabled={generating}>
                <Sparkles className="h-4 w-4 mr-2" />
                {generating ? "Generating..." : "Generate New Summary"}
              </Button>
            </div>
          </div>

          {stats && !loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Average Rating
                      </p>
                      <div className="flex items-center mt-1">
                        <p className="text-3xl font-bold">
                          {stats.averageRating.toFixed(1)}
                        </p>
                        <Star className="h-5 w-5 ml-1 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <Badge
                      variant={
                        stats.averageRating >= 4.5
                          ? "default"
                          : stats.averageRating >= 4.0
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {stats.averageRating >= 4.5
                        ? "Excellent"
                        : stats.averageRating >= 4.0
                        ? "Good"
                        : "Average"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Feedbacks
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {stats.totalCount}
                      </p>
                    </div>
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Response Rate
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {stats.totalCount
                          ? Math.round(
                              (stats.respondedCount / stats.totalCount) * 100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Satisfaction Score
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {stats.ratingDistribution
                          ? Math.round(
                              ((Number(stats.ratingDistribution["4"] || 0) +
                                Number(stats.ratingDistribution["5"] || 0)) /
                                stats.totalCount) *
                                100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                    <ThumbsUp className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">AI Summary</TabsTrigger>
              <TabsTrigger value="trends">Key Trends</TabsTrigger>
              <TabsTrigger value="insights">Management Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Guest Feedback Summary</CardTitle>
                  <CardDescription>
                    {summaryData
                      ? `Based on ${summaryData.basedOn} feedbacks from ${
                          summaryData.period
                        }. 
                   Generated ${format(summaryData.generatedAt, "PPpp")}`
                      : "AI-generated summary of guest feedback"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <>
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-[90%] mb-4" />
                      <Skeleton className="h-4 w-[95%] mb-4" />
                      <Skeleton className="h-4 w-[85%] mb-4" />
                      <Skeleton className="h-4 w-[90%]" />
                    </>
                  ) : summary ? (
                    <div className="prose max-w-none">
                      <p className="text-lg whitespace-pre-line">{summary}</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">
                        No feedback summary yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                        Generate a smart summary of recent guest feedback to
                        understand common themes and areas for improvement
                      </p>
                      <Button
                        onClick={handleGenerateSummary}
                        disabled={generating}
                      >
                        {generating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating Summary...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Summary
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Rating Trend</CardTitle>
                    <CardDescription>
                      Recent vs. previous 30-day average rating
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-4 w-[80%]" />
                      </div>
                    ) : trends ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              7-Day Average
                            </p>
                            <p className="text-3xl font-bold">
                              {trends.overallRecent.toFixed(1)}
                            </p>
                          </div>
                          <div className="text-xl font-bold">vs</div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              30-Day Average
                            </p>
                            <p className="text-3xl font-bold">
                              {trends.overallMonth.toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Change
                            </p>
                            <div
                              className={`flex items-center ${
                                trends.overallChange > 0
                                  ? "text-green-500"
                                  : trends.overallChange < 0
                                  ? "text-red-500"
                                  : "text-yellow-500"
                              }`}
                            >
                              <p className="text-2xl font-bold">
                                {trends.overallChange > 0 ? "+" : ""}
                                {trends.overallChange.toFixed(1)}
                              </p>
                              {getTrendIndicator(trends.overallChange).icon}
                            </div>
                          </div>
                        </div>

                        {isSignificantChange(trends.overallChange) && (
                          <Alert
                            variant={
                              trends.overallChange > 0
                                ? "default"
                                : "destructive"
                            }
                          >
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>
                              {trends.overallChange > 0
                                ? "Significant Improvement"
                                : "Significant Decline"}
                            </AlertTitle>
                            <AlertDescription>
                              {trends.overallChange > 0
                                ? "Recent ratings show a notable improvement. This positive trend suggests that recent changes are being well-received by guests."
                                : "Recent ratings show a concerning decline. Immediate attention may be required to address emerging issues."}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          No trend data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Rating Trends</CardTitle>
                    <CardDescription>
                      Changes in category ratings over the last 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-8 w-full mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-8 w-full mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ) : trends && trends.categories ? (
                      <div className="space-y-6">
                        {Object.entries(trends.categories).map(
                          ([category, data]: [string, any]) => (
                            <div key={category} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <p className="font-medium">{category}</p>
                                <div
                                  className={`flex items-center ${
                                    data.change > 0
                                      ? "text-green-500"
                                      : data.change < 0
                                      ? "text-red-500"
                                      : "text-yellow-500"
                                  }`}
                                >
                                  <p className="text-sm font-medium mr-1">
                                    {data.recent.toFixed(1)}
                                    {data.change > 0
                                      ? " ↑"
                                      : data.change < 0
                                      ? " ↓"
                                      : " →"}
                                  </p>
                                  <p className="text-xs">
                                    ({data.change > 0 ? "+" : ""}
                                    {data.change.toFixed(1)})
                                  </p>
                                </div>
                              </div>
                              <Progress
                                value={data.recent * 20}
                                className={`h-2 ${
                                  data.change > 0
                                    ? "bg-green-100"
                                    : data.change < 0
                                    ? "bg-red-100"
                                    : ""
                                }`}
                              />
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          No category trend data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Rating Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of ratings in the last 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-full mb-2" />
                        <Skeleton className="h-8 w-full mb-2" />
                        <Skeleton className="h-8 w-full mb-2" />
                        <Skeleton className="h-8 w-full mb-2" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ) : stats && stats.ratingDistribution ? (
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = Number(
                            stats.ratingDistribution[rating.toString()] || 0
                          );
                          const percentage = stats.totalCount
                            ? Math.round((count / stats.totalCount) * 100)
                            : 0;

                          return (
                            <div
                              key={rating}
                              className="flex flex-col items-center"
                            >
                              <div className="flex items-center mb-2">
                                <p className="text-lg font-bold mr-1">
                                  {rating}
                                </p>
                                <Star
                                  className={`h-5 w-5 ${
                                    rating >= 4
                                      ? "text-yellow-500 fill-yellow-500"
                                      : rating === 3
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-400 fill-gray-400"
                                  }`}
                                />
                              </div>
                              <div className="w-full bg-muted rounded-full h-24 md:h-40 relative">
                                <div
                                  className={`absolute bottom-0 w-full rounded-b-full ${
                                    rating >= 4
                                      ? "bg-green-500"
                                      : rating === 3
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ height: `${percentage}%` }}
                                ></div>
                              </div>
                              <p className="mt-2 font-medium">{percentage}%</p>
                              <p className="text-xs text-muted-foreground">
                                ({count} reviews)
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          No rating distribution data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ThumbsUp className="h-5 w-5 mr-2 text-green-500" />
                      Top Strengths
                    </CardTitle>
                    <CardDescription>
                      Areas where guests consistently provide positive feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-[90%] mb-2" />
                        <Skeleton className="h-4 w-[85%]" />
                      </div>
                    ) : insights?.topStrengths ||
                      defaultInsights.topStrengths ? (
                      <ul className="space-y-3">
                        {(
                          insights?.topStrengths || defaultInsights.topStrengths
                        ).map((strength: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <Badge className="mr-2 bg-green-500 mt-0.5">
                              {index + 1}
                            </Badge>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          No strengths data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ThumbsDown className="h-5 w-5 mr-2 text-red-500" />
                      Areas for Improvement
                    </CardTitle>
                    <CardDescription>
                      Common issues mentioned in guest feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-[90%] mb-2" />
                        <Skeleton className="h-4 w-[85%]" />
                      </div>
                    ) : insights?.topImprovements ||
                      defaultInsights.topImprovements ? (
                      <ul className="space-y-3">
                        {(
                          insights?.topImprovements ||
                          defaultInsights.topImprovements
                        ).map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <Badge
                              variant="destructive"
                              className="mr-2 mt-0.5"
                            >
                              {index + 1}
                            </Badge>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          No improvement data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      Actionable Recommendations
                    </CardTitle>
                    <CardDescription>
                      AI-generated suggestions based on feedback analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-[90%] mb-2" />
                        <Skeleton className="h-4 w-[85%]" />
                      </div>
                    ) : insights?.actionableItems ||
                      defaultInsights.actionableItems ? (
                      <ul className="space-y-3">
                        {(
                          insights?.actionableItems ||
                          defaultInsights.actionableItems
                        ).map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">
                              {index + 1}
                            </div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          No recommendations available
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate New Recommendations
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-blue-500" />
                      Competitive Analysis
                    </CardTitle>
                    <CardDescription>
                      How Kuriftu Resort compares to competitors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-[90%] mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-[85%]" />
                      </div>
                    ) : insights?.competitiveInsights ||
                      defaultInsights.competitiveInsights ? (
                      <div className="space-y-4">
                        <p className="text-sm">
                          {insights?.competitiveInsights ||
                            defaultInsights.competitiveInsights}
                        </p>

                        <div className="pt-2">
                          <p className="text-sm font-medium mb-2">
                            Competitive Position
                          </p>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Service Quality</span>
                                <span className="font-medium">Leading</span>
                              </div>
                              <Progress value={85} className="h-2" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Ambiance & Facilities</span>
                                <span className="font-medium">Strong</span>
                              </div>
                              <Progress value={78} className="h-2" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Value for Money</span>
                                <span className="font-medium">Average</span>
                              </div>
                              <Progress value={62} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          No competitive analysis available
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Detailed Comparison
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
