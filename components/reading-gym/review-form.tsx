"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { Star, Coins, Sparkles } from "lucide-react";
import {
  calculateEarnings,
  formatCurrency,
  generateSessionId,
  LANGUAGE_OPTIONS,
  SCHOOL_OPTIONS,
  GRADE_OPTIONS,
} from "@/lib/reading-gym";
import confetti from "canvas-confetti";

interface ReviewFormProps {
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ onReviewSubmitted }: ReviewFormProps) {
  const [studentName, setStudentName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState<number | "">("");
  const [language, setLanguage] = useState("English");
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [starRating, setStarRating] = useState(3);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    setSessionId(generateSessionId());
  }, []);

  const countWords = useCallback((text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }, []);

  useEffect(() => {
    const words = countWords(reviewText);
    setWordCount(words);
    setEstimatedEarnings(calculateEarnings(words));
  }, [reviewText, countWords]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#14b8a6", "#f97316", "#fbbf24"],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (wordCount < 10) {
      toast.error("Please write at least 10 words in your review.");
      return;
    }

    if (!studentName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("book_reviews").insert({
        session_id: sessionId,
        book_title: bookTitle.trim(),
        book_author: bookAuthor.trim() || null,
        student_name: studentName.trim(),
        school: school || null,
        grade: grade || null,
        language: language,
        content: reviewText.trim(),
        star_rating: starRating,
        word_count: wordCount,
        earnings_cents: estimatedEarnings,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error(
            "You have already submitted a review for this book. Try reviewing a different book!"
          );
          return;
        }
        throw error;
      }

      triggerConfetti();
      toast.success(
        `Review submitted! You earned ${formatCurrency(estimatedEarnings)}!`,
        {
          icon: <Sparkles className="h-4 w-4 text-accent" />,
        }
      );

      // Reset form (keep student details)
      setBookTitle("");
      setBookAuthor("");
      setStarRating(3);
      setReviewText("");

      onReviewSubmitted?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit review"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 font-display text-xl">
          <Sparkles className="h-5 w-5 text-primary" />
          Write a Book Review
        </CardTitle>
        <CardDescription>
          Share your thoughts and earn rewards for every word!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Info Section */}
          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <h3 className="font-medium text-foreground">Your Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="studentName">Your Name *</Label>
                <Input
                  id="studentName"
                  placeholder="Enter your name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <select
                  id="school"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select your school</option>
                  {SCHOOL_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) =>
                    setGrade(e.target.value ? Number(e.target.value) : "")
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select your grade</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Book Info Section */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bookTitle">Book Title *</Label>
              <Input
                id="bookTitle"
                placeholder="Enter the book title"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookAuthor">Author (optional)</Label>
              <Input
                id="bookAuthor"
                placeholder="Enter the author name"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Star Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setStarRating(rating)}
                  className="rounded p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`Rate ${rating} stars`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      rating <= starRating
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="reviewText">Your Review *</Label>
              <span className="text-sm text-muted-foreground">
                {wordCount} words
              </span>
            </div>
            <Textarea
              id="reviewText"
              placeholder="Write about the book... What did you like? What was the story about? Would you recommend it?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              required
              className="resize-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-accent" />
              <span className="font-medium">Estimated Earnings:</span>
            </div>
            <span className="font-display text-2xl font-bold text-primary">
              {formatCurrency(estimatedEarnings)}
            </span>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || wordCount < 10 || !studentName.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Review & Earn!"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
