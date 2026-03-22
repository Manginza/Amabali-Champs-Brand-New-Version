import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Coins,
  Trophy,
  Sparkles,
  PenLine,
  Users,
  Star,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">Amabali Champs</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center md:py-24">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            The Reading Gym
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
            Read Books, Write Reviews,{" "}
            <span className="text-primary">Earn Rewards</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground text-pretty">
            Join the Amabali Champs Reading Gym where every word you write earns
            you money. Share your love of reading and watch your earnings grow!
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Start Earning Today
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold">How It Works</h2>
          <p className="mt-2 text-muted-foreground">
            Three simple steps to start earning
          </p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          <Card className="relative overflow-hidden">
            <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-display text-2xl font-bold text-primary">
              1
            </div>
            <CardContent className="pt-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">
                Read a Book
              </h3>
              <p className="text-sm text-muted-foreground">
                Pick any book you love - fiction, non-fiction, adventure,
                mystery, or anything else!
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-display text-2xl font-bold text-primary">
              2
            </div>
            <CardContent className="pt-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <PenLine className="h-7 w-7 text-accent" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">
                Write a Review
              </h3>
              <p className="text-sm text-muted-foreground">
                Share your thoughts about the book. The more you write, the
                more you earn!
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-display text-2xl font-bold text-primary">
              3
            </div>
            <CardContent className="pt-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10">
                <Coins className="h-7 w-7 text-yellow-500" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">
                Earn Rewards
              </h3>
              <p className="text-sm text-muted-foreground">
                Get paid for every word! Watch your earnings grow and celebrate
                with confetti!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Earn Per Word</h3>
                <p className="text-sm text-muted-foreground">
                  Every word counts! Get R0.05 per word you write in your
                  reviews.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Live Leaderboard</h3>
                <p className="text-sm text-muted-foreground">
                  Compete with other readers and see your rank in real-time.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Rate Books</h3>
                <p className="text-sm text-muted-foreground">
                  Share your star ratings to help others find great books.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Celebrate Wins</h3>
                <p className="text-sm text-muted-foreground">
                  Enjoy confetti celebrations every time you submit a review!
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Reading Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Join live reading sessions and compete with fellow readers.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-green-500/10">
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Any Book Works</h3>
                <p className="text-sm text-muted-foreground">
                  Review any book you want - no restrictions on genres or
                  titles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-3xl overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-8 text-center md:p-12">
            <h2 className="font-display text-3xl font-bold">
              Ready to Start Reading?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Join thousands of readers who are earning rewards while doing what
              they love. Your next great book is waiting!
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="mt-6 gap-2">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="font-display font-semibold">Amabali Champs</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Amabali Champs. Making reading
              rewarding.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
