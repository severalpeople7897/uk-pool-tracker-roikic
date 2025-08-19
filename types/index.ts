
export interface Player {
  id: string;
  name: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
  winPercentage: number;
  ranking: number;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  winnerId: string | null;
  date: string;
  status: 'scheduled' | 'completed' | 'in-progress';
  week: number;
}

export interface LeagueStanding {
  player: Player;
  position: number;
  trend: 'up' | 'down' | 'same';
}
