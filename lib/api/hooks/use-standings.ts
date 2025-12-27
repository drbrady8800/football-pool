import { useQuery, useMutation } from '@tanstack/react-query';
import { getStandings, getStandingsChartData, getHypotheticalStandings } from '../standings';
import { type Standing, type StandingChartColumn } from '@/lib/types';

export function useStandings(year: number, numGames?: number) {
  return useQuery<Standing[]>({
    queryKey: ['standings', year, numGames],
    queryFn: () => getStandings({ year, numGames }),
  });
}

export function useStandingsChart(year: number) {
  return useQuery<StandingChartColumn[]>({
    queryKey: ['standings-chart', year],
    queryFn: () => getStandingsChartData(year),
  });
}

export function useHypotheticalStandings() {
  return useMutation<Standing[], Error, { predictions: Record<string, string>; totalScorePrediction?: number; year: number }>({
    mutationFn: ({ predictions, totalScorePrediction, year }) =>
      getHypotheticalStandings(predictions, totalScorePrediction, year),
  });
}
