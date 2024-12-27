"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Ghost, Home, AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <Ghost className="w-24 h-24 text-muted-foreground opacity-20" />
              <AlertCircle className="w-8 h-8 text-destructive absolute -top-1 -right-1" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-7xl font-bold tracking-tighter">404</h1>
              <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
              <p className="text-muted-foreground">
                Oops! The page you're looking for seems to have vanished into thin air.
              </p>
            </div>

            <Button
              onClick={() => window.location.href = '/'}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}