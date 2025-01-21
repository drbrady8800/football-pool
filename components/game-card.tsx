"use client"
import * as React from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Check, X, ArrowRight } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type GameWithTeams, type Team } from '@/db/types';

// Common types
export type GameStatus = 'correct' | 'incorrect' | 'pending' | 'none';

export const genericTeam = {
  id: 'N/A',
  name: 'TBD',
  mascot: 'TBD',
  logoUrl: '/placeholder-logo.svg',
  primaryColor: '#111111',
  secondaryColor: '#e2e2e2',
};

// Shared components
const PickIndicator = ({ status }: { status: GameStatus }) => {
  if (status === 'none') return null;
  
  const color = status === 'correct' ? '#22C55E' : status === 'incorrect' ? '#EF4444' : '#000000';
  const icon = status === 'incorrect' ? <X className="w-5 h-5 text-white" /> : <Check className="w-5 h-5 text-white" />;

  return (
    <div className="absolute -top-3 -left-3 z-20">
      <div className="relative w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
        {icon}
      </div>
    </div>
  );
};

const SelectionCircle = ({ isSelected, position }: { isSelected: boolean; position: 'left' | 'right' }) => (
  <div className={`absolute -top-3 ${position === 'left' ? '-left-3' : '-right-3'} z-20`}>
    <div className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center
      ${isSelected ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}>
      {isSelected && <Check className="w-5 h-5 text-white" />}
    </div>
  </div>
);

// Base Game Card
interface BaseGameCardProps {
  game: GameWithTeams;
  forceIncorrectPick?: boolean;
  status?: GameStatus;
  className?: string;
  onClick?: () => void;
  selectedTeamId?: string;
  selectable?: boolean;
  onTeamSelect?: (teamId: string) => void;
}

export function BaseGameCard({
  game,
  forceIncorrectPick,
  status = 'none',
  className = '',
  onClick,
  selectedTeamId,
  selectable = false,
  onTeamSelect,
}: BaseGameCardProps) {
  const { homeTeam, awayTeam, gameDate, homeTeamScore, awayTeamScore, isComplete, name, winningTeamId } = game;
  const computedHomeTeam = homeTeam ?? genericTeam;
  const computedAwayTeam = awayTeam ?? genericTeam;
  
  // Only switch positions if it's not a selectable card (i.e., PlayerGameCard) and has a selectedTeamId
  const shouldSwitchPositions = !selectable && selectedTeamId !== undefined;
  
  const leftTeam = shouldSwitchPositions
    ? (computedHomeTeam.id === selectedTeamId ? computedHomeTeam : computedAwayTeam)
    : computedHomeTeam;
    
  const rightTeam = shouldSwitchPositions
    ? (computedHomeTeam.id === selectedTeamId ? computedAwayTeam : computedHomeTeam)
    : computedAwayTeam;
    
  const leftTeamScore = shouldSwitchPositions
    ? (computedHomeTeam.id === selectedTeamId ? homeTeamScore : awayTeamScore)
    : homeTeamScore;
    
  const rightTeamScore = shouldSwitchPositions
    ? (computedHomeTeam.id === selectedTeamId ? awayTeamScore : homeTeamScore)
    : awayTeamScore;

  const isGenericHomeTeam = !homeTeam;
  const isGenericAwayTeam = !awayTeam;

  const handleTeamClick = (teamId: string, e: React.MouseEvent) => {
    if (selectable && onTeamSelect) {
      e.stopPropagation();
      onTeamSelect(teamId);
    }
  };

  // Helper function to get team gradient based on conditions
  const getTeamGradient = (team: Team, isLeft: boolean) => {
    const direction = isLeft ? '135deg' : '-45deg';

    const whiteGradient = `linear-gradient(${direction}, #FFFFFF 0%, #FFFFFF 30%, transparent 70%)`;
    const correctGradient = `linear-gradient(${direction}, #22C55E 0%, #22C55E 30%, transparent 70%)`;
    const incorrectGradient = `linear-gradient(${direction}, #E41B17 0%, #E41B17 30%, transparent 70%)`;

    if (forceIncorrectPick && isLeft) {
      return incorrectGradient;
    }
    
    if (selectable) {
      const isSelected = team.id === selectedTeamId;
      if (isSelected) {
        return `linear-gradient(${direction}, ${team.primaryColor} 0%, ${team.primaryColor} 30%, transparent 70%)`;
      }
      return whiteGradient;
    }

    const defaultGradient = isLeft
      ? `linear-gradient(${direction}, ${team.primaryColor} 0%, ${isGenericHomeTeam ? team.secondaryColor : team.primaryColor} 30%, transparent 70%)`
      : `linear-gradient(${direction}, ${team.primaryColor} 0%, ${isGenericAwayTeam ? team.secondaryColor : team.primaryColor} 30%, transparent 70%)`;
    
    if (!selectedTeamId) return defaultGradient;

    const isSelectedTeam = team.id === selectedTeamId;

    if (!isComplete) {
      if (isSelectedTeam) {
        return defaultGradient;
      }
      return whiteGradient;
    }

    if (isSelectedTeam) {
      if (selectedTeamId === winningTeamId) {
        return correctGradient;
      }
      return incorrectGradient;
    }

    return whiteGradient;
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
          {leftTeamScore} - {rightTeamScore}
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
      className={`relative w-full mb-4 ${className}`}
      onClick={onClick}
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

      {status !== 'none' && <PickIndicator status={status} />}
      
      {selectable && (
        <>
          <SelectionCircle isSelected={selectedTeamId === leftTeam.id} position="left" />
          <SelectionCircle isSelected={selectedTeamId === rightTeam.id} position="right" />
        </>
      )}
      
      <div className="relative flex flex-col md:grid md:grid-cols-12 items-center p-6">
        <div className="w-full grid grid-cols-2 md:col-span-12 md:grid-cols-12 items-center">
          {/* Home Team */}
          <div 
            className={`col-span-1 md:col-span-4 flex flex-col md:flex-row md:items-center gap-4 z-10 ${selectable ? 'cursor-pointer' : ''}`}
            onClick={selectable ? (e) => handleTeamClick(leftTeam.id, e) : undefined}
          >
            <div className="relative w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center p-2">
              <img src={leftTeam.logoUrl} alt={`${leftTeam.name} logo`} className="w-12 h-12 object-contain" />
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

          {/* Away Team */}
          <div 
            className={`col-span-1 md:col-span-4 flex flex-col-reverse md:flex-row items-end md:items-center justify-end gap-4 z-10 ${selectable ? 'cursor-pointer' : ''}`}
            onClick={selectable ? (e) => handleTeamClick(rightTeam.id, e) : undefined}
          >
            <div className="text-right min-w-0">
              <h3 className="font-bold text-lg">{rightTeam.name}</h3>
              <p className="text-sm text-gray-600">{rightTeam.mascot}</p>
            </div>
            <div className="relative w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center p-2">
              <img src={rightTeam.logoUrl} alt={`${rightTeam.name} logo`} className="w-12 h-12 object-contain" />
            </div>
          </div>
        </div>

        {/* Game Info - Mobile */}
        <div className="w-full mt-4 md:hidden">
          <GameInfo />
        </div>

        {/* Game Name Row */}
        {name && (
          <div className="w-full md:col-span-8 md:col-start-3 mt-2">
            <h2 className="text-sm text-center text-gray-800">{name}</h2>
          </div>
        )}
      </div>

      {onClick && (
        <div className="absolute right-4 -translate-y-1/2 top-1/2 transition-all duration-300 transform opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-4 z-50">
          <ArrowRight className="w-10 h-10 text-gray-600" />
        </div>
      )}
    </Card>
  );
}

// Pickable Game Card
interface PickableGameCardProps {
  game: GameWithTeams;
  selectedTeamId?: string;
  onTeamSelect: (teamId: string) => void;
}

export function PickableGameCard({
  game,
  selectedTeamId,
  onTeamSelect,
}: PickableGameCardProps) {
  return (
    <BaseGameCard
      game={game}
      selectable={true}
      selectedTeamId={selectedTeamId}
      onTeamSelect={onTeamSelect}
    />
  );
}

// Player Game Card
interface PlayerGameCardProps {
  game: GameWithTeams;
  selectedWinningTeam: Team;
  selectedLosingTeam: Team;
  eliminatedTeams: string[];
}

export function PlayerGameCard({
  game,
  selectedWinningTeam,
  selectedLosingTeam,
  eliminatedTeams,
}: PlayerGameCardProps) {
  const router = useRouter();
  
  const gameTeamsSet = new Set([game.homeTeam?.id, game.awayTeam?.id]);
  let status: GameStatus = 'none';
  let forceIncorrectPick = false;

  if (!game.isComplete) {
    status = 'pending';
  } else if (selectedWinningTeam.id === game.winningTeamId) {
    status = 'correct';
  } else {
    status = 'incorrect';
  }

  if (eliminatedTeams.includes(selectedWinningTeam.id) && !game.isComplete) {
    forceIncorrectPick = true;
    status = 'incorrect';
  }

  if (
    (!game.homeTeam || !game.awayTeam) ||
    (!game.isComplete && (!gameTeamsSet.has(selectedWinningTeam.id) || !gameTeamsSet.has(selectedLosingTeam.id)))
  ) {
    game.homeTeam = selectedWinningTeam;
    game.awayTeam = selectedLosingTeam;
  }

  return (
    <BaseGameCard
      game={game}
      forceIncorrectPick={forceIncorrectPick}
      status={status}
      selectedTeamId={selectedWinningTeam.id}
      className="max-w-2xl transform transition-all duration-300 hover:shadow-lg cursor-pointer group"
      onClick={() => router.push(`/games/${game.id}`)}
    />
  );
}

// Info Game Card
interface InfoGameCardProps {
  game: GameWithTeams;
  isHeader?: boolean;
}

export function InfoGameCard({
  game,
  isHeader = false,
}: InfoGameCardProps) {
  const router = useRouter();

  return (
    <BaseGameCard
      game={game}
      className={`${isHeader ? '' : 'max-w-2xl transform transition-all duration-300 hover:shadow-lg cursor-pointer group'}`}
      onClick={!isHeader ? () => router.push(`/games/${game.id}`) : undefined}
    />
  );
}

export function GameCardSkeleton({ isHeader }: { isHeader?: boolean }) {
  return (
    <Card 
      className={`w-full mb-4 relative ${!isHeader ? "max-w-2xl" : ""}`}
    >
      <div className="relative flex flex-col md:grid md:grid-cols-12 items-center p-6">        
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

        {/* Game Name Row Desktop */}
        <div className="w-full md:col-span-12 mt-4 hidden md:block">
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        {/* Game Info - Mobile */}
        <div className="w-full mt-4 md:hidden">
          <div className="flex flex-col items-center justify-center">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        {/* Game Name Row Mobile */}
        <div className="w-full md:col-span-12 mt-4 md:hidden block">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </Card>
  );
}
