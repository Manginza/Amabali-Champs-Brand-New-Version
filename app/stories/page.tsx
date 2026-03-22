"use client";

import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { BookOpen, Search, Star, MessageSquare, User, School, Calendar } from "lucide-react";
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

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "adventure", "fantasy", "mystery", "romance", "sci-fi", "general"];

  useEffect(() => {
    const fetchStories = async () => {
      const supabase = createClient();
      let query = supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (!error && data) {
        setStories(data);
      }
      setIsLoading(false);
    };

    fetchStories();
  }, [selectedCategory]);

  const filteredStories = stories.filter(
    (story) =>
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Explore Stories
          </h1>
          <p className="mt-2 text-slate-400">
            Read amazing stories written by young authors
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              type="search"
              placeholder="Search stories or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-slate-700 bg-slate-800 pl-10 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={
                  selectedCategory === cat
                    ? ""
                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                }
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Write Story CTA */}
        <div className="mb-8 rounded-xl border border-primary/30 bg-primary/10 p-6 text-center">
          <h2 className="font-display text-xl font-semibold text-white">
            Have a story to share?
          </h2>
          <p className="mt-1 text-slate-400">
            No account needed - just start writing!
          </p>
          <Link href="/create-story">
            <Button className="mt-4">Create Your Story</Button>
          </Link>
        </div>

        {/* Stories Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse border-slate-700 bg-slate-800">
                <CardHeader className="space-y-2">
                  <div className="h-6 w-3/4 rounded bg-slate-700" />
                  <div className="h-4 w-1/2 rounded bg-slate-700" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-slate-700" />
                    <div className="h-4 w-full rounded bg-slate-700" />
                    <div className="h-4 w-2/3 rounded bg-slate-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-4 font-display text-xl font-semibold text-white">
              No stories yet
            </h3>
            <p className="mt-2 text-slate-400">
              Be the first to share your story!
            </p>
            <Link href="/create-story">
              <Button className="mt-4">Create Story</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <Link key={story.id} href={`/stories/${story.id}`}>
                <Card className="h-full cursor-pointer border-slate-700 bg-slate-800 transition-all hover:border-primary hover:bg-slate-800/80">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-white line-clamp-2">
                        {story.title}
                      </h3>
                      <span className="flex-shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                        {story.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <User className="h-3 w-3" />
                      <span>{story.author_name}</span>
                      {story.school && (
                        <>
                          <span className="text-slate-600">|</span>
                          <School className="h-3 w-3" />
                          <span>{story.school}</span>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-slate-400 line-clamp-3">
                      {story.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {story.avg_external_rating > 0
                            ? story.avg_external_rating.toFixed(1)
                            : "No ratings"}
                        </span>
                        <span>{story.word_count} words</span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(story.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
