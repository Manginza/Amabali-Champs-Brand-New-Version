"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  BookOpen,
  ArrowLeft,
  Users,
  FileText,
  Coins,
  Star,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { formatCurrency, BookReview, LeaderboardEntry } from "@/lib/reading-gym";

interface Stats {
  totalReviews: number;
  totalStudents: number;
  totalWords: number;
  totalEarnings: number;
  avgRating: number;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    totalStudents: 0,
    totalWords: 0,
    totalEarnings: 0,
    avgRating: 0,
  });
  const [recentReviews, setRecentReviews] = useState<BookReview[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);
      await fetchData();
      setIsLoading(false);
    };

    init();
  }, [router]);

  const fetchData = async () => {
    const supabase = createClient();

    // Fetch stats
    const { data: reviews } = await supabase
      .from("book_reviews")
      .select("student_name, word_count, earnings_cents, avg_external_rating")
      .eq("is_approved", true);

    if (reviews) {
      const uniqueStudents = new Set(reviews.map((r) => r.student_name.toLowerCase().trim()));
      const totalRating = reviews.reduce((sum, r) => sum + (r.avg_external_rating || 0), 0);
      const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

      setStats({
        totalReviews: reviews.length,
        totalStudents: uniqueStudents.size,
        totalWords: reviews.reduce((sum, r) => sum + r.word_count, 0),
        totalEarnings: reviews.reduce((sum, r) => sum + r.earnings_cents, 0),
        avgRating,
      });
    }

    // Fetch recent reviews
    const { data: recentData } = await supabase
      .from("book_reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (recentData) {
      setRecentReviews(recentData);
    }

    // Fetch leaderboard
    const { data: leaderboardData, error: rpcError } = await supabase.rpc("get_student_leaderboard");

    if (!rpcError && leaderboardData) {
      setLeaderboard(leaderboardData.slice(0, 10));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    toast.success("Data refreshed");
    setIsRefreshing(false);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("book_reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      toast.error("Failed to delete review");
    } else {
      toast.success("Review deleted");
      await fetchData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold">
                Admin Dashboard
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Reviews</p>
                  <p className="font-display text-2xl font-bold">{stats.totalReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Students</p>
                  <p className="font-display text-2xl font-bold">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Words</p>
                  <p className="font-display text-2xl font-bold">{stats.totalWords.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-500/10 p-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                  <p className="font-display text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <Star className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                  <p className="font-display text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Quality Leaderboard</CardTitle>
              <CardDescription>Top students by weighted quality score</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.student_name + index}
                      className={`flex items-center gap-3 rounded-lg p-3 ${
                        index === 0 ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-muted/30"
                      }`}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{entry.student_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.school || "Unknown school"} {entry.grade ? `Grade ${entry.grade}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-accent text-accent" />
                          {entry.avg_rating.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.review_count} reviews
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Recent Reviews</CardTitle>
              <CardDescription>Latest submitted reviews</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReviews.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No reviews yet</p>
              ) : (
                <div className="space-y-3">
                  {recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border bg-card p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{review.student_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {review.book_title}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{review.word_count} words</span>
                            <span>{formatCurrency(review.earnings_cents)}</span>
                            <span className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3 w-3 ${
                                    s <= review.star_rating
                                      ? "fill-accent text-accent"
                                      : "fill-muted text-muted"
                                  }`}
                                />
                              ))}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
