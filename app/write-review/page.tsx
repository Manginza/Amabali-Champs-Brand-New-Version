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
import { BookOpen, Star, Coins, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { calculateEarnings, formatCurrency } from "@/lib/reading-gym";

const RATE_PER_WORD_CENTS = 5; // R0.05 per word

export default function WriteReviewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [starRating, setStarRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    bookTitle: "",
    bookAuthor: "",
    studentName: "",
    school: "",
    grade: "",
    language: "English",
    content: "",
  });

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
  const earnings = calculateEarnings(wordCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (wordCount < 50) {
      toast.error("Please write at least 50 words for your review");
      return;
    }

    if (starRating === 0) {
      toast.error("Please rate the book");
      return;
    }

    setIsSubmitting(true);

    // Get or create session ID for duplicate prevention
    const sessionId = localStorage.getItem("reviewer_session") || crypto.randomUUID();
    localStorage.setItem("reviewer_session", sessionId);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("book_reviews").insert({
        session_id: sessionId,
        book_title: formData.bookTitle.trim(),
        book_author: formData.bookAuthor.trim() || null,
        student_name: formData.studentName.trim(),
        school: formData.school.trim() || null,
        grade: formData.grade ? parseInt(formData.grade) : null,
        language: formData.language,
        content: formData.content.trim(),
        star_rating: starRating,
        word_count: wordCount,
        earnings_cents: earnings,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already reviewed this book");
          return;
        }
        throw error;
      }

      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#14b8a6", "#f97316", "#fbbf24"],
      });

      toast.success(`Review submitted! You earned ${formatCurrency(earnings)}`);
      router.push("/reviews");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20">
            <BookOpen className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Write a Book Review
          </h1>
          <p className="mt-2 text-slate-400">
            Share your thoughts and earn R0.05 per word!
          </p>
        </div>

        {/* Earnings Preview */}
        <Card className="mb-6 border-accent/30 bg-accent/10">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-accent" />
              <div>
                <p className="text-sm text-slate-400">Your earnings so far</p>
                <p className="font-display text-2xl font-bold text-white">
                  {formatCurrency(earnings)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">{wordCount} words</p>
              <p className="text-xs text-slate-500">R0.05 per word</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-primary" />
              Review Details
            </CardTitle>
            <CardDescription className="text-slate-400">
              Fill in the details below to submit your review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Book Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bookTitle" className="text-slate-200">
                    Book Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bookTitle"
                    placeholder="Enter the book title"
                    value={formData.bookTitle}
                    onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                    required
                    className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookAuthor" className="text-slate-200">
                    Book Author (optional)
                  </Label>
                  <Input
                    id="bookAuthor"
                    placeholder="Author name"
                    value={formData.bookAuthor}
                    onChange={(e) => setFormData({ ...formData, bookAuthor: e.target.value })}
                    className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Star Rating */}
              <div className="space-y-2">
                <Label className="text-slate-200">
                  Your Rating <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoverRating || starRating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviewer Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="studentName" className="text-slate-200">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="studentName"
                    placeholder="Your full name"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
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
                  <Label htmlFor="language" className="text-slate-200">
                    Language
                  </Label>
                  <select
                    id="language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="English">English</option>
                    <option value="Afrikaans">Afrikaans</option>
                    <option value="isiZulu">isiZulu</option>
                    <option value="isiXhosa">isiXhosa</option>
                    <option value="Sesotho">Sesotho</option>
                    <option value="Setswana">Setswana</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="text-slate-200">
                    Your Review <span className="text-destructive">*</span>
                  </Label>
                  <span className={`text-sm ${wordCount >= 50 ? "text-primary" : "text-slate-500"}`}>
                    {wordCount} words {wordCount < 50 && "(min 50)"}
                  </span>
                </div>
                <Textarea
                  id="content"
                  placeholder="Write about what you liked, what you learned, and who should read this book..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={10}
                  className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500">
                  Tip: The more you write, the more you earn! Write about the characters,
                  plot, themes, and your favorite moments.
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 bg-accent hover:bg-accent/90"
                disabled={isSubmitting || wordCount < 50 || starRating === 0}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Coins className="h-4 w-4" />
                    Submit Review & Earn {formatCurrency(earnings)}
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
