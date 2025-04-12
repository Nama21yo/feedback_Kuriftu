// app/dashboard/feedbacks/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Search,
  Star,
  RefreshCw,
  Bot,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Feedback } from "@/lib/types";
import {
  getAllFeedbacks,
  getFeedbackById,
  respondToFeedback,
} from "@/lib/firebase-service";
import {
  analyzeAndRespondToFeedback,
  saveAIResponse,
  generateLocalizedResponse,
} from "@/lib/ai-service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [responseText, setResponseText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  async function loadFeedbacks() {
    setIsLoading(true);
    try {
      const data = await getAllFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error("Error loading feedbacks:", error);
      toast.error("Failed to load feedbacks");
    } finally {
      setIsLoading(false);
    }
  }

  const statusColorMap: Record<string, string> = {
    pending: "bg-yellow-500",
    responded: "bg-green-500",
    reviewed: "bg-blue-500",
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    // Apply status filter
    if (filterStatus !== "all" && feedback.status !== filterStatus) {
      return false;
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        feedback.comment?.toLowerCase().includes(query) ||
        feedback.userName?.toLowerCase().includes(query) ||
        feedback.userEmail?.toLowerCase().includes(query) ||
        feedback.category?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setTimeout(() => setSearching(false), 500); // Simulate search
  };

  const handleGenerateResponse = async () => {
    if (!selectedFeedback) return;

    setIsGeneratingResponse(true);
    try {
      const result = await analyzeAndRespondToFeedback(selectedFeedback);
      setResponseText(result.suggestedResponse);
      setAiAnalysis(result);
      toast.success("AI response generated");
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast.error("Failed to generate AI response");
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleGenerateLocalizedResponse = async () => {
    if (!selectedFeedback) return;

    setIsGeneratingResponse(true);
    try {
      const localizedResponse = await generateLocalizedResponse(
        selectedFeedback,
        selectedLanguage as "English" | "Amharic" | "French" | "Arabic"
      );
      setResponseText(localizedResponse);
      toast.success(`Response translated to ${selectedLanguage}`);
    } catch (error) {
      console.error("Error generating localized response:", error);
      toast.error("Failed to translate response");
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !responseText) return;

    try {
      if (aiAnalysis) {
        await saveAIResponse(selectedFeedback.id, {
          ...aiAnalysis,
          suggestedResponse: responseText,
        });
      } else {
        await respondToFeedback(selectedFeedback.id, responseText);
      }

      toast.success("Response sent successfully");

      // Update feedbacks list
      const updatedFeedback = await getFeedbackById(selectedFeedback.id);
      if (updatedFeedback) {
        setFeedbacks(
          feedbacks.map((f) =>
            f.id === updatedFeedback.id ? updatedFeedback : f
          )
        );
      }

      setDialogOpen(false);
      setResponseText("");
      setAiAnalysis(null);
    } catch (error) {
      console.error("Error sending response:", error);
      toast.error("Failed to send response");
    }
  };

  const handleOpenFeedbackDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || "");
    setDialogOpen(true);
    setAiAnalysis(null);
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6 md:ml-64">
          <h1 className="text-3xl font-bold mb-6">
            Kuriftu Resort Feedback Management
          </h1>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search feedbacks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={loadFeedbacks}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Guest Feedbacks</CardTitle>
                <CardDescription>
                  {filteredFeedbacks.length} feedbacks found
                  {filterStatus !== "all" && ` with status "${filterStatus}"`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Comment
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedbacks.length > 0 ? (
                      filteredFeedbacks.map((feedback) => (
                        <TableRow key={feedback.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {feedback.userName?.[0] || "G"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {feedback.userName || "Guest"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {feedback.userEmail || "Anonymous"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {renderStars(feedback.rating)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{feedback.category}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="truncate max-w-[250px]">
                              {feedback.comment}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColorMap[feedback.status]}>
                              {feedback.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDistanceToNow(feedback.createdAt, {
                              addSuffix: true,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenFeedbackDialog(feedback)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              {feedback.status === "pending"
                                ? "Respond"
                                : "View"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p>No feedbacks found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {selectedFeedback && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Guest Feedback</DialogTitle>
                  <DialogDescription>
                    Review and respond to guest feedback
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="response">Response</TabsTrigger>
                    {aiAnalysis && (
                      <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="details">
                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg">
                            {selectedFeedback.userName?.[0] || "G"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {selectedFeedback.userName || "Anonymous Guest"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedFeedback.userEmail || "No email provided"}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <Badge
                            className={statusColorMap[selectedFeedback.status]}
                          >
                            {selectedFeedback.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">
                            Rating
                          </Label>
                          <div className="flex items-center mt-1">
                            {renderStars(selectedFeedback.rating)}
                            <span className="ml-2 font-medium">
                              {selectedFeedback.rating}/5
                            </span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">
                            Category
                          </Label>
                          <p className="mt-1 font-medium">
                            {selectedFeedback.category}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Date</Label>
                          <p className="mt-1">
                            {selectedFeedback.createdAt.toLocaleDateString()} at{" "}
                            {selectedFeedback.createdAt.toLocaleTimeString()}
                          </p>
                        </div>
                        {selectedFeedback.responseDate && (
                          <div>
                            <Label className="text-muted-foreground">
                              Response Date
                            </Label>
                            <p className="mt-1">
                              {selectedFeedback.responseDate.toLocaleDateString()}{" "}
                              at{" "}
                              {selectedFeedback.responseDate.toLocaleTimeString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="text-muted-foreground">Comment</Label>
                        <div className="mt-1 p-4 bg-muted rounded-md">
                          <p>{selectedFeedback.comment}</p>
                        </div>
                      </div>

                      {selectedFeedback.response && (
                        <div>
                          <Label className="text-muted-foreground">
                            Response
                          </Label>
                          <div className="mt-1 p-4 bg-muted rounded-md">
                            <p>{selectedFeedback.response}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="response">
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="response"
                          className="text-lg font-medium"
                        >
                          Your Response
                        </Label>
                        <div className="flex space-x-2">
                          <Select
                            value={selectedLanguage}
                            onValueChange={setSelectedLanguage}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Amharic">Amharic</SelectItem>
                              <SelectItem value="French">French</SelectItem>
                              <SelectItem value="Arabic">Arabic</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="outline"
                            onClick={handleGenerateResponse}
                            disabled={isGeneratingResponse}
                          >
                            {isGeneratingResponse ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Bot className="h-4 w-4 mr-2" />
                                Generate Response
                              </>
                            )}
                          </Button>

                          {selectedLanguage !== "English" && (
                            <Button
                              variant="outline"
                              onClick={handleGenerateLocalizedResponse}
                              disabled={isGeneratingResponse || !responseText}
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              Translate
                            </Button>
                          )}
                        </div>
                      </div>

                      <Textarea
                        id="response"
                        placeholder="Enter your response to the guest feedback..."
                        rows={8}
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  {aiAnalysis && (
                    <TabsContent value="analysis">
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle>Sentiment Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-4 flex-1 rounded-full ${
                                    aiAnalysis.sentimentScore > 0
                                      ? "bg-gradient-to-r from-yellow-400 to-green-500"
                                      : "bg-gradient-to-r from-red-500 to-yellow-400"
                                  }`}
                                  style={{
                                    background:
                                      aiAnalysis.sentimentScore > 0
                                        ? `linear-gradient(to right, #FBBF24 0%, #10B981 ${
                                            (aiAnalysis.sentimentScore / 10) *
                                            100
                                          }%)`
                                        : `linear-gradient(to right, #EF4444 ${
                                            (Math.abs(
                                              aiAnalysis.sentimentScore
                                            ) /
                                              10) *
                                            100
                                          }%, #FBBF24 100%)`,
                                  }}
                                />
                                <span className="font-medium">
                                  {aiAnalysis.sentimentScore > 7
                                    ? "Very Positive"
                                    : aiAnalysis.sentimentScore > 3
                                    ? "Positive"
                                    : aiAnalysis.sentimentScore > 0
                                    ? "Slightly Positive"
                                    : aiAnalysis.sentimentScore > -3
                                    ? "Slightly Negative"
                                    : aiAnalysis.sentimentScore > -7
                                    ? "Negative"
                                    : "Very Negative"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Sentiment score: {aiAnalysis.sentimentScore}
                              </p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle>Top Issues</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {aiAnalysis.topIssues.length > 0 ? (
                                <ul className="space-y-2">
                                  {aiAnalysis.topIssues.map(
                                    (issue: string, index: number) => (
                                      <li
                                        key={index}
                                        className="flex items-start gap-2"
                                      >
                                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                        <span>{issue}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground">
                                  No major issues detected
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle>Recommended Actions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {aiAnalysis.recommendedActions.length > 0 ? (
                              <ul className="space-y-2">
                                {aiAnalysis.recommendedActions.map(
                                  (action: string, index: number) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2"
                                    >
                                      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                        {index + 1}
                                      </div>
                                      <span>{action}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="text-muted-foreground">
                                No specific actions recommended
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={!responseText}
                  >
                    Send Response
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
