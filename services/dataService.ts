
import { Player, Match } from '../types';
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
          winner:user_profiles!matches_winner_id_fkey(*)
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
    player1_id: string;
    player2_id: string;
    player1_score: number;
    player2_score: number;
    winner_id: string | null;
    created_by: string;
  }): Promise<Match> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([matchData])
        .select(`
          *,
          player1:user_profiles!matches_player1_id_fkey(*),
          player2:user_profiles!matches_player2_id_fkey(*),
          winner:user_profiles!matches_winner_id_fkey(*)
        `)
        .single();

      if (error) {
        console.log('Error adding match:', error);
        throw error;
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
          winner:user_profiles!matches_winner_id_fkey(*)
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
}
