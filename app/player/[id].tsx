
import Icon from '../../components/Icon';
import { Player, Match } from '../../types';
import { useLocalSearchParams, router } from 'expo-router';
import MatchCard from '../../components/MatchCard';
import { DataService } from '../../services/dataService';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerMatches, setPlayerMatches] = useState<Match[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (id) {
      loadPlayerData();
    }
  }, [id]);

  const loadPlayerData = async () => {
    try {
      const [players, matches] = await Promise.all([
        DataService.getPlayers(),
        DataService.getMatches(),
      ]);
      
      const currentPlayer = players.find(p => p.id === id);
      setPlayer(currentPlayer || null);
      
      if (currentPlayer) {
        const userMatches = matches.filter(
          match => match.player1Id === currentPlayer.id || match.player2Id === currentPlayer.id
        );
        setPlayerMatches(userMatches.reverse()); // Most recent first
      }
    } catch (error) {
      console.log('Error loading player data:', error);
    }
  };

  const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (!player) {
    return (
      <View style={[commonStyles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>Player Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={[commonStyles.centerContent, { flex: 1 }]}>
          <Text style={styles.emptyText}>Player not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.title}>Player Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={commonStyles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={commonStyles.section}>
          <View style={styles.playerHeader}>
            <View style={styles.avatarContainer}>
              <Icon name="person-circle" size={80} color={colors.primary} />
            </View>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerRanking}>Rank #{player.ranking || 'N/A'}</Text>
          </View>

          <View style={styles.statsContainer}>
            <StatCard 
              title="Wins" 
              value={player.wins?.toString() || '0'} 
            />
            <StatCard 
              title="Losses" 
              value={player.losses?.toString() || '0'} 
            />
            <StatCard 
              title="Points" 
              value={player.points?.toString() || '0'} 
            />
            <StatCard 
              title="Win Rate" 
              value={player.wins && player.losses ? 
                `${Math.round((player.wins / (player.wins + player.losses)) * 100)}%` : 
                '0%'
              } 
            />
          </View>

          <Text style={styles.sectionTitle}>Match History</Text>
          {playerMatches.length > 0 ? (
            playerMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <Text style={styles.emptyText}>No matches found</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  playerHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  playerName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  playerRanking: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: '22%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
