export const teamsByYear = {
  "2024": [
    "Pittsburgh",
    "Toledo",
    "Rutgers",
    "Kansas State",
    "Arkansas State",
    "Bowling Green",
    "Navy",
    "Oklahoma",
    "Georgia Tech",
    "Vanderbilt",
    "Arkansas",
    "Texas Tech",
    "Syracuse",
    "Washington State",
    "USC",
    "Texas A&M",
    "UConn",
    "North Carolina",
    "Boston College",
    "Nebraska",
    "TCU",
    "Louisiana",
    "Miami",
    "Iowa State",
    "Colorado State",
    "Miami (OH)",
    "NC State",
    "East Carolina",
    "BYU",
    "Colorado",
    "Missouri",
    "Iowa",
    "Alabama",
    "Michigan",
    "Louisville",
    "Washington",
    "South Carolina",
    "Illinois",
    "LSU",
    "Baylor",
    "Ole Miss",
    "Duke",
    "Oregon",
    "Penn State",
    "Boise State",
    "Ohio State",
    "Texas",
    "Notre Dame",
    "Arizona State",
    "Tennessee",
    "Georgia",
    "Indiana",
    "SMU",
    "Clemson"
  ]
};

interface CFPGameStructure {
  gameNumber: number;
  dependsOn?: {
    gameNumber: number;
    opponent?: string;
  }[];
}

export const firstRoundByeTeamsByYear = {
  "2024": [
    "Oregon",
    "Georgia",
    "Boise State",
    "Arizona State"
  ]
};

export const cfpStructureByYear: { [year: string]: CFPGameStructure[] } = {
  "2024": [
    { gameNumber: 1 }, // Initial games have no dependencies
    { gameNumber: 2 },
    { gameNumber: 3 },
    { gameNumber: 4 },
    { 
      gameNumber: 5,
      dependsOn: [{ gameNumber: 2, opponent: 'Boise State' }]
    },
    {
      gameNumber: 6,
      dependsOn: [{ gameNumber: 3, opponent: 'Arizona State' }]
    },
    {
      gameNumber: 7,
      dependsOn: [{ gameNumber: 4, opponent: 'Oregon' }]
    },
    {
      gameNumber: 8,
      dependsOn: [{ gameNumber: 1, opponent: 'Georgia' }]
    },
    {
      gameNumber: 9,
      dependsOn: [{ gameNumber: 5 }, { gameNumber: 8 }]
    },
    {
      gameNumber: 10,
      dependsOn: [{ gameNumber: 6 }, { gameNumber: 7 }]
    },
    {
      gameNumber: 11,
      dependsOn: [{ gameNumber: 9 }, { gameNumber: 10 }]
    }
  ]
}