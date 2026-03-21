import type { Metadata, Viewport } from "next";
import { Inter, Fredoka } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Amabali Champs - Reading Gym",
  description:
    "Write book reviews, earn money per word, and compete on the live leaderboard. The Reading Gym makes reading and writing fun and rewarding!",
  keywords: ["reading", "book reviews", "education", "literacy", "gamification"],
  openGraph: {
    title: "Amabali Champs - Reading Gym",
    description: "Write book reviews, earn money, and climb the leaderboard!",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#14b8a6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fredoka.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
