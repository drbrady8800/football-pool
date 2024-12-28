"use client"
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { type GameWithTeams, type Team } from '@/db/types';

const genericTeam: Team = {
  id: 'N/A',
  name: 'TBD',
  mascot: 'TBD',
  abbreviation: 'TBD',
  conference: 'TBD',
  division: 'TBD',
  logoUrl: '/placeholder-logo.svg',
  primaryColor: '#111111',
  secondaryColor: '#e2e2e2',
  location: {},
}

interface GameCardProps {
  game: GameWithTeams;
  isHeader?: boolean;
  selectedTeamId?: string;
}

const GameCard = ({ game, isHeader, selectedTeamId }: GameCardProps) => {
  const { homeTeam, awayTeam, gameDate, homeTeamScore, awayTeamScore, isComplete } = game;
  const computedHomeTeam = homeTeam ?? genericTeam;
  const computedAwayTeam = awayTeam ?? genericTeam;
  const router = useRouter();

  const isSelectedTeamWinner = isComplete && selectedTeamId && selectedTeamId === game.winningTeamId;
  const isSelectedTeamLoser = isComplete && selectedTeamId && game.winningTeamId && selectedTeamId !== game.winningTeamId;

  // Helper function to get team gradient based on conditions
  const getTeamGradient = (team: Team, isHome: boolean) => {
    const direction = isHome ? '135deg' : '-45deg';
    const defaultGradient = isHome
      ? `linear-gradient(${direction}, ${team.primaryColor} 0%, ${homeTeam ? team.primaryColor : team.secondaryColor} 30%, transparent 70%)`
      : `linear-gradient(${direction}, ${team.primaryColor} 0%, ${awayTeam ? team.primaryColor : team.secondaryColor} 30%, transparent 70%)`;
    
    // If no selected team, return default gradient
    if (!selectedTeamId) return defaultGradient;

    const isSelectedTeam = team.id === selectedTeamId;

    // Game not complete - highlight selected team, gray out other
    if (!isComplete) {
      if (isSelectedTeam) {
        return defaultGradient;
      }
      return `linear-gradient(${direction}, #FFFFFF 0%, #FFFFFF 30%, transparent 70%)`;
    }

    // Game complete - show outcome gradients
    if (isSelectedTeam) {
      if (isSelectedTeamWinner) {
        return `linear-gradient(${direction}, #22C55E 0%, #22C55E 30%, transparent 70%)`; // Green for win
      }
      if (isSelectedTeamLoser) {
        return `linear-gradient(${direction}, #E41B17 0%, #E41B17 30%, transparent 70%)`; // Red for loss
      }
    } else {
      return `linear-gradient(${direction}, #FFFFFF 0%, #FFFFFF 30%, transparent 70%)`;
    }

    return defaultGradient;
  };

  const leftGradient = getTeamGradient(computedHomeTeam, true);
  const rightGradient = getTeamGradient(computedAwayTeam, false);

  const GameInfo = () => (
    <div className="flex flex-col items-center justify-center z-10">
      <p className="text-sm text-gray-600 mb-1">
        {format(new Date(gameDate), 'MMM d, yyyy')}
      </p>
      {isComplete ? (
        <div className="text-2xl font-bold">
          {homeTeamScore} - {awayTeamScore}
        </div>
      ) : (
        <p className="text-lg font-medium">
          {format(new Date(gameDate), 'h:mm a')}
        </p>
      )}
    </div>
  );

  return (
    <Card 
      className={`group w-full mb-4 relative ${!isHeader ? "max-w-2xl transform transition-all duration-300 hover:shadow-lg cursor-pointer" : ""}`}
      onClick={!isHeader ? (() => router.push(`/games/${game.id}`)) : undefined}
    >
      {/* Background gradients */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: leftGradient
        }}
      />
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: rightGradient
        }}
      />
      
      {/* Selection/Outcome Indicators */}
      {selectedTeamId && (
        <>
          {/* Home Team Indicator */}
          {computedHomeTeam.id === selectedTeamId && (
            <div className="absolute -top-3 -left-3 z-20">
              <div className="relative w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ 
                     backgroundColor: isComplete 
                       ? (isSelectedTeamWinner ? '#22C55E' : '#EF4444')
                       : '#000000'
                   }}>
                {isComplete ? (
                  isSelectedTeamWinner ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <X className="w-5 h-5 text-white" />
                  )
                ) : (
                  <Check className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
          )}
          
          {/* Away Team Indicator */}
          {computedAwayTeam.id === selectedTeamId && (
            <div className="absolute -top-3 -right-3 z-20">
              <div className="relative w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ 
                     backgroundColor: isComplete 
                       ? (isSelectedTeamWinner ? '#22C55E' : '#EF4444')
                       : '#000000'
                   }}>
                {isComplete ? (
                  isSelectedTeamWinner ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <X className="w-5 h-5 text-white" />
                  )
                ) : (
                  <Check className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Content */}
      <div className="relative flex flex-col md:grid md:grid-cols-12 items-center p-6">
        <div className="w-full grid grid-cols-2 md:col-span-12 md:grid-cols-12 items-center">
          {/* Home Team - 4 columns on desktop, half width on mobile */}
          <div className="col-span-1 md:col-span-4 flex flex-col md:flex-row md:items-center gap-4 z-10">
            <div className="relative w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center p-2">
              <img
                src={computedHomeTeam.logoUrl}
                alt={`${computedHomeTeam.name} logo`}
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg">{computedHomeTeam.name}</h3>
              <p className="text-sm text-gray-600">{computedHomeTeam.mascot}</p>
            </div>
          </div>

          {/* Game Info - Only visible on desktop */}
          <div className="hidden md:block md:col-span-4">
            <GameInfo />
          </div>

          {/* Away Team - 4 columns on desktop, half width on mobile */}
          <div className="col-span-1 md:col-span-4 flex flex-col-reverse md:flex-row items-end md:items-center justify-end gap-4 z-10">
            <div className="text-right min-w-0">
              <h3 className="font-bold text-lg">{computedAwayTeam.name}</h3>
              <p className="text-sm text-gray-600">{computedAwayTeam.mascot}</p>
            </div>
            <div className="relative w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center p-2">
              <img
                src={computedAwayTeam.logoUrl}
                alt={`${computedAwayTeam.name} logo`}
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Game Info - Only visible on mobile */}
        <div className="w-full mt-4 md:hidden">
          <GameInfo />
        </div>
      </div>

      {/* Hover Arrow */}
      {!isHeader && (
        <div className="absolute right-4 -translate-y-1/2 top-1/2 transition-all duration-300 transform opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-4 z-50">
          <ArrowRight className="w-10 h-10 text-gray-600 text-16" />
        </div>
      )}
    </Card>
  );
};

export default GameCard;
