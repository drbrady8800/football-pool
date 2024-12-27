'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCcw, AlertOctagon, Terminal, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <Terminal className="w-24 h-24 text-muted-foreground opacity-20" />
              <AlertOctagon className="w-8 h-8 text-destructive absolute -top-1 -right-1" />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Something went wrong!</h1>
                <p className="text-muted-foreground">
                  We've encountered an unexpected error, but don't worry - we can try to fix it.
                </p>
              </div>

              <Alert variant="destructive" className="text-left">
                <AlertTitle className="font-mono text-sm">
                  Error: {error.message}
                </AlertTitle>
                {error.digest && (
                  <AlertDescription className="font-mono text-xs mt-2">
                    Digest: {error.digest}
                  </AlertDescription>
                )}
              </Alert>
            </div>
            <div className="flex flex-row gap-4">
              <Button 
                onClick={reset}
                variant="outline"
                className="gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Try again
              </Button>
              <Button 
                onClick={reset}
                variant="default"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
