"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Dashboard redirects to write-review since learners don't need accounts
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/write-review");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
