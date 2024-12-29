export type Standing = {
  userId: string;
  name: string;
  correctPicks: number;
  totalPicks: number;
  points: number;
}

export type StandingChartColumn = {
  game: string;
  [key: string]: string | number; // User IDs as keys with their points
};
