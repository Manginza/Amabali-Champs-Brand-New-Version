"use client";

import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Search,
  Star,
  User,
  School,
  Calendar,
  Coins,
  Trophy,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/reading-gym";

interface Review {
  id: string;
  book_title: string;
  book_author: string | null;
  student_name: string;
  school: string | null;
  grade: number | null;
  language: string;
  content: string;
  star_rating: number;
  word_count: number;
  earnings_cents: number;
  avg_external_rating: number;
  external_rating_count: number;
  created_at: string;
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  commenter_name: string | null;
  created_at: string;
}

interface LeaderboardEntry {
  student_name: string;
  school: string | null;
  review_count: number;
  total_words: number;
  earnings_cents: number;
  avg_rating: number;
  quality_score: number;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [commenterNames, setCommenterNames] = useState<Record<string, string>>({});
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from("book_reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData);
      }

      // Fetch leaderboard using the function
      const { data: leaderboardData } = await supabase.rpc("get_student_leaderboard");
      if (leaderboardData) {
        setLeaderboard(leaderboardData.slice(0, 10));
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleRateReview = async (reviewId: string, rating: number) => {
    const sessionId = localStorage.getItem("visitor_session") || crypto.randomUUID();
    localStorage.setItem("visitor_session", sessionId);

    const supabase = createClient();

    try {
      // Check if already rated
      const { data: existing } = await supabase
        .from("external_ratings")
        .select("id")
        .eq("session_id", sessionId)
        .eq("target_id", reviewId)
        .single();

      if (existing) {
        toast.error("You have already rated this review");
        return;
      }

      const { error } = await supabase.from("external_ratings").insert({
        session_id: sessionId,
        target_id: reviewId,
        target_type: "review",
        rating,
      });

      if (error) throw error;

      // Update the review's rating
      const review = reviews.find((r) => r.id === reviewId);
      if (review) {
        const newCount = review.external_rating_count + 1;
        const newAvg =
          (review.avg_external_rating * review.external_rating_count + rating) /
          newCount;

        await supabase
          .from("book_reviews")
          .update({
            avg_external_rating: newAvg,
            external_rating_count: newCount,
          })
          .eq("id", reviewId);

        setReviews(
          reviews.map((r) =>
            r.id === reviewId
              ? { ...r, avg_external_rating: newAvg, external_rating_count: newCount }
              : r
          )
        );
      }

      toast.success("Thank you for rating!");
    } catch (error) {
      console.error("Error rating:", error);
      toast.error("Failed to submit rating");
    }
  };

  const handleSubmitComment = async (reviewId: string) => {
    const content = newComments[reviewId];
    if (!content?.trim()) return;

    const sessionId = localStorage.getItem("visitor_session") || crypto.randomUUID();
    localStorage.setItem("visitor_session", sessionId);

    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("story_comments")
        .insert({
          session_id: sessionId,
          story_id: reviewId,
          content: content.trim(),
          commenter_name: commenterNames[reviewId]?.trim() || "Anonymous",
          approval_status: "approved",
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setReviews(
        reviews.map((r) =>
          r.id === reviewId
            ? { ...r, comments: [data, ...(r.comments || [])] }
            : r
        )
      );
      setNewComments({ ...newComments, [reviewId]: "" });
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    }
  };

  const filteredReviews = reviews.filter(
    (review) =>
      review.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.book_author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Book Reviews
          </h1>
          <p className="mt-2 text-slate-400">
            Read reviews from our young readers and rate them!
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                type="search"
                placeholder="Search reviews, books, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-slate-700 bg-slate-800 pl-10 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Write Review CTA */}
            <div className="mb-6 rounded-xl border border-accent/30 bg-accent/10 p-4 text-center">
              <p className="text-white">
                Want to write a review and earn rewards?
              </p>
              <Link href="/write-review">
                <Button className="mt-2 bg-accent hover:bg-accent/90">
                  Write a Review
                </Button>
              </Link>
            </div>

            {/* Reviews List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse border-slate-700 bg-slate-800">
                    <CardContent className="p-6">
                      <div className="h-6 w-3/4 rounded bg-slate-700" />
                      <div className="mt-2 h-4 w-1/2 rounded bg-slate-700" />
                      <div className="mt-4 space-y-2">
                        <div className="h-4 w-full rounded bg-slate-700" />
                        <div className="h-4 w-full rounded bg-slate-700" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredReviews.length === 0 ? (
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="p-12 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-slate-600" />
                  <h3 className="mt-4 font-display text-xl font-semibold text-white">
                    No reviews yet
                  </h3>
                  <p className="mt-2 text-slate-400">
                    Be the first to write a book review!
                  </p>
                  <Link href="/write-review">
                    <Button className="mt-4">Write Review</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className="border-slate-700 bg-slate-800">
                    <CardContent className="p-6">
                      {/* Review Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-lg font-semibold text-white">
                            {review.book_title}
                          </h3>
                          {review.book_author && (
                            <p className="text-sm text-slate-400">
                              by {review.book_author}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.star_rating
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Reviewer Info */}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {review.student_name}
                        </span>
                        {review.school && (
                          <span className="flex items-center gap-1">
                            <School className="h-3 w-3" />
                            {review.school}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-accent" />
                          {formatCurrency(review.earnings_cents)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Review Content */}
                      <p className="mt-4 text-slate-300 leading-relaxed">
                        {review.content.length > 300 && expandedReview !== review.id
                          ? `${review.content.slice(0, 300)}...`
                          : review.content}
                      </p>
                      {review.content.length > 300 && (
                        <button
                          onClick={() =>
                            setExpandedReview(
                              expandedReview === review.id ? null : review.id
                            )
                          }
                          className="mt-2 text-sm text-primary hover:underline"
                        >
                          {expandedReview === review.id
                            ? "Show less"
                            : "Read more"}
                        </button>
                      )}

                      {/* Stats & Rating */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-4">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>{review.word_count} words</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {review.avg_external_rating > 0
                              ? `${review.avg_external_rating.toFixed(1)} (${review.external_rating_count})`
                              : "Rate this"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRateReview(review.id, star)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star className="h-5 w-5 text-slate-600 hover:text-yellow-500" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment Section */}
                      <div className="mt-4 border-t border-slate-700 pt-4">
                        <button
                          onClick={() =>
                            setExpandedReview(
                              expandedReview === `comments-${review.id}`
                                ? null
                                : `comments-${review.id}`
                            )
                          }
                          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Comments
                          {expandedReview === `comments-${review.id}` ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        {expandedReview === `comments-${review.id}` && (
                          <div className="mt-4 space-y-4">
                            {/* Comment Form */}
                            <div className="space-y-2">
                              <Input
                                placeholder="Your name (optional)"
                                value={commenterNames[review.id] || ""}
                                onChange={(e) =>
                                  setCommenterNames({
                                    ...commenterNames,
                                    [review.id]: e.target.value,
                                  })
                                }
                                className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                              />
                              <div className="flex gap-2">
                                <Textarea
                                  placeholder="Write a comment..."
                                  value={newComments[review.id] || ""}
                                  onChange={(e) =>
                                    setNewComments({
                                      ...newComments,
                                      [review.id]: e.target.value,
                                    })
                                  }
                                  rows={2}
                                  className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                                />
                                <Button
                                  size="icon"
                                  onClick={() => handleSubmitComment(review.id)}
                                  disabled={!newComments[review.id]?.trim()}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Comments List */}
                            {review.comments && review.comments.length > 0 ? (
                              <div className="space-y-2">
                                {review.comments.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="rounded-lg bg-slate-700/50 p-3"
                                  >
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-medium text-white">
                                        {comment.commenter_name || "Anonymous"}
                                      </span>
                                      <span className="text-slate-500">
                                        {new Date(
                                          comment.created_at
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-300">
                                      {comment.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500">
                                No comments yet. Be the first!
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-slate-700 bg-slate-800">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setShowLeaderboard(!showLeaderboard)}
              >
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Reviewers
                  </h2>
                  {showLeaderboard ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </CardHeader>
              {showLeaderboard && (
                <CardContent>
                  {leaderboard.length === 0 ? (
                    <p className="text-sm text-slate-500">No reviewers yet</p>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard.map((entry, index) => (
                        <div
                          key={entry.student_name}
                          className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3"
                        >
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-display font-bold ${
                              index === 0
                                ? "bg-yellow-500/20 text-yellow-500"
                                : index === 1
                                  ? "bg-slate-400/20 text-slate-400"
                                  : index === 2
                                    ? "bg-amber-600/20 text-amber-600"
                                    : "bg-slate-600/20 text-slate-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-white">
                              {entry.student_name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span>{entry.review_count} reviews</span>
                              <span className="flex items-center gap-0.5">
                                <Star className="h-3 w-3 text-yellow-500" />
                                {Number(entry.quality_score).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-sm font-semibold text-accent">
                              {formatCurrency(Number(entry.earnings_cents))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
