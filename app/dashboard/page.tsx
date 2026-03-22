"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/reading-gym/review-form";
import { Leaderboard } from "@/components/reading-gym/leaderboard";
import { RecentReviews } from "@/components/reading-gym/recent-reviews";
import { BookOpen, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

interface Profile {
  full_name: string | null;
  avatar_emoji: string | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_emoji")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setIsLoading(false);
    };

    init();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleReviewSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading Reading Gym...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userName =
    profile?.full_name || user.user_metadata?.full_name || user.email || "Reader";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold">Amabali Champs</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xl">{profile?.avatar_emoji || "📚"}</span>
              <span className="font-medium">{userName}</span>
            </div>
            <Link href="/admin">
              <Button variant="ghost" size="icon" title="Admin">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 space-y-2">
          <h1 className="font-display text-3xl font-bold">
            Welcome back, {userName.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Ready to read, review, and earn?
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Review Form - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <ReviewForm onReviewSubmitted={handleReviewSubmitted} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Leaderboard refreshTrigger={refreshTrigger} />
            <RecentReviews refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
}
