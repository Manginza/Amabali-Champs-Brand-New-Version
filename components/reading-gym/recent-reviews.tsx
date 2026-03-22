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
import { Star, BookMarked } from "lucide-react";
import { formatCurrency } from "@/lib/reading-gym";

interface Review {
  id: string;
  learner_name: string;
  avatar_emoji: string;
  book_title: string;
  book_author?: string;
  star_rating: number;
  review_text: string;
  word_count: number;
  earnings_cents: number;
  submitted_at: string;
}

interface RecentReviewsProps {
  sessionId: string | null;
  refreshTrigger?: number;
}

export function RecentReviews({ sessionId, refreshTrigger }: RecentReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setReviews([]);
      setIsLoading(false);
      return;
    }

    const fetchReviews = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reading_gym_reviews")
        .select("*")
        .eq("session_id", sessionId)
        .order("submitted_at", { ascending: false })
        .limit(5);

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
          table: "reading_gym_reviews",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setReviews((prev) => [payload.new as Review, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, refreshTrigger]);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 font-display text-xl">
          <BookMarked className="h-5 w-5 text-primary" />
          Recent Reviews
        </CardTitle>
        <CardDescription>Latest submissions from readers</CardDescription>
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
              {sessionId
                ? "No reviews yet. Be the first to submit!"
                : "Waiting for a session to start..."}
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
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{review.avatar_emoji || "📚"}</span>
                    <div>
                      <p className="font-medium">{review.learner_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.submitted_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
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
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {review.review_text}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {review.word_count} words
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
