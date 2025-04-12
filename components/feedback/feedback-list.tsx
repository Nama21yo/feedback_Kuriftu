"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Feedback } from "@/lib/types";
import { getAllFeedbacks } from "@/lib/firebase-service";
import { formatDate } from "@/lib/utils";
import { StarRating } from "@/components/feedback/star-rating";
import { FeedbackDetail } from "@/components/feedback/feedback-detail";
import { Search } from "lucide-react";

export function FeedbackList() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const data = await getAllFeedbacks();
        setFeedbacks(data);
        setFilteredFeedbacks(data);
      } catch (error) {
        console.error("Error loading feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, []);

  useEffect(() => {
    let result = [...feedbacks];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (feedback) =>
          feedback.userName?.toLowerCase().includes(term) ||
          false ||
          feedback.comment.toLowerCase().includes(term) ||
          feedback.category.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((feedback) => feedback.status === statusFilter);
    }

    // Apply rating filter
    if (ratingFilter !== "all") {
      result = result.filter(
        (feedback) => feedback.rating === Number.parseInt(ratingFilter)
      );
    }

    setFilteredFeedbacks(result);
  }, [feedbacks, searchTerm, statusFilter, ratingFilter]);

  if (selectedId) {
    return (
      <FeedbackDetail id={selectedId} onBack={() => window.history.back()} />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 md:ml-64">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6 md:ml-64">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Feedbacks</h1>
        <p className="text-muted-foreground">
          Manage and respond to user feedback
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Feedbacks</CardTitle>
          <CardDescription>
            View and manage all feedback submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search feedbacks..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No feedbacks found matching your filters
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{feedback.userName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(feedback.createdAt)}
                      </p>
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
                  <div className="mb-2">
                    <Badge variant="outline" className="mb-2">
                      {feedback.category}
                    </Badge>
                    <p className="text-sm">{feedback.comment}</p>
                  </div>
                  {feedback.response && (
                    <div className="bg-muted p-3 rounded-md mb-2">
                      <p className="text-xs font-medium mb-1">Response:</p>
                      <p className="text-sm">{feedback.response}</p>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        (window.location.href = `/dashboard/feedbacks?id=${feedback.id}`)
                      }
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
