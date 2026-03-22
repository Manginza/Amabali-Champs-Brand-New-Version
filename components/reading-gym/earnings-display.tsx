"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, BookOpen, FileText, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/reading-gym";

interface EarningsDisplayProps {
  userId: string;
  sessionId: string | null;
  refreshTrigger?: number;
}

interface Stats {
  totalEarnings: number;
  totalWords: number;
  reviewCount: number;
  sessionEarnings: number;
}

export function EarningsDisplay({
  userId,
  sessionId,
  refreshTrigger,
}: EarningsDisplayProps) {
  const [stats, setStats] = useState<Stats>({
    totalEarnings: 0,
    totalWords: 0,
    reviewCount: 0,
    sessionEarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      // Get all-time stats
      const { data: allTimeData } = await supabase
        .from("reading_gym_reviews")
        .select("earnings_cents, word_count")
        .eq("learner_id", userId);

      // Get session stats
      let sessionEarnings = 0;
      if (sessionId) {
        const { data: sessionData } = await supabase
          .from("reading_gym_reviews")
          .select("earnings_cents")
          .eq("learner_id", userId)
          .eq("session_id", sessionId);

        sessionEarnings =
          sessionData?.reduce((sum, r) => sum + r.earnings_cents, 0) || 0;
      }

      if (allTimeData) {
        setStats({
          totalEarnings: allTimeData.reduce(
            (sum, r) => sum + r.earnings_cents,
            0
          ),
          totalWords: allTimeData.reduce((sum, r) => sum + r.word_count, 0),
          reviewCount: allTimeData.length,
          sessionEarnings,
        });
      }
      setIsLoading(false);
    };

    fetchStats();
  }, [userId, sessionId, refreshTrigger]);

  const statCards = [
    {
      label: "Session Earnings",
      value: formatCurrency(stats.sessionEarnings),
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Earnings",
      value: formatCurrency(stats.totalEarnings),
      icon: Coins,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Words Written",
      value: stats.totalWords.toLocaleString(),
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Reviews",
      value: stats.reviewCount.toString(),
      icon: BookOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-12 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-display text-lg font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
