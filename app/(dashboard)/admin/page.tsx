"use client"
import React from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ingestTeams, updateTeams } from '@/lib/api/teams';
import { ingestGames, updateGames } from '@/lib/api/games';
import { ingestPicks } from '@/lib/api/picks';

interface LoadingButtonProps {
  action: () => Promise<string>;
  text: string;
  loadingText?: string;
  disabled?: boolean;
}

const LoadingButton = ({ action, text, loadingText, disabled = false }: LoadingButtonProps) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const result = await action();
      toast({
        title: "Success",
        description: result,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleClick} 
      disabled={isLoading || disabled}
      className="w-full sm:w-auto m-0"
    >
      {isLoading && <Loader2 className='w-4 h-4 mr-2 animate-spin'/>}
      {isLoading ? loadingText || `${text}ing...` : text}
    </Button>
  );
};

export default function AdminPage() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleIngestPicks = async () => {
    if (!selectedFile) {
      throw new Error("Please select a CSV file first");
    }
    return ingestPicks(selectedFile);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Admin Actions</CardTitle>
        <CardDescription>Manage system data and operations</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 align-center">
        <h2 className="text-lg font-semibold">Teams</h2>
        <div className="flex flex-grow gap-4 align-center">
          <LoadingButton 
            action={ingestTeams}
            text="Ingest Teams"
            loadingText="Ingesting Teams"
          />
          <LoadingButton 
            action={updateTeams}
            text="Update Teams"
            loadingText="Updating Teams"
          />
        </div>
        <h2 className="text-lg font-semibold">Games</h2>
        <div className="flex flex-grow gap-4 align-center">
          <LoadingButton 
            action={ingestGames}
            text="Ingest Games"
            loadingText="Ingesting Games"
          />
          <LoadingButton 
            action={updateGames}
            text="Update Games"
            loadingText="Updating Games"
          />
        </div>
        <h2 className="text-lg font-semibold">Picks</h2>
        <div className="flex flex-grow gap-4 align-center">
          <Input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
          />
          <LoadingButton 
            action={handleIngestPicks}
            text="Ingest Picks"
            loadingText="Ingesting Picks"
            disabled={!selectedFile}
          />
        </div>
      </CardContent>
    </Card>
  );
}
