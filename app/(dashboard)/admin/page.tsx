"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface IngestDataProps {
  method: string;
  endpoint: string;
  setIsLoading: (isLoading: boolean) => void;
  toast: ReturnType<typeof useToast>["toast"];
  file?: File;
}

const ingestData = async ({method, endpoint, setIsLoading, toast, file}: IngestDataProps) => {
  setIsLoading(true);
  
  try {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(endpoint, {
      method,
      body: file ? formData : undefined,
    });
    const responseJson = await response.json();

    if (!response.ok) {
      console.error(responseJson);
      toast({
        title: responseJson["error"],
        description: responseJson["details"],
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: responseJson["message"],
      variant: "success",
    });
  } finally {
    setIsLoading(false);
  }
}

export default function AdminPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isIngestTeamsLoading, setIsIngestTeamsLoading] = useState(false);
  const [isUpdateTeamsLoading, setIsUpdateTeamsLoading] = useState(false);
  const [isIngestGamesLoading, setIsIngestGamesLoading] = useState(false);
  const [isUpdateGamesLoading, setIsUpdateGamesLoading] = useState(false);
  const [isIngestPicksLoading, setIsIngestPicksLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const ingestTeams = async () => {
    ingestData({ method: "POST", endpoint: '/api/teams', setIsLoading: setIsIngestTeamsLoading, toast });
  };
  const updateTeams = async () => {
    ingestData({ method: "PUT", endpoint: '/api/teams', setIsLoading: setIsUpdateTeamsLoading, toast });
  };
  const ingestGames = async () => {
    ingestData({ method: "POST", endpoint: '/api/games', setIsLoading: setIsIngestGamesLoading, toast });
  };
  const updateGames = async () => {
    ingestData({ method: "PUT", endpoint: '/api/games', setIsLoading: setIsUpdateGamesLoading, toast });
  };
  const ingestPicks = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file first",
        variant: "destructive",
      });
      return;
    }
    ingestData({ 
      method: "POST", 
      endpoint: '/api/picks', 
      setIsLoading: setIsIngestPicksLoading, 
      toast,
      file: selectedFile 
    });
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
          <Button 
            onClick={ingestTeams} 
            disabled={isIngestTeamsLoading}
            className="w-full sm:w-auto m-0"
          >
            {isIngestTeamsLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingesting Teams
              </>
            ) : (
              'Ingest Teams'
            )}
          </Button>
          <Button 
            onClick={updateTeams} 
            disabled={isUpdateTeamsLoading}
            className="w-full sm:w-auto m-0"
          >
            {isUpdateTeamsLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Teams
              </>
            ) : (
              'Update Teams'
            )}
          </Button>
        </div>
        <h2 className="text-lg font-semibold">Games</h2>
        <div className="flex flex-grow gap-4 align-center">
          <Button 
            onClick={ingestGames} 
            disabled={isIngestGamesLoading}
            className="w-full sm:w-auto m-0"
          >
            {isIngestGamesLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingesting Games
              </>
            ) : (
              'Ingest Games'
            )}
          </Button>
          <Button 
            onClick={updateGames} 
            disabled={isUpdateGamesLoading}
            className="w-full sm:w-auto m-0"
          >
            {isUpdateGamesLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Games
              </>
            ) : (
              'Update Games'
            )}
          </Button>
        </div>
        <h2 className="text-lg font-semibold">Picks</h2>
        <div className="flex flex-grow gap-4 align-center">
          <Input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
          />
          <Button 
            onClick={ingestPicks}
            disabled={isIngestPicksLoading || !selectedFile}
            className="w-full sm:w-auto m-0"
          >
            {isIngestPicksLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingesting Picks
              </>
            ) : (
              'Ingest Picks'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
