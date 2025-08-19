
export interface Player {
  id: string;
  user_id: string;
  name: string;
  email: string;
  games_played: number;
  games_won: number;
  games_lost: number;
  points: number;
  win_percentage: number;
  ranking: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
  status: 'scheduled' | 'completed' | 'in-progress';
  week: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  player1?: Player;
  player2?: Player;
  winner?: Player;
}

export interface LeagueStanding {
  player: Player;
  position: number;
  trend: 'up' | 'down' | 'same';
}

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}
