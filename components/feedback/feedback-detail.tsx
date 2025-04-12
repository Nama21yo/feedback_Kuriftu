"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Feedback } from "@/lib/types";
import {
  getFeedbackById,
  updateFeedback,
  respondToFeedback,
  deleteFeedback,
} from "@/lib/firebase-service";
import { formatDate } from "@/lib/utils";
import { StarRating } from "@/components/feedback/star-rating";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash } from "lucide-react";

interface FeedbackDetailProps {
  id: string;
  onBack: () => void;
}

export function FeedbackDetail({ id, onBack }: FeedbackDetailProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<"pending" | "reviewed" | "responded">(
    "pending"
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const data = await getFeedbackById(id);
        if (data) {
          setFeedback(data);
          setStatus(data.status);
          setResponse(data.response || "");
        }
      } catch (error) {
        console.error("Error loading feedback:", error);
        toast({
          title: "Error",
          description: "Failed to load feedback details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [id]);

  const handleStatusChange = async () => {
    if (!feedback) return;

    setSubmitting(true);
    try {
      await updateFeedback(feedback.id, { status });
      toast({
        title: "Status updated",
        description: "Feedback status has been updated successfully",
      });
      setFeedback({ ...feedback, status });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update feedback status",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async () => {
    if (!feedback || !response.trim()) return;

    setSubmitting(true);
    try {
      await respondToFeedback(feedback.id, response);
      toast({
        title: "Response sent",
        description: "Your response has been saved successfully",
      });
      setFeedback({
        ...feedback,
        response,
        status: "responded",
        responseDate: new Date(),
      });
      setStatus("responded");
    } catch (error) {
      console.error("Error sending response:", error);
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!feedback) return;

    try {
      await deleteFeedback(feedback.id);
      toast({
        title: "Feedback deleted",
        description: "Feedback has been deleted successfully",
      });
      router.push("/dashboard/feedbacks");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to delete feedback",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 md:ml-64">
        Loading...
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="space-y-6 md:ml-64">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Feedback not found
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:ml-64">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feedbacks
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash className="mr-2 h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                feedback from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Feedback Details</CardTitle>
              <CardDescription>
                View and respond to this feedback
              </CardDescription>
            </div>
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
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium mb-2">User Information</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Name:</span>{" "}
                  {feedback.userName || "Not provided"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span>{" "}
                  {feedback.userEmail || "Not provided"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Submitted:</span>{" "}
                  {formatDate(feedback.createdAt)}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Feedback Information</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Rating:</span>
                  <StarRating rating={feedback.rating} />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Category:</span>{" "}
                  {feedback.category}
                </p>
                <p className="text-sm">
                  <span className="font-medium">ID:</span> {feedback.id}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Feedback Comment</h3>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm whitespace-pre-line">{feedback.comment}</p>
            </div>
          </div>

          {feedback.response && (
            <div>
              <h3 className="text-sm font-medium mb-2">Response</h3>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-line">
                  {feedback.response}
                </p>
                {feedback.responseDate && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Responded on {formatDate(feedback.responseDate)}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Update Status</h3>
            <div className="flex gap-2">
              <Select
                value={status}
                onValueChange={(value: "pending" | "reviewed" | "responded") =>
                  setStatus(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusChange}
                disabled={submitting || status === feedback.status}
              >
                Update Status
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Send Response</h3>
            <Textarea
              placeholder="Type your response here..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={5}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleRespond}
            disabled={submitting || !response.trim()}
          >
            Send Response
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
