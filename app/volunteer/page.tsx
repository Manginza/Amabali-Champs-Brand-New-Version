"use client";

import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import {
  Users,
  Heart,
  BookOpen,
  GraduationCap,
  MessageSquare,
  CheckCircle2,
  Star,
} from "lucide-react";

const volunteerRoles = [
  {
    icon: BookOpen,
    title: "Reading Mentor",
    description: "Guide young readers through their literary journey and help them discover new books.",
  },
  {
    icon: Star,
    title: "Review Coach",
    description: "Help students improve their writing skills by providing constructive feedback on their reviews.",
  },
  {
    icon: GraduationCap,
    title: "Workshop Facilitator",
    description: "Lead creative writing workshops and inspire the next generation of storytellers.",
  },
  {
    icon: MessageSquare,
    title: "Community Moderator",
    description: "Foster a positive and supportive community by moderating discussions and comments.",
  },
];

export default function VolunteerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    experience: "",
    motivation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    toast.success("Thank you for your interest in volunteering!");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/20">
            <Users className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Become a Volunteer
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-slate-400">
            Help young minds discover the joy of reading and writing. Your expertise and time can make a lasting impact.
          </p>
        </div>

        {/* Volunteer Roles */}
        <div className="mb-12">
          <h2 className="mb-6 text-center font-display text-2xl font-semibold text-white">
            Volunteer Opportunities
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {volunteerRoles.map((role) => (
              <Card
                key={role.title}
                className="border-slate-700 bg-slate-800 transition-all hover:border-green-500/50"
              >
                <CardContent className="flex gap-4 p-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-green-500/20">
                    <role.icon className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white">
                      {role.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {role.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Form */}
        {submitted ? (
          <Card className="border-green-500/30 bg-green-500/10">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-400" />
              <h2 className="mt-4 font-display text-2xl font-bold text-white">
                Application Received!
              </h2>
              <p className="mx-auto mt-2 max-w-md text-slate-300">
                Thank you for your interest in volunteering with SRDL Writers Hub. 
                We will review your application and get back to you soon.
              </p>
              <Button
                className="mt-6"
                variant="outline"
                onClick={() => setSubmitted(false)}
              >
                Submit Another Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Heart className="h-5 w-5 text-red-400" />
                Volunteer Application
              </CardTitle>
              <CardDescription className="text-slate-400">
                Fill out the form below to apply as a volunteer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-200">
                      Phone Number (optional)
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-slate-200">
                      Preferred Role <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                      className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a role</option>
                      {volunteerRoles.map((role) => (
                        <option key={role.title} value={role.title}>
                          {role.title}
                        </option>
                      ))}
                      <option value="Multiple">Open to multiple roles</option>
                    </select>
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-slate-200">
                    Relevant Experience
                  </Label>
                  <Textarea
                    id="experience"
                    placeholder="Tell us about any relevant experience you have (teaching, mentoring, writing, etc.)"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    rows={3}
                    className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Motivation */}
                <div className="space-y-2">
                  <Label htmlFor="motivation" className="text-slate-200">
                    Why do you want to volunteer? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="motivation"
                    placeholder="Share your motivation for volunteering with us..."
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    required
                    rows={4}
                    className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Heart className="h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <div className="mt-12 rounded-xl border border-slate-700 bg-slate-800 p-8">
          <h2 className="mb-6 text-center font-display text-2xl font-semibold text-white">
            Why Volunteer With Us?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-white">Make an Impact</h3>
              <p className="mt-1 text-sm text-slate-400">
                Help shape the future of young readers and writers in your community.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-white">Join a Community</h3>
              <p className="mt-1 text-sm text-slate-400">
                Connect with like-minded individuals passionate about literacy.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <GraduationCap className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-white">Grow Your Skills</h3>
              <p className="mt-1 text-sm text-slate-400">
                Develop leadership, mentoring, and communication skills.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
