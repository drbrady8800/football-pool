import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GameWithTeams } from '@/db/types';

interface ScorePredictionFormProps {
  game: GameWithTeams
  onScorePrediction: (game: string, scores: { homeScore: number; awayScore: number }) => void;
  selectedTeamId: string;
  onTeamSelect: (teamId: string) => void;
}

const ScorePredictionForm = ({ 
  game,
  onScorePrediction,
  selectedTeamId,
  onTeamSelect 
}: ScorePredictionFormProps) => {
  const [homeScore, setHomeScore] = React.useState('');
  const [awayScore, setAwayScore] = React.useState('');

  // Update scores when team selection changes
  useEffect(() => {
    if (selectedTeamId && homeScore && awayScore) {
      const homeScoreNum = parseInt(homeScore);
      const awayScoreNum = parseInt(awayScore);
      
      // If selected team's score isn't higher, swap scores
      if ((selectedTeamId === game.homeTeamId && homeScoreNum <= awayScoreNum) ||
          (selectedTeamId === game.awayTeamId && awayScoreNum <= homeScoreNum)) {
        setHomeScore(awayScore);
        setAwayScore(homeScore);
        
        // Submit new swapped scores
        onScorePrediction(game.id, {
          homeScore: parseInt(awayScore),
          awayScore: parseInt(homeScore)
        });
      }
    }
  }, [selectedTeamId, game.id, homeScore, awayScore]);

  const handleScoreChange = (type: 'home' | 'away', value: string) => {
    if (type === 'home') {
      setHomeScore(value);
      onScorePrediction(game.id, {
        homeScore: parseInt(value),
        awayScore: parseInt(awayScore)
      });
    } else {
      setAwayScore(value);
      onScorePrediction(game.id, {
        homeScore: parseInt(homeScore),
        awayScore: parseInt(value)
      });
    }

    // If both scores are set, update team selection
    if (value && (type === 'home' ? awayScore : homeScore)) {
      const homeScoreNum = parseInt(type === 'home' ? value : homeScore);
      const awayScoreNum = parseInt(type === 'away' ? value : awayScore);
      
      if (homeScoreNum !== awayScoreNum) {
        const winningTeamId = homeScoreNum > awayScoreNum ? game.homeTeamId : game.awayTeamId;
        if (winningTeamId && winningTeamId !== selectedTeamId) {
          onTeamSelect(winningTeamId);
        }
      }
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className='text-xl'>Score Tie Breaker</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Label htmlFor="homeScore" className="text-sm font-medium">
              {game.homeTeam.name} Score
            </Label>
            <Input
              id="homeScore"
              type="number"
              min="0"
              value={homeScore}
              onChange={(e) => handleScoreChange('home', e.target.value)}
              className="mt-1"
              placeholder="0"
              required
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="awayScore" className="text-sm font-medium">
              {game.awayTeam.name} Score
            </Label>
            <Input
              id="awayScore"
              type="number"
              min="0"
              value={awayScore}
              onChange={(e) => handleScoreChange('away', e.target.value)}
              className="mt-1"
              placeholder="0"
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScorePredictionForm;