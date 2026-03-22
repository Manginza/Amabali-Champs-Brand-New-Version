"use client";

import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PenTool, Sparkles, BookOpen } from "lucide-react";
import confetti from "canvas-confetti";

const categories = [
  { value: "adventure", label: "Adventure" },
  { value: "fantasy", label: "Fantasy" },
  { value: "mystery", label: "Mystery" },
  { value: "romance", label: "Romance" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "general", label: "General" },
];

export default function CreateStoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    authorName: "",
    school: "",
    grade: "",
    category: "general",
    content: "",
  });

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (wordCount < 50) {
      toast.error("Please write at least 50 words for your story");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("stories").insert({
        title: formData.title.trim(),
        author_name: formData.authorName.trim(),
        school: formData.school.trim() || null,
        grade: formData.grade ? parseInt(formData.grade) : null,
        category: formData.category,
        content: formData.content.trim(),
        word_count: wordCount,
      });

      if (error) throw error;

      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success("Your story has been published!");
      router.push("/stories");
    } catch (error) {
      console.error("Error submitting story:", error);
      toast.error("Failed to submit story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <PenTool className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Create Your Story
          </h1>
          <p className="mt-2 text-slate-400">
            Share your creativity with the world - no account needed!
          </p>
        </div>

        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-accent" />
              Write Your Story
            </CardTitle>
            <CardDescription className="text-slate-400">
              Fill in the details below to publish your story
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-200">
                  Story Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter your story title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Author Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="authorName" className="text-slate-200">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="authorName"
                    placeholder="Your full name"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    required
                    className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school" className="text-slate-200">
                    School (optional)
                  </Label>
                  <Input
                    id="school"
                    placeholder="Your school name"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-slate-200">
                    Grade (optional)
                  </Label>
                  <Input
                    id="grade"
                    type="number"
                    min="1"
                    max="12"
                    placeholder="e.g., 7"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-200">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Story Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="text-slate-200">
                    Your Story <span className="text-destructive">*</span>
                  </Label>
                  <span className={`text-sm ${wordCount >= 50 ? "text-primary" : "text-slate-500"}`}>
                    {wordCount} words {wordCount < 50 && "(min 50)"}
                  </span>
                </div>
                <Textarea
                  id="content"
                  placeholder="Once upon a time..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={12}
                  className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={isSubmitting || wordCount < 50}
              >
                {isSubmitting ? (
                  "Publishing..."
                ) : (
                  <>
                    <BookOpen className="h-4 w-4" />
                    Publish Story
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
