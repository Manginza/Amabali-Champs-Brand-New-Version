"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star, BookMarked, ThumbsUp } from "lucide-react";
import { formatCurrency, generateSessionId, BookReview } from "@/lib/reading-gym";
import { toast } from "sonner";

interface RecentReviewsProps {
  refreshTrigger?: number;
  limit?: number;
}

export function RecentReviews({ refreshTrigger, limit = 5 }: RecentReviewsProps) {
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    setSessionId(generateSessionId());
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("book_reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data) {
        setReviews(data);
      }
      setIsLoading(false);
    };

    fetchReviews();

    // Subscribe to real-time updates
    const supabase = createClient();
    const channel = supabase
      .channel("reviews-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "book_reviews",
        },
        (payload) => {
          const newReview = payload.new as BookReview;
          if (newReview.is_approved) {
            setReviews((prev) => [newReview, ...prev.slice(0, limit - 1)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshTrigger, limit]);

  const handleRate = async (reviewId: string, rating: number) => {
    if (ratedIds.has(reviewId)) {
      toast.info("You have already rated this review");
      return;
    }

    const supabase = createClient();
    
    // Insert rating
    const { error } = await supabase.from("external_ratings").insert({
      session_id: sessionId,
      target_id: reviewId,
      target_type: "review",
      rating,
    });

    if (error) {
      if (error.code === "23505") {
        toast.info("You have already rated this review");
        setRatedIds((prev) => new Set(prev).add(reviewId));
      } else {
        toast.error("Failed to submit rating");
      }
      return;
    }

    // Update local state
    setRatedIds((prev) => new Set(prev).add(reviewId));

    // Fetch updated average and update the review
    const { data: ratings } = await supabase
      .from("external_ratings")
      .select("rating")
      .eq("target_id", reviewId);

    if (ratings && ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      
      await supabase
        .from("book_reviews")
        .update({
          avg_external_rating: avgRating,
          external_rating_count: ratings.length,
        })
        .eq("id", reviewId);

      // Update local state
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, avg_external_rating: avgRating, external_rating_count: ratings.length }
            : r
        )
      );
    }

    toast.success("Thanks for rating!");
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 font-display text-xl">
          <BookMarked className="h-5 w-5 text-primary" />
          Recent Reviews
        </CardTitle>
        <CardDescription>Latest submissions from readers - rate them!</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2 rounded-lg bg-muted/50 p-4">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-3/4 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No reviews yet. Be the first to submit!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{review.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.school && `${review.school} `}
                      {review.grade && `Grade ${review.grade}`}
                      {!review.school && !review.grade && review.language}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold text-primary">
                      +{formatCurrency(review.earnings_cents)}
                    </p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.star_rating
                              ? "fill-accent text-accent"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mb-1 font-medium">{review.book_title}</p>
                {review.book_author && (
                  <p className="mb-2 text-xs text-muted-foreground">
                    by {review.book_author}
                  </p>
                )}
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {review.content}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {review.word_count} words
                  </p>
                  <div className="flex items-center gap-2">
                    {review.external_rating_count > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        {review.avg_external_rating.toFixed(1)} ({review.external_rating_count})
                      </span>
                    )}
                    {!ratedIds.has(review.id) && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleRate(review.id, rating)}
                            className="rounded p-1 transition-colors hover:bg-muted"
                            aria-label={`Rate ${rating} stars`}
                          >
                            <Star className="h-4 w-4 text-muted-foreground hover:fill-accent hover:text-accent" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
