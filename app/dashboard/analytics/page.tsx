// app/dashboard/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getFeedbackStats } from "@/lib/firebase-service";
import { detectRatingTrends, generateFeedbackSummary } from "@/lib/ai-service";
import { toast } from "sonner";
import { FeedbackStats } from "@/lib/types";
import {
  ChevronDown,
  ChevronUp,
  BarChart3,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [trends, setTrends] = useState<any | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [generatingInsight, setGeneratingInsight] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const feedbackStats = await getFeedbackStats();
        setStats(feedbackStats);

        const ratingTrends = await detectRatingTrends();
        setTrends(ratingTrends);

        setLoading(false);
      } catch (error) {
        console.error("Error loading analytics data:", error);
        toast.error("Failed to load analytics data");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const feedbackStats = await getFeedbackStats();
      setStats(feedbackStats);

      const ratingTrends = await detectRatingTrends();
      setTrends(ratingTrends);

      toast.success("Analytics data refreshed");
    } catch (error) {
      console.error("Error refreshing analytics data:", error);
      toast.error("Failed to refresh analytics data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleGenerateInsight = async () => {
    setGeneratingInsight(true);
    try {
      const feedbackSummary = await generateFeedbackSummary();
      setSummary(feedbackSummary);
      setShowInsight(true);
    } catch (error) {
      console.error("Error generating feedback summary:", error);
      toast.error("Failed to generate AI insights");
    } finally {
      setGeneratingInsight(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Prepare data for pie chart
  const categoryData = stats
    ? Object.entries(stats.categoryBreakdown).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  // Prepare data for rating distribution chart
  const ratingData = stats
    ? Object.entries(stats.ratingDistribution).map(([rating, count]) => ({
        rating,
        count,
      }))
    : [];

  // Prepare category trends data
  const categoryTrendData = trends?.categoryTrends
    ? Object.entries(trends.categoryTrends)
        .map(([category, data]: [string, any]) => ({
          category,
          recent: parseFloat(data.recent.toFixed(1)),
          month: parseFloat(data.month.toFixed(1)),
          change: parseFloat(data.change.toFixed(1)),
        }))
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    : [];

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6 md:ml-64">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Kuriftu Resort AI Analytics</h1>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh Data
              </Button>
              <Button
                onClick={handleGenerateInsight}
                disabled={generatingInsight}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate AI Insights
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Overall Rating</CardTitle>
                <CardDescription>Average guest satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-4xl font-bold">
                    {stats?.averageRating.toFixed(1)}/5
                  </div>
                  {trends && (
                    <div
                      className={`flex items-center ${
                        trends.overallChange > 0
                          ? "text-green-500"
                          : trends.overallChange < 0
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {trends.overallChange > 0 ? (
                        <ChevronUp className="h-5 w-5 mr-1" />
                      ) : trends.overallChange < 0 ? (
                        <ChevronDown className="h-5 w-5 mr-1" />
                      ) : null}
                      <span>{Math.abs(trends.overallChange).toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {stats?.totalCount} feedbacks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Pending Responses</CardTitle>
                <CardDescription>Feedbacks awaiting response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats?.pendingCount}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats?.respondedCount} feedbacks already responded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Top Category</CardTitle>
                <CardDescription>Most frequently mentioned</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 && (
                  <>
                    <div className="text-2xl font-bold">
                      {categoryData.sort((a, b) => b.value - a.value)[0]?.name}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {categoryData.sort((a, b) => b.value - a.value)[0]?.value}{" "}
                      mentions
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="trends">
            <TabsList className="mb-4">
              <TabsTrigger value="trends">Rating Trends</TabsTrigger>
              <TabsTrigger value="categories">Category Analysis</TabsTrigger>
              <TabsTrigger value="distribution">
                Rating Distribution
              </TabsTrigger>
              <TabsTrigger value="ai-analysis">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Guest Satisfaction Trends</CardTitle>
                  <CardDescription>
                    Daily average ratings over the past 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {stats?.trendsData && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={stats.trendsData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 50,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis domain={[0, 5]} />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="averageRating"
                            name="Average Rating"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            name="Feedback Count"
                            stroke="#82ca9d"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback by Category</CardTitle>
                    <CardDescription>
                      Distribution of feedback across resort areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [
                              `${value} feedbacks`,
                              name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Rating Changes</CardTitle>
                    <CardDescription>
                      Comparing 7-day vs 30-day average ratings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categoryTrendData}
                          layout="vertical"
                          margin={{
                            top: 20,
                            right: 30,
                            left: 100,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 5]} />
                          <YAxis
                            dataKey="category"
                            type="category"
                            width={100}
                          />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="recent"
                            name="Recent (7 days)"
                            fill="#82ca9d"
                          />
                          <Bar
                            dataKey="month"
                            name="Monthly (30 days)"
                            fill="#8884d8"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="distribution">
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of ratings from 1 to 5 stars
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={ratingData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="count"
                          name="Number of Ratings"
                          fill="#8884d8"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-analysis">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Insights</CardTitle>
                  <CardDescription>
                    Smart analysis of recent guest feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {summary ? (
                    <div className="prose max-w-none">
                      <p className="mb-4 text-lg">{summary}</p>
                      <Button
                        onClick={() => handleGenerateInsight()}
                        disabled={generatingInsight}
                      >
                        <RefreshCw
                          className={`h-4 w-4 mr-2 ${
                            generatingInsight ? "animate-spin" : ""
                          }`}
                        />
                        Regenerate Insights
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">
                        No AI insights generated yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Generate insights to get AI-powered analysis of your
                        guest feedback
                      </p>
                      <Button
                        onClick={handleGenerateInsight}
                        disabled={generatingInsight}
                      >
                        {generatingInsight ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Generate Insights
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <AlertDialog open={showInsight} onOpenChange={setShowInsight}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>AI Feedback Insights</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p className="text-lg font-medium">
                    Key Takeaways from Recent Feedback
                  </p>
                  <p>{summary}</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Close</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardLayout>
    </>
  );
}
