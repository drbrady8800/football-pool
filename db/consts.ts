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
  ],
  "2025": [
    "Minnesota",
    "New Mexico",
    "UTSA",
    "Florida International",
    "Pittsburgh",
    "East Carolina",
    "Penn State",
    "Clemson",
    "UConn",
    "Army",
    "BYU",
    "Georgia Tech",
    "Fresno State",
    "Miami (OH)",
    "North Texas",
    "San Diego State",
    "Missouri",
    "Virginia",
    "Houston",
    "LSU",
    "App State",
    "Georgia Southern",
    "Louisiana Tech",
    "Coastal Carolina",
    "Illinois",
    "Tennessee",
    "USC",
    "TCU",
    "Vanderbilt",
    "Iowa",
    "Duke",
    "Arizona State",
    "Texas",
    "Michigan",
    "Utah",
    "Nebraska",
    "Texas State",
    "Rice",
    "Navy",
    "Cincinnati",
    "Mississippi State",
    "Wake Forest",
    "Arizona",
    "SMU",
    "Oklahoma",
    "Alabama",
    "Texas A&M",
    "Miami",
    "Ole Miss",
    "Tulane",
    "Oregon",
    "James Madison",
    "Ohio State",
    "Texas Tech",
    "Indiana",
    "Georgia"
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
  ],
  "2025": [
    "Indiana",
    "Ohio State",
    "Georgia",
    "Texas Tech"
  ]
};

export const cfpStructureByYear: { [year: string]: CFPGameStructure[] } = {
  "2024": [
    { gameNumber: 1 },
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
  ],
  "2025": [

    { gameNumber: 1 },
    { gameNumber: 2 },
    { gameNumber: 3 },
    { gameNumber: 4 },
    { 
      gameNumber: 5,
      dependsOn: [{ gameNumber: 2, opponent: 'Ohio State' }]
    },
    {
      gameNumber: 6,
      dependsOn: [{ gameNumber: 4, opponent: 'Texas Tech' }]
    },
    {
      gameNumber: 7,
      dependsOn: [{ gameNumber: 1, opponent: 'Indiana' }]
    },
    {
      gameNumber: 8,
      dependsOn: [{ gameNumber: 3, opponent: 'Georgia' }]
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