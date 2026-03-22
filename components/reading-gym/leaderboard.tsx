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
import { Trophy, Medal, Award, TrendingUp, Star } from "lucide-react";
import { formatCurrency, LeaderboardEntry } from "@/lib/reading-gym";

interface LeaderboardProps {
  refreshTrigger?: number;
}

export function Leaderboard({ refreshTrigger }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const supabase = createClient();
      
      // Try the RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_student_leaderboard');
      
      if (!rpcError && rpcData) {
        setEntries(rpcData.slice(0, 10));
        setIsLoading(false);
        return;
      }
      
      // Fallback to manual aggregation
      const { data, error } = await supabase
        .from("book_reviews")
        .select("student_name, school, grade, language, word_count, earnings_cents, avg_external_rating, external_rating_count")
        .eq("is_approved", true);

      if (!error && data) {
        const leaderboardMap = new Map<string, LeaderboardEntry>();
        for (const review of data) {
          const key = review.student_name.toLowerCase().trim();
          const existing = leaderboardMap.get(key);
          if (existing) {
            existing.review_count++;
            existing.total_words += review.word_count;
            existing.earnings_cents += review.earnings_cents;
            const totalCount = existing.review_count;
            existing.avg_rating = ((existing.avg_rating * (totalCount - 1)) + (review.avg_external_rating || 0)) / totalCount;
          } else {
            leaderboardMap.set(key, {
              student_name: review.student_name,
              school: review.school,
              grade: review.grade,
              language: review.language,
              review_count: 1,
              total_words: review.word_count,
              earnings_cents: review.earnings_cents,
              avg_rating: review.avg_external_rating || 0,
              quality_score: 0,
            });
          }
        }
        
        // Calculate quality scores
        const entriesArray = Array.from(leaderboardMap.values());
        for (const entry of entriesArray) {
          entry.quality_score = entry.avg_rating * 0.7 + Math.min(entry.review_count / 10, 1) * 5 * 0.3;
        }
        
        const sorted = entriesArray
          .sort((a, b) => b.quality_score - a.quality_score || b.avg_rating - a.avg_rating || b.earnings_cents - a.earnings_cents)
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
          table: "book_reviews",
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshTrigger]);

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
          Quality Leaderboard
        </CardTitle>
        <CardDescription>
          Ranked by quality score (70% reader ratings + 30% engagement)
        </CardDescription>
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
              No reviews yet. Be the first to submit a review!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={entry.student_name + index}
                className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                  index === 0
                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <div className="flex-shrink-0">{getRankIcon(index)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{entry.student_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.school && `${entry.school} `}
                    {entry.grade && `Grade ${entry.grade}`}
                    {!entry.school && !entry.grade && `${entry.review_count} review${entry.review_count !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium">{entry.avg_rating.toFixed(1)}</span>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-primary">
                    {formatCurrency(entry.earnings_cents)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.total_words} words
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
