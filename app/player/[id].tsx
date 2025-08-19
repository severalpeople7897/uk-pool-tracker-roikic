
import React, { useState, useEffect } from 'react';
import Icon from '../../components/Icon';
import { colors, commonStyles } from '../../styles/commonStyles';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import MatchCard from '../../components/MatchCard';
import { useLocalSearchParams, router } from 'expo-router';
import { Player, Match } from '../../types';
import { DataService } from '../../services/dataService';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerMatches, setPlayerMatches] = useState<Match[]>([]);

  useEffect(() => {
    loadPlayerData();
  }, [id]);

  const loadPlayerData = async () => {
    try {
      const [players, matches] = await Promise.all([
        DataService.getPlayers(),
        DataService.getMatches(),
      ]);

      const foundPlayer = players.find(p => p.id === id);
      setPlayer(foundPlayer || null);

      const filteredMatches = matches.filter(
        match => match.player1Id === id || match.player2Id === id
      ).reverse(); // Most recent first
      setPlayerMatches(filteredMatches);
    } catch (error) {
      console.log('Error loading player data:', error);
    }
  };

  if (!player) {
    return (
      <View style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={commonStyles.text}>Player not found</Text>
      </View>
    );
  }

  const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Player Details</Text>
      </View>

      <ScrollView style={commonStyles.content}>
        <View style={commonStyles.section}>
          <View style={styles.playerHeader}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{player.ranking}</Text>
            </View>
            <Text style={styles.playerName}>{player.name}</Text>
          </View>

          <View style={styles.statsGrid}>
            <StatCard title="Games Played" value={player.gamesPlayed.toString()} />
            <StatCard title="Games Won" value={player.gamesWon.toString()} />
            <StatCard title="Games Lost" value={player.gamesLost.toString()} />
            <StatCard title="Win Rate" value={`${player.winPercentage}%`} />
            <StatCard title="Points" value={player.points.toString()} />
            <StatCard title="Ranking" value={`#${player.ranking}`} />
          </View>

          <Text style={styles.sectionTitle}>Match History</Text>
          {playerMatches.length > 0 ? (
            playerMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <Text style={styles.emptyText}>No matches played yet</Text>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  playerHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  rankBadge: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  playerName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
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
    marginTop: 20,
  },
});
