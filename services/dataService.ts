
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player, Match } from '../types';
import { mockPlayers, mockMatches } from '../data/mockData';

const STORAGE_KEYS = {
  PLAYERS: '@pool_league_players',
  MATCHES: '@pool_league_matches',
  INITIALIZED: '@pool_league_initialized',
};

export class DataService {
  static async initializeData() {
    try {
      const initialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!initialized) {
        await AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(mockPlayers));
        await AsyncStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(mockMatches));
        await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
        console.log('Data initialized with mock data');
      }
    } catch (error) {
      console.log('Error initializing data:', error);
    }
  }

  static async getPlayers(): Promise<Player[]> {
    try {
      const playersJson = await AsyncStorage.getItem(STORAGE_KEYS.PLAYERS);
      return playersJson ? JSON.parse(playersJson) : [];
    } catch (error) {
      console.log('Error getting players:', error);
      return [];
    }
  }

  static async getMatches(): Promise<Match[]> {
    try {
      const matchesJson = await AsyncStorage.getItem(STORAGE_KEYS.MATCHES);
      return matchesJson ? JSON.parse(matchesJson) : [];
    } catch (error) {
      console.log('Error getting matches:', error);
      return [];
    }
  }

  static async addMatch(match: Omit<Match, 'id'>): Promise<Match> {
    try {
      const matches = await this.getMatches();
      const newMatch: Match = {
        ...match,
        id: Date.now().toString(),
      };
      
      matches.push(newMatch);
      await AsyncStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
      
      // Update player statistics
      await this.updatePlayerStats();
      
      console.log('Match added:', newMatch);
      return newMatch;
    } catch (error) {
      console.log('Error adding match:', error);
      throw error;
    }
  }

  static async updatePlayerStats() {
    try {
      const players = await this.getPlayers();
      const matches = await this.getMatches();
      
      // Reset stats
      const updatedPlayers = players.map(player => ({
        ...player,
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        points: 0,
        winPercentage: 0,
      }));

      // Calculate stats from completed matches
      const completedMatches = matches.filter(match => match.status === 'completed');
      
      completedMatches.forEach(match => {
        const player1 = updatedPlayers.find(p => p.id === match.player1Id);
        const player2 = updatedPlayers.find(p => p.id === match.player2Id);
        
        if (player1) {
          player1.gamesPlayed++;
          if (match.winnerId === player1.id) {
            player1.gamesWon++;
            player1.points += 3; // 3 points for a win
          } else {
            player1.gamesLost++;
          }
        }
        
        if (player2) {
          player2.gamesPlayed++;
          if (match.winnerId === player2.id) {
            player2.gamesWon++;
            player2.points += 3; // 3 points for a win
          } else {
            player2.gamesLost++;
          }
        }
      });

      // Calculate win percentages and rankings
      updatedPlayers.forEach(player => {
        if (player.gamesPlayed > 0) {
          player.winPercentage = Math.round((player.gamesWon / player.gamesPlayed) * 100);
        }
      });

      // Sort by points, then by win percentage
      updatedPlayers.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.winPercentage - a.winPercentage;
      });

      // Update rankings
      updatedPlayers.forEach((player, index) => {
        player.ranking = index + 1;
      });

      await AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updatedPlayers));
      console.log('Player stats updated');
    } catch (error) {
      console.log('Error updating player stats:', error);
    }
  }

  static async addPlayer(name: string): Promise<Player> {
    try {
      const players = await this.getPlayers();
      const newPlayer: Player = {
        id: Date.now().toString(),
        name,
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        points: 0,
        winPercentage: 0,
        ranking: players.length + 1,
      };
      
      players.push(newPlayer);
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
      
      console.log('Player added:', newPlayer);
      return newPlayer;
    } catch (error) {
      console.log('Error adding player:', error);
      throw error;
    }
  }
}
