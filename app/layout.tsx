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
  title: "SRDL Writers & Reader's Hub",
  description:
    "Unleash your creativity, write amazing stories, and earn rewards while improving your skills!",
  keywords: ["reading", "writing", "stories", "reviews", "education", "literacy"],
  openGraph: {
    title: "SRDL Writers & Reader's Hub",
    description: "Unleash your creativity, write amazing stories, and earn rewards!",
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
