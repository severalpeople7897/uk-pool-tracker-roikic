
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
  // Enhanced logging fields
  match_type: 'singles' | 'teams';
  win_method: 'normal' | 'foul' | 'forfeit' | 'timeout' | null;
  location: string | null;
  match_date: string;
  notes: string | null;
  // Team support
  team1_id: string | null;
  team2_id: string | null;
  winning_team_id: string | null;
  // Joined data
  player1?: Player;
  player2?: Player;
  winner?: Player;
  team1?: Team;
  team2?: Team;
  winning_team?: Team;
  fouls?: MatchFoul[];
}

export interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  player_id: string;
  created_at: string;
  player?: Player;
}

export interface MatchFoul {
  id: string;
  match_id: string;
  player_id: string;
  foul_count: number;
  foul_details: string | null;
  created_at: string;
  player?: Player;
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
