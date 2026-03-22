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
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/reading-gym";

interface LeaderboardEntry {
  learner_id: string;
  learner_name: string;
  avatar_emoji: string;
  review_count: number;
  total_words: number;
  total_earnings: number;
}

interface LeaderboardProps {
  sessionId: string | null;
  refreshTrigger?: number;
}

export function Leaderboard({ sessionId, refreshTrigger }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reading_gym_reviews")
        .select("learner_id, learner_name, avatar_emoji, word_count, earnings_cents")
        .eq("session_id", sessionId)
        .eq("is_approved", true);

      if (!error && data) {
        // Aggregate by learner
        const leaderboardMap = new Map<string, LeaderboardEntry>();
        for (const review of data) {
          const existing = leaderboardMap.get(review.learner_id);
          if (existing) {
            existing.review_count++;
            existing.total_words += review.word_count;
            existing.total_earnings += review.earnings_cents;
          } else {
            leaderboardMap.set(review.learner_id, {
              learner_id: review.learner_id,
              learner_name: review.learner_name,
              avatar_emoji: review.avatar_emoji,
              review_count: 1,
              total_words: review.word_count,
              total_earnings: review.earnings_cents,
            });
          }
        }
        const sorted = Array.from(leaderboardMap.values())
          .sort((a, b) => b.total_earnings - a.total_earnings)
          .slice(0, 10);
        setEntries(sorted);
      }
      setIsLoading(false);
    };

    fetchLeaderboard();

    // Subscribe to real-time updates
    const supabase = createClient();
    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reading_gym_reviews",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, refreshTrigger]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-bold">
            {index + 1}
          </span>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 font-display text-xl">
          <TrendingUp className="h-5 w-5 text-primary" />
          Live Leaderboard
        </CardTitle>
        <CardDescription>Top readers in this session</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 rounded-lg bg-muted/50 p-3"
              >
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {sessionId
                ? "No reviews yet. Be the first!"
                : "Waiting for a session to start..."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={entry.learner_id}
                className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                  index === 0
                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <div className="flex-shrink-0">{getRankIcon(index)}</div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl">
                  {entry.avatar_emoji || "📚"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{entry.learner_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.review_count} review{entry.review_count !== 1 && "s"}{" "}
                    &middot; {entry.total_words} words
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-primary">
                    {formatCurrency(entry.total_earnings)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
