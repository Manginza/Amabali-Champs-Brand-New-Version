"use client";

import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  Dumbbell,
  Trophy,
  BookOpen,
  Star,
  Users,
  Coins,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/reading-gym";

interface LeaderboardEntry {
  student_name: string;
  school: string | null;
  review_count: number;
  total_words: number;
  earnings_cents: number;
  avg_rating: number;
  quality_score: number;
}

interface Stats {
  totalReviewers: number;
  totalReviews: number;
  totalWords: number;
  totalEarnings: number;
}

export default function ReadingGymPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReviewers: 0,
    totalReviews: 0,
    totalWords: 0,
    totalEarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch leaderboard
      const { data: leaderboardData } = await supabase.rpc("get_student_leaderboard");
      if (leaderboardData) {
        setLeaderboard(leaderboardData);

        // Calculate stats
        const totalReviewers = leaderboardData.length;
        const totalReviews = leaderboardData.reduce(
          (sum: number, e: LeaderboardEntry) => sum + Number(e.review_count),
          0
        );
        const totalWords = leaderboardData.reduce(
          (sum: number, e: LeaderboardEntry) => sum + Number(e.total_words),
          0
        );
        const totalEarnings = leaderboardData.reduce(
          (sum: number, e: LeaderboardEntry) => sum + Number(e.earnings_cents),
          0
        );

        setStats({ totalReviewers, totalReviews, totalWords, totalEarnings });
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Reading Gym
          </h1>
          <p className="mt-2 text-slate-400">
            Train your reading muscles and compete with fellow readers!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="p-4 text-center">
              <Users className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 font-display text-2xl font-bold text-white">
                {stats.totalReviewers}
              </p>
              <p className="text-xs text-slate-400">Reviewers</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="p-4 text-center">
              <BookOpen className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 font-display text-2xl font-bold text-white">
                {stats.totalReviews}
              </p>
              <p className="text-xs text-slate-400">Reviews</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="p-4 text-center">
              <Star className="mx-auto h-6 w-6 text-accent" />
              <p className="mt-2 font-display text-2xl font-bold text-white">
                {stats.totalWords.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">Words Written</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="p-4 text-center">
              <Coins className="mx-auto h-6 w-6 text-accent" />
              <p className="mt-2 font-display text-2xl font-bold text-white">
                {formatCurrency(stats.totalEarnings)}
              </p>
              <p className="text-xs text-slate-400">Total Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mb-8 rounded-xl border border-primary/30 bg-primary/10 p-6 text-center">
          <h2 className="font-display text-xl font-semibold text-white">
            Ready to join the Reading Gym?
          </h2>
          <p className="mt-1 text-slate-400">
            Write book reviews and earn R0.05 per word!
          </p>
          <Link href="/write-review">
            <Button className="mt-4 gap-2">
              Start Writing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Leaderboard */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-lg bg-slate-700 p-4"
                  >
                    <div className="h-6 w-3/4 rounded bg-slate-600" />
                  </div>
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-8 text-center">
                <Trophy className="mx-auto h-12 w-12 text-slate-600" />
                <p className="mt-4 text-slate-400">
                  No reviewers yet. Be the first!
                </p>
                <Link href="/write-review">
                  <Button className="mt-4">Write a Review</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                      <th className="pb-3 pr-4">Rank</th>
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">School</th>
                      <th className="pb-3 pr-4 text-center">Reviews</th>
                      <th className="pb-3 pr-4 text-center">Words</th>
                      <th className="pb-3 pr-4 text-center">Quality</th>
                      <th className="pb-3 text-right">Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={entry.student_name}
                        className="border-b border-slate-700/50"
                      >
                        <td className="py-3 pr-4">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full font-display font-bold ${
                              index === 0
                                ? "bg-yellow-500/20 text-yellow-500"
                                : index === 1
                                  ? "bg-slate-400/20 text-slate-400"
                                  : index === 2
                                    ? "bg-amber-600/20 text-amber-600"
                                    : "bg-slate-700 text-slate-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-medium text-white">
                          {entry.student_name}
                        </td>
                        <td className="py-3 pr-4 text-slate-400">
                          {entry.school || "-"}
                        </td>
                        <td className="py-3 pr-4 text-center text-slate-300">
                          {entry.review_count}
                        </td>
                        <td className="py-3 pr-4 text-center text-slate-300">
                          {Number(entry.total_words).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-white">
                              {Number(entry.quality_score).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-right font-display font-semibold text-accent">
                          {formatCurrency(Number(entry.earnings_cents))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
