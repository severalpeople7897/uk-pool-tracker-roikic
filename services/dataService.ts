
import { Player, Match, Team, TeamMember, MatchFoul } from '../types';
import { supabase } from '../app/integrations/supabase/client';

export class DataService {
  static async getPlayers(): Promise<Player[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('points', { ascending: false })
        .order('win_percentage', { ascending: false });

      if (error) {
        console.log('Error getting players:', error);
        return [];
      }

      // Update rankings
      const playersWithRankings = (data || []).map((player, index) => ({
        ...player,
        ranking: index + 1,
      }));

      return playersWithRankings;
    } catch (error) {
      console.log('Error getting players:', error);
      return [];
    }
  }

  static async getMatches(): Promise<Match[]> {
    try {
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
        return [];
      }

      return data || [];
    } catch (error) {
      console.log('Error getting matches:', error);
      return [];
    }
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
    try {
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
        }
      }

      console.log('Match added:', data);
      return data;
    } catch (error) {
      console.log('Error adding match:', error);
      throw error;
    }
  }



  static async getPlayerById(id: string): Promise<Player | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.log('Error getting player by id:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.log('Error getting player by id:', error);
      return null;
    }
  }

  static async getMatchesForPlayer(playerId: string): Promise<Match[]> {
    try {
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
        return [];
      }

      return data || [];
    } catch (error) {
      console.log('Error getting matches for player:', error);
      return [];
    }
  }

  // Team management methods
  static async getTeams(): Promise<Team[]> {
    try {
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
        return [];
      }

      return data || [];
    } catch (error) {
      console.log('Error getting teams:', error);
      return [];
    }
  }

  static async createTeam(teamData: {
    name: string;
    created_by: string;
    memberIds: string[];
  }): Promise<Team> {
    try {
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

      return completeTeam;
    } catch (error) {
      console.log('Error creating team:', error);
      throw error;
    }
  }

  static async getTeamById(id: string): Promise<Team | null> {
    try {
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
        return null;
      }

      return data;
    } catch (error) {
      console.log('Error getting team by id:', error);
      return null;
    }
  }
}
