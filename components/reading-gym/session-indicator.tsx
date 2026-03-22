"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Radio } from "lucide-react";

interface Session {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time?: string;
  is_active: boolean;
}

interface SessionIndicatorProps {
  session: Session | null;
}

export function SessionIndicator({ session }: SessionIndicatorProps) {
  if (!session) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-muted-foreground">
              No Active Session
            </p>
            <p className="text-sm text-muted-foreground">
              Waiting for a reading session to start...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
          <Radio className="h-5 w-5 text-primary" />
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-primary">
            {session.name}
          </p>
          {session.description && (
            <p className="truncate text-sm text-muted-foreground">
              {session.description}
            </p>
          )}
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Started</p>
          <p className="font-medium">
            {new Date(session.start_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
