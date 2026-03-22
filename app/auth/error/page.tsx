import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <BookOpen className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Amabali Champs
            </h1>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              {params?.error ? (
                <p className="text-sm text-muted-foreground">
                  Error: {params.error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  An unexpected error occurred. Please try again.
                </p>
              )}
              <div className="flex flex-col gap-2">
                <Link href="/auth/login">
                  <Button className="w-full">Try Again</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
