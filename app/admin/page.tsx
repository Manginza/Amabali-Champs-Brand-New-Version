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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  BookOpen,
  ArrowLeft,
  Play,
  Square,
  Clock,
  Users,
  FileText,
} from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

interface Session {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time?: string;
  is_active: boolean;
  created_at: string;
}

interface SessionStats {
  reviewCount: number;
  participantCount: number;
  totalWords: number;
  totalEarnings: number;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionStats, setSessionStats] = useState<Record<string, SessionStats>>({});
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionDescription, setNewSessionDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
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
      await fetchSessions();
      setIsLoading(false);
    };

    init();
  }, [router]);

  const fetchSessions = async () => {
    const supabase = createClient();
    const { data: sessionsData } = await supabase
      .from("reading_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (sessionsData) {
      setSessions(sessionsData);

      // Fetch stats for each session
      const stats: Record<string, SessionStats> = {};
      for (const session of sessionsData) {
        const { data: reviews } = await supabase
          .from("book_reviews")
          .select("learner_id, word_count, earnings_cents")
          .eq("session_id", session.id);

        if (reviews) {
          const uniqueParticipants = new Set(reviews.map((r) => r.learner_id));
          stats[session.id] = {
            reviewCount: reviews.length,
            participantCount: uniqueParticipants.size,
            totalWords: reviews.reduce((sum, r) => sum + r.word_count, 0),
            totalEarnings: reviews.reduce((sum, r) => sum + r.earnings_cents, 0),
          };
        } else {
          stats[session.id] = {
            reviewCount: 0,
            participantCount: 0,
            totalWords: 0,
            totalEarnings: 0,
          };
        }
      }
      setSessionStats(stats);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSessionName.trim()) return;

    setIsCreating(true);
    const supabase = createClient();

    try {
      // First, deactivate any existing active sessions
      await supabase
        .from("reading_sessions")
        .update({ is_active: false, end_time: new Date().toISOString() })
        .eq("is_active", true);

      // Create new session
      const { error } = await supabase.from("reading_sessions").insert({
        name: newSessionName.trim(),
        description: newSessionDescription.trim() || null,
        start_time: new Date().toISOString(),
        is_active: true,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Reading session started!");
      setNewSessionName("");
      setNewSessionDescription("");
      await fetchSessions();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create session"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleSession = async (session: Session) => {
    const supabase = createClient();

    try {
      if (session.is_active) {
        // End session
        await supabase
          .from("reading_sessions")
          .update({ is_active: false, end_time: new Date().toISOString() })
          .eq("id", session.id);
        toast.success("Session ended");
      } else {
        // Deactivate other sessions first
        await supabase
          .from("reading_sessions")
          .update({ is_active: false, end_time: new Date().toISOString() })
          .eq("is_active", true);

        // Reactivate this session
        await supabase
          .from("reading_sessions")
          .update({ is_active: true, end_time: null })
          .eq("id", session.id);
        toast.success("Session reactivated");
      }

      await fetchSessions();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update session"
      );
    }
  };

  const formatCurrency = (cents: number) => {
    return `R${(cents / 100).toFixed(2)}`;
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
                Session Manager
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Create Session Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="font-display">Start New Session</CardTitle>
              <CardDescription>
                Create a new reading session for learners to submit reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionName">Session Name</Label>
                  <Input
                    id="sessionName"
                    placeholder="e.g., Morning Reading Club"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionDescription">
                    Description (optional)
                  </Label>
                  <Textarea
                    id="sessionDescription"
                    placeholder="Describe the session..."
                    value={newSessionDescription}
                    onChange={(e) => setNewSessionDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating || !newSessionName.trim()}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isCreating ? "Starting..." : "Start Session"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Quick Stats</CardTitle>
              <CardDescription>Overview of all sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="font-display text-3xl font-bold text-primary">
                    {sessions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
                <div className="rounded-lg bg-accent/10 p-4 text-center">
                  <p className="font-display text-3xl font-bold text-accent">
                    {sessions.filter((s) => s.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-4 text-center">
                  <p className="font-display text-3xl font-bold text-blue-500">
                    {Object.values(sessionStats).reduce(
                      (sum, s) => sum + s.reviewCount,
                      0
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>
                <div className="rounded-lg bg-purple-500/10 p-4 text-center">
                  <p className="font-display text-3xl font-bold text-purple-500">
                    {formatCurrency(
                      Object.values(sessionStats).reduce(
                        (sum, s) => sum + s.totalEarnings,
                        0
                      )
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">All Sessions</CardTitle>
            <CardDescription>Manage your reading sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No sessions yet. Create your first session above!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const stats = sessionStats[session.id] || {
                    reviewCount: 0,
                    participantCount: 0,
                    totalWords: 0,
                    totalEarnings: 0,
                  };

                  return (
                    <div
                      key={session.id}
                      className={`rounded-lg border p-4 transition-colors ${
                        session.is_active
                          ? "border-primary bg-primary/5"
                          : "bg-muted/30"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-semibold">
                              {session.name}
                            </h3>
                            {session.is_active && (
                              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                Active
                              </span>
                            )}
                          </div>
                          {session.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {session.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(session.start_time).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {stats.participantCount} participants
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {stats.reviewCount} reviews
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-display text-lg font-bold text-primary">
                              {formatCurrency(stats.totalEarnings)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {stats.totalWords.toLocaleString()} words
                            </p>
                          </div>
                          <Button
                            variant={session.is_active ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => handleToggleSession(session)}
                          >
                            {session.is_active ? (
                              <>
                                <Square className="mr-1 h-3 w-3" />
                                End
                              </>
                            ) : (
                              <>
                                <Play className="mr-1 h-3 w-3" />
                                Start
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
