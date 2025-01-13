export type Standing = {
  userId: string;
  name: string;
  totalPicks: number;
  points: number;
  predictionPoints: number;
  predictionDifference?: number;
  maxPoints?: number;
}

export type StandingChartColumn = {
  game: string;
  [key: string]: string | number; // User IDs as keys with their points
};

export type Prediction = {
  userId: string;
  score: number;
};
