
import { Player, Match, Team, TeamMember, MatchFoul } from '../types';
import { supabase } from '../app/integrations/supabase/client';

class DataServiceError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DataServiceError';
  }
}

export class DataService {
  private static async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`${operationName} - Attempt ${attempt}/${maxRetries}`);
        const result = await operation();
        if (attempt > 1) {
          console.log(`${operationName} - Succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error) {
        lastError = error;
        console.log(`${operationName} - Failed on attempt ${attempt}:`, error);
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`${operationName} - Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new DataServiceError(
      `${operationName} failed after ${maxRetries} attempts`,
      lastError
    );
  }

  static async getPlayers(): Promise<Player[]> {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('points', { ascending: false })
        .order('win_percentage', { ascending: false });

      if (error) {
        console.log('Error getting players:', error);
        throw error;
      }

      // Update rankings
      const playersWithRankings = (data || []).map((player, index) => ({
        ...player,
        ranking: index + 1,
      }));

      console.log(`Successfully loaded ${playersWithRankings.length} players`);
      return playersWithRankings;
    }, 'getPlayers');
  }

  static async getMatches(): Promise<Match[]> {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          player1:user_profiles!matches_player1_id_fkey(*),
          player2:user_profiles!matches_player2_id_fkey(*),
          winner:user_profiles!matches_winner_id_fkey(*),
          team1:teams!matches_team1_id_fkey(
            *,
            members:team_members(
              *,
              player:user_profiles(*)
            )
          ),
          team2:teams!matches_team2_id_fkey(
            *,
            members:team_members(
              *,
              player:user_profiles(*)
            )
          ),
          winning_team:teams!matches_winning_team_id_fkey(
            *,
            members:team_members(
              *,
              player:user_profiles(*)
            )
          ),
          fouls:match_fouls(
            *,
            player:user_profiles(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error getting matches:', error);
        throw error;
      }

      console.log(`Successfully loaded ${(data || []).length} matches`);
      return data || [];
    }, 'getMatches');
  }

  static async addMatch(matchData: {
    player1_id?: string;
    player2_id?: string;
    player1_score: number;
    player2_score: number;
    winner_id?: string | null;
    created_by: string;
    match_type?: 'singles' | 'teams';
    win_method?: 'normal' | 'foul' | 'forfeit' | 'timeout';
    location?: string;
    match_date?: string;
    notes?: string;
    team1_id?: string;
    team2_id?: string;
    winning_team_id?: string | null;
    fouls?: { player_id: string; foul_count: number; foul_details?: string }[];
  }): Promise<Match> {
    return this.withRetry(async () => {
      const { fouls, ...matchInsertData } = matchData;
      
      const { data, error } = await supabase
        .from('matches')
        .insert([matchInsertData])
        .select(`
          *,
          player1:user_profiles!matches_player1_id_fkey(*),
          player2:user_profiles!matches_player2_id_fkey(*),
          winner:user_profiles!matches_winner_id_fkey(*),
          team1:teams!matches_team1_id_fkey(
            *,
            members:team_members(
              *,
              player:user_profiles(*)
            )
          ),
          team2:teams!matches_team2_id_fkey(
            *,
            members:team_members(
              *,
              player:user_profiles(*)
            )
          ),
          winning_team:teams!matches_winning_team_id_fkey(
            *,
            members:team_members(
              *,
              player:user_profiles(*)
            )
          )
        `)
        .single();

      if (error) {
        console.log('Error adding match:', error);
        throw error;
      }

      // Add fouls if provided
      if (fouls && fouls.length > 0) {
        const foulData = fouls.map(foul => ({
          match_id: data.id,
          player_id: foul.player_id,
          foul_count: foul.foul_count,
          foul_details: foul.foul_details || null
        }));

        const { error: foulError } = await supabase
          .from('match_fouls')
          .insert(foulData);

        if (foulError) {
          console.log('Error adding fouls:', foulError);
          // Don't throw here as the match was created successfully
        }
      }

      console.log('Match added successfully:', data.id);
      return data;
    }, 'addMatch');
  }

  static async getPlayerById(id: string): Promise<Player | null> {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.log('Error getting player by id:', error);
        throw error;
      }

      console.log(`Successfully loaded player: ${data?.name}`);
      return data;
    }, 'getPlayerById');
  }

  static async getMatchesForPlayer(playerId: string): Promise<Match[]> {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          player1:user_profiles!matches_player1_id_fkey(*),
          player2:user_profiles!matches_player2_id_fkey(*),
          winner:user_profiles!matches_winner_id_fkey(*),
          team1:teams!matches_team1_id_fkey(
            *,
            members:team_members(
              *,
              player:user_profiles(*)
            )
          ),
          team2:teams!matches_team2_id_fkey(
            *,
            members:team_members(
              *,
              player:user_profiles(*)
            )
          ),
          winning_team:teams!matches_winning_team_id_fkey(
            *,
            members:team_members(
              *,
              player:user_profiles(*)
            )
          ),
          fouls:match_fouls(
            *,
            player:user_profiles(*)
          )
        `)
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error getting matches for player:', error);
        throw error;
      }

      console.log(`Successfully loaded ${(data || []).length} matches for player ${playerId}`);
      return data || [];
    }, 'getMatchesForPlayer');
  }

  // Team management methods
  static async getTeams(): Promise<Team[]> {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            *,
            player:user_profiles(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error getting teams:', error);
        throw error;
      }

      console.log(`Successfully loaded ${(data || []).length} teams`);
      return data || [];
    }, 'getTeams');
  }

  static async createTeam(teamData: {
    name: string;
    created_by: string;
    memberIds: string[];
  }): Promise<Team> {
    return this.withRetry(async () => {
      const { memberIds, ...teamInsertData } = teamData;
      
      const { data: team, error } = await supabase
        .from('teams')
        .insert([teamInsertData])
        .select('*')
        .single();

      if (error) {
        console.log('Error creating team:', error);
        throw error;
      }

      // Add team members
      if (memberIds.length > 0) {
        const memberData = memberIds.map(playerId => ({
          team_id: team.id,
          player_id: playerId
        }));

        const { error: memberError } = await supabase
          .from('team_members')
          .insert(memberData);

        if (memberError) {
          console.log('Error adding team members:', memberError);
          throw memberError;
        }
      }

      // Fetch the complete team with members
      const { data: completeTeam, error: fetchError } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            *,
            player:user_profiles(*)
          )
        `)
        .eq('id', team.id)
        .single();

      if (fetchError) {
        console.log('Error fetching complete team:', fetchError);
        throw fetchError;
      }

      console.log('Team created successfully:', completeTeam.name);
      return completeTeam;
    }, 'createTeam');
  }

  static async getTeamById(id: string): Promise<Team | null> {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            *,
            player:user_profiles(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.log('Error getting team by id:', error);
        throw error;
      }

      console.log(`Successfully loaded team: ${data?.name}`);
      return data;
    }, 'getTeamById');
  }
}
