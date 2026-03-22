"use client";

import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, use } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Star,
  User,
  School,
  Calendar,
  ArrowLeft,
  MessageSquare,
  Send,
} from "lucide-react";
import Link from "next/link";

interface Story {
  id: string;
  title: string;
  content: string;
  author_name: string;
  school: string | null;
  grade: number | null;
  category: string;
  word_count: number;
  avg_external_rating: number;
  external_rating_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  commenter_name: string | null;
  created_at: string;
}

export default function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commenterName, setCommenterName] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      const supabase = createClient();

      // Fetch story
      const { data: storyData, error: storyError } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();

      if (!storyError && storyData) {
        setStory(storyData);
      }

      // Fetch comments
      const { data: commentsData } = await supabase
        .from("story_comments")
        .select("*")
        .eq("story_id", id)
        .eq("approval_status", "approved")
        .order("created_at", { ascending: false });

      if (commentsData) {
        setComments(commentsData);
      }

      // Check if user has rated (using session ID)
      const sessionId = localStorage.getItem("visitor_session") || crypto.randomUUID();
      localStorage.setItem("visitor_session", sessionId);

      const { data: ratingData } = await supabase
        .from("external_ratings")
        .select("rating")
        .eq("session_id", sessionId)
        .eq("target_id", id)
        .single();

      if (ratingData) {
        setUserRating(ratingData.rating);
        setHasRated(true);
      }

      setIsLoading(false);
    };

    fetchStory();
  }, [id]);

  const handleRate = async (rating: number) => {
    if (hasRated) return;

    const sessionId = localStorage.getItem("visitor_session") || crypto.randomUUID();
    localStorage.setItem("visitor_session", sessionId);

    const supabase = createClient();

    try {
      const { error } = await supabase.from("external_ratings").insert({
        session_id: sessionId,
        target_id: id,
        target_type: "story",
        rating,
      });

      if (error) throw error;

      // Update local state
      setUserRating(rating);
      setHasRated(true);

      // Update story rating
      if (story) {
        const newCount = story.external_rating_count + 1;
        const newAvg =
          (story.avg_external_rating * story.external_rating_count + rating) /
          newCount;

        await supabase
          .from("stories")
          .update({
            avg_external_rating: newAvg,
            external_rating_count: newCount,
          })
          .eq("id", id);

        setStory({
          ...story,
          avg_external_rating: newAvg,
          external_rating_count: newCount,
        });
      }

      toast.success("Thank you for rating!");
    } catch (error) {
      console.error("Error rating:", error);
      toast.error("Failed to submit rating");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    const sessionId = localStorage.getItem("visitor_session") || crypto.randomUUID();
    localStorage.setItem("visitor_session", sessionId);

    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("story_comments")
        .insert({
          session_id: sessionId,
          story_id: id,
          content: newComment.trim(),
          commenter_name: commenterName.trim() || "Anonymous",
          approval_status: "approved",
        })
        .select()
        .single();

      if (error) throw error;

      setComments([data, ...comments]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-3/4 rounded bg-slate-700" />
            <div className="h-4 w-1/2 rounded bg-slate-700" />
            <div className="mt-8 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-slate-700" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-600" />
          <h1 className="mt-4 font-display text-2xl font-bold text-white">
            Story not found
          </h1>
          <Link href="/stories">
            <Button className="mt-4">Back to Stories</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Back Link */}
        <Link
          href="/stories"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stories
        </Link>

        {/* Story Card */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="mb-2 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">
                  {story.category}
                </span>
                <h1 className="font-display text-2xl font-bold text-white md:text-3xl">
                  {story.title}
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {story.author_name}
              </span>
              {story.school && (
                <span className="flex items-center gap-1">
                  <School className="h-4 w-4" />
                  {story.school}
                </span>
              )}
              {story.grade && <span>Grade {story.grade}</span>}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(story.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Story Content */}
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                {story.content}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 border-t border-slate-700 pt-4 text-sm text-slate-400">
              <span>{story.word_count} words</span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                {story.avg_external_rating > 0
                  ? `${story.avg_external_rating.toFixed(1)} (${story.external_rating_count} ratings)`
                  : "No ratings yet"}
              </span>
            </div>

            {/* Rating */}
            <div className="rounded-lg border border-slate-700 bg-slate-700/50 p-4">
              <p className="mb-2 text-sm font-medium text-white">
                {hasRated ? "Your rating" : "Rate this story"}
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => !hasRated && setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={hasRated}
                    className={`transition-transform ${!hasRated && "hover:scale-110"}`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || userRating)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-slate-500"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          <Card className="mb-6 border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <Input
                  placeholder="Your name (optional)"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                />
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                />
                <Button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-slate-600" />
              <p className="mt-2 text-slate-400">No comments yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="border-slate-700 bg-slate-800">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">
                        {comment.commenter_name || "Anonymous"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-slate-300">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
