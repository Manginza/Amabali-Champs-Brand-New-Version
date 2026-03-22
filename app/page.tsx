"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import {
  Users,
  FileText,
  Star,
  Coins,
  BookOpen,
  Dumbbell,
  Trophy,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  writers: number;
  stories: number;
  words: number;
  earnings: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    writers: 0,
    stories: 0,
    words: 0,
    earnings: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      
      // Get stories count
      const { count: storiesCount } = await supabase
        .from("stories")
        .select("*", { count: "exact", head: true });
      
      // Get reviews stats
      const { data: reviewsData } = await supabase
        .from("book_reviews")
        .select("student_name, word_count, earnings_cents");
      
      if (reviewsData) {
        const uniqueWriters = new Set(reviewsData.map(r => r.student_name.toLowerCase().trim())).size;
        const totalWords = reviewsData.reduce((sum, r) => sum + (r.word_count || 0), 0);
        const totalEarnings = reviewsData.reduce((sum, r) => sum + (r.earnings_cents || 0), 0);
        
        setStats({
          writers: uniqueWriters + (storiesCount || 0),
          stories: (storiesCount || 0) + reviewsData.length,
          words: totalWords,
          earnings: totalEarnings,
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-800 via-slate-900 to-indigo-950 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            <Sparkles className="mb-2 inline-block h-8 w-8 text-primary md:h-10 md:w-10" />
            {" "}SRDL{" "}
            <span className="text-accent">Writers</span>
            {" & "}
            <span className="text-primary">Reader&apos;s</span>
            {" Hub "}
            <Sparkles className="mb-2 inline-block h-8 w-8 text-primary md:h-10 md:w-10" />
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
            Unleash your creativity, write amazing stories, and earn rewards while improving your skills!
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/create-story">
              <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                Start Writing Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/reading-gym">
              <Button size="lg" variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <BookOpen className="h-4 w-4" />
                Reading Gym
              </Button>
            </Link>
            <Link href="/reviews">
              <Button size="lg" variant="outline" className="gap-2 border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white">
                <Trophy className="h-4 w-4" />
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 px-4 md:grid-cols-4 md:gap-6">
          <div className="rounded-2xl bg-indigo-900/50 p-6 text-center backdrop-blur">
            <Users className="mx-auto h-8 w-8 text-accent" />
            <p className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
              {stats.writers > 0 ? `${stats.writers}+` : "1000+"}
            </p>
            <p className="mt-1 text-sm text-slate-400">Young Writers</p>
          </div>
          <div className="rounded-2xl bg-indigo-900/50 p-6 text-center backdrop-blur">
            <FileText className="mx-auto h-8 w-8 text-accent" />
            <p className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
              {stats.stories > 0 ? `${stats.stories}+` : "5000+"}
            </p>
            <p className="mt-1 text-sm text-slate-400">Stories Created</p>
          </div>
          <div className="rounded-2xl bg-indigo-900/50 p-6 text-center backdrop-blur">
            <Star className="mx-auto h-8 w-8 text-accent" />
            <p className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
              {stats.words > 0 ? `${Math.floor(stats.words / 1000)}K+` : "10000+"}
            </p>
            <p className="mt-1 text-sm text-slate-400">Words Written</p>
          </div>
          <div className="rounded-2xl bg-indigo-900/50 p-6 text-center backdrop-blur">
            <Coins className="mx-auto h-8 w-8 text-accent" />
            <p className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
              R{stats.earnings > 0 ? Math.floor(stats.earnings / 100) : 500}+
            </p>
            <p className="mt-1 text-sm text-slate-400">Earned by Authors</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-white">
            What You Can Do
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/create-story" className="group">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 transition-all hover:border-primary hover:bg-slate-800">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-white">Write Stories</h3>
                <p className="text-sm text-slate-400">
                  Share your creative stories with the world. No account needed!
                </p>
              </div>
            </Link>

            <Link href="/write-review" className="group">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 transition-all hover:border-accent hover:bg-slate-800">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20">
                  <Star className="h-7 w-7 text-accent" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-white">Write Reviews</h3>
                <p className="text-sm text-slate-400">
                  Review books and earn R0.05 per word you write!
                </p>
              </div>
            </Link>

            <Link href="/reading-gym" className="group">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 transition-all hover:border-primary hover:bg-slate-800">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
                  <Dumbbell className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-white">Reading Gym</h3>
                <p className="text-sm text-slate-400">
                  Join live reading sessions and compete with other readers!
                </p>
              </div>
            </Link>

            <Link href="/stories" className="group">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 transition-all hover:border-primary hover:bg-slate-800">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/20">
                  <BookOpen className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-white">Read Stories</h3>
                <p className="text-sm text-slate-400">
                  Discover amazing stories written by young authors.
                </p>
              </div>
            </Link>

            <Link href="/reviews" className="group">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 transition-all hover:border-accent hover:bg-slate-800">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-500/20">
                  <Trophy className="h-7 w-7 text-yellow-400" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-white">Leaderboard</h3>
                <p className="text-sm text-slate-400">
                  See top reviewers and their quality scores.
                </p>
              </div>
            </Link>

            <Link href="/volunteer" className="group">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 transition-all hover:border-primary hover:bg-slate-800">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-500/20">
                  <Users className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-white">Volunteer</h3>
                <p className="text-sm text-slate-400">
                  Help young writers improve their skills.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-white">
              <span className="text-primary">Reading</span>
              <span className="text-accent">Quest</span>
            </span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} SRDL Writers Hub. Making reading and writing rewarding.
          </p>
        </div>
      </footer>
    </div>
  );
}
