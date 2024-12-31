"use client"
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
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
  winningTeamId?: string;
  predictionMode?: boolean;
  onPredictionSelect?: (teamId: string) => void;
}

export default function GameCard({ 
  game, 
  isHeader, 
  winningTeamId,
  predictionMode = false,
  onPredictionSelect
}: GameCardProps) {
  const { homeTeam, awayTeam, gameDate, homeTeamScore, awayTeamScore, isComplete, name } = game;
  const computedHomeTeam = homeTeam ?? genericTeam;
  const isGenericHomeTeam = Boolean(homeTeam);
  const computedAwayTeam = awayTeam ?? genericTeam;
  const isGenericAwayTeam = Boolean(awayTeam);
  const router = useRouter();

  const isSelectedTeamWinner = isComplete && winningTeamId && winningTeamId === game.winningTeamId;
  const isSelectedTeamLoser = isComplete && winningTeamId && game.winningTeamId && winningTeamId !== game.winningTeamId;

  // Only swap teams when not in prediction mode
  const shouldSwapTeams = !predictionMode && winningTeamId && computedAwayTeam.id === winningTeamId;
  
  // Define left and right teams based on selection
  const leftTeam = shouldSwapTeams ? computedAwayTeam : computedHomeTeam;
  const rightTeam = shouldSwapTeams ? computedHomeTeam : computedAwayTeam;
  
  // Adjust scores if teams are swapped
  const leftScore = shouldSwapTeams ? awayTeamScore : homeTeamScore;
  const rightScore = shouldSwapTeams ? homeTeamScore : awayTeamScore;

  const handleTeamClick = (teamId: string, e: React.MouseEvent) => {
    if (predictionMode && onPredictionSelect) {
      e.stopPropagation();
      onPredictionSelect(teamId);
    }
  };

  // Helper function to get team gradient based on conditions
  const getTeamGradient = (team: Team, isLeft: boolean) => {
    const direction = isLeft ? '135deg' : '-45deg';
    
    if (predictionMode) {
      const isSelected = team.id === winningTeamId;
      if (isSelected) {
        return `linear-gradient(${direction}, ${team.primaryColor} 0%, ${team.primaryColor} 30%, transparent 70%)`;
      }
      return `linear-gradient(${direction}, #FFFFFF 0%, #FFFFFF 30%, transparent 70%)`;
    }

    const defaultGradient = isLeft
      ? `linear-gradient(${direction}, ${team.primaryColor} 0%, ${isGenericHomeTeam ? team.primaryColor : team.secondaryColor} 30%, transparent 70%)`
      : `linear-gradient(${direction}, ${team.primaryColor} 0%, ${isGenericAwayTeam? team.primaryColor : team.secondaryColor} 30%, transparent 70%)`;
    
    if (!winningTeamId) return defaultGradient;

    const isSelectedTeam = team.id === winningTeamId;

    if (!isComplete) {
      if (isSelectedTeam) {
        return defaultGradient;
      }
      return `linear-gradient(${direction}, #FFFFFF 0%, #FFFFFF 30%, transparent 70%)`;
    }

    if (isSelectedTeam) {
      if (isSelectedTeamWinner) {
        return `linear-gradient(${direction}, #22C55E 0%, #22C55E 30%, transparent 70%)`;
      }
      if (isSelectedTeamLoser) {
        return `linear-gradient(${direction}, #E41B17 0%, #E41B17 30%, transparent 70%)`;
      }
    }

    return `linear-gradient(${direction}, #FFFFFF 0%, #FFFFFF 30%, transparent 70%)`;
  };

  const leftGradient = getTeamGradient(leftTeam, true);
  const rightGradient = getTeamGradient(rightTeam, false);

  const GameInfo = () => (
    <div className="flex flex-col items-center justify-center z-10">
      <p className="text-sm text-gray-600 mb-1">
        {format(new Date(gameDate), 'MMM d, yyyy')}
      </p>
      {isComplete ? (
        <div className="text-2xl font-bold">
          {leftScore} - {rightScore}
        </div>
      ) : (
        <p className="text-lg font-medium">
          {format(new Date(gameDate), 'h:mm a')}
        </p>
      )}
    </div>
  );

  const SelectionCircle = ({ team, position }: { team: Team, position: 'left' | 'right' }) => {
    const isSelected = team.id === winningTeamId;
    return (
      <div 
        className={`absolute -top-3 ${position === 'left' ? '-left-3' : '-right-3'} z-20`}
      >
        <div 
          className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center
            ${isSelected ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}
        >
          {isSelected && <Check className="w-5 h-5 text-white" />}
        </div>
      </div>
    );
  };

  return (
    <Card 
      className={`group w-full mb-4 relative ${!isHeader ? "max-w-2xl transform transition-all duration-300 hover:shadow-lg cursor-pointer" : ""}`}
      onClick={!isHeader && !predictionMode ? (() => router.push(`/games/${game.id}`)) : undefined}
    >
      {/* Background gradients */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{ background: leftGradient }}
      />
      <div 
        className="absolute inset-0 opacity-20"
        style={{ background: rightGradient }}
      />
      
      {/* Selection Circles for Prediction Mode */}
      {predictionMode && (
        <>
          <SelectionCircle team={leftTeam} position="left" />
          <SelectionCircle team={rightTeam} position="right" />
        </>
      )}
      
      {/* Regular Selection/Outcome Indicators */}
      {!predictionMode && winningTeamId && (
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
      
      {/* Content */}
      <div className="relative flex flex-col md:grid md:grid-cols-12 items-center p-6">
        <div className="w-full grid grid-cols-2 md:col-span-12 md:grid-cols-12 items-center">
          {/* Left Team */}
          <div 
            className="col-span-1 md:col-span-4 flex flex-col md:flex-row md:items-center gap-4 z-10"
            onClick={predictionMode ? (e) => handleTeamClick(leftTeam.id, e) : undefined}
            style={{ cursor: predictionMode ? 'pointer' : 'default' }}
          >
            <div className="relative w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center p-2">
              <img
                src={leftTeam.logoUrl}
                alt={`${leftTeam.name} logo`}
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg">{leftTeam.name}</h3>
              <p className="text-sm text-gray-600">{leftTeam.mascot}</p>
            </div>
          </div>

          {/* Game Info - Desktop */}
          <div className="hidden md:block md:col-span-4">
            <GameInfo />
          </div>

          {/* Right Team */}
          <div 
            className="col-span-1 md:col-span-4 flex flex-col-reverse md:flex-row items-end md:items-center justify-end gap-4 z-10"
            onClick={predictionMode ? (e) => handleTeamClick(rightTeam.id, e) : undefined}
            style={{ cursor: predictionMode ? 'pointer' : 'default' }}
          >
            <div className="text-right min-w-0">
              <h3 className="font-bold text-lg">{rightTeam.name}</h3>
              <p className="text-sm text-gray-600">{rightTeam.mascot}</p>
            </div>
            <div className="relative w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center p-2">
              <img
                src={rightTeam.logoUrl}
                alt={`${rightTeam.name} logo`}
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Game Info - Mobile */}
        <div className="w-full mt-4 md:hidden">
          <GameInfo />
        </div>

        {/* Game Name Row */}
        <div className="w-full md:col-span-8 md:col-start-3 mt-2">
          <h2 className="text-sm text-center text-gray-800">{name}</h2>
        </div>
      </div>

      {/* Hover Arrow (only show when not in prediction mode) */}
      {!isHeader && !predictionMode && (
        <div className="absolute right-4 -translate-y-1/2 top-1/2 transition-all duration-300 transform opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-4 z-50">
          <ArrowRight className="w-10 h-10 text-gray-600 text-16" />
        </div>
      )}
    </Card>
  );
}

export function GameCardSkeleton({ isHeader }: { isHeader?: boolean }) {
  return (
    <Card 
      className={`w-full mb-4 relative ${!isHeader ? "max-w-2xl" : ""}`}
    >
      <div className="relative flex flex-col md:grid md:grid-cols-12 items-center p-6">
        {/* Game Name Skeleton */}
        <div className="w-full md:col-span-12 mb-4">
          <Skeleton className="h-7 w-64 mx-auto" />
        </div>

        <div className="w-full grid grid-cols-2 md:col-span-12 md:grid-cols-12 items-center">
          {/* Home Team */}
          <div className="col-span-1 md:col-span-4 flex flex-col md:flex-row md:items-center gap-4 z-10">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Game Info - Desktop */}
          <div className="hidden md:block md:col-span-4">
            <div className="flex flex-col items-center justify-center">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>

          {/* Away Team */}
          <div className="col-span-1 md:col-span-4 flex flex-col-reverse md:flex-row items-end md:items-center justify-end gap-4 z-10">
            <div className="text-right min-w-0 space-y-2">
              <Skeleton className="h-6 w-32 ml-auto" />
              <Skeleton className="h-4 w-24 ml-auto" />
            </div>
            <Skeleton className="w-16 h-16 rounded-full" />
          </div>
        </div>

        {/* Game Info - Mobile */}
        <div className="w-full mt-4 md:hidden">
          <div className="flex flex-col items-center justify-center">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
}
