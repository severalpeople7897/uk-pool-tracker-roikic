
import Icon from '../../components/Icon';
import LoadingSpinner from '../../components/LoadingSpinner';
import NetworkStatusBar from '../../components/NetworkStatusBar';
import { Player, Match } from '../../types';
import { useLocalSearchParams, router } from 'expo-router';
import MatchCard from '../../components/MatchCard';
import { DataService } from '../../services/dataService';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerMatches, setPlayerMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const networkStatus = useNetworkStatus();

  const loadPlayerData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Loading player data for ID: ${id}`);
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
      console.log('Player data loaded successfully');
    } catch (error) {
      console.log('Error loading player data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load player data';
      setError(errorMessage);
      
      if (!networkStatus.isConnected) {
        setError('No internet connection. Please check your network and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, networkStatus.isConnected]);

  const handleRetry = useCallback(() => {
    loadPlayerData();
  }, [loadPlayerData]);

  useEffect(() => {
    loadPlayerData();
  }, [loadPlayerData]);

  // Auto-retry when network comes back online
  useEffect(() => {
    if (networkStatus.isConnected && error) {
      console.log('Network reconnected, retrying...');
      loadPlayerData();
    }
  }, [networkStatus.isConnected, error, loadPlayerData]);

  const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={[commonStyles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>Player Details</Text>
          <View style={styles.placeholder} />
        </View>
        <NetworkStatusBar />
        <LoadingSpinner message="Loading player..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[commonStyles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>Player Details</Text>
          <View style={styles.placeholder} />
        </View>
        <NetworkStatusBar />
        <View style={styles.errorContainer}>
          <Icon name="warning" size={64} color={colors.danger} />
          <Text style={styles.errorTitle}>Failed to load player</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <NetworkStatusBar />
        <View style={[commonStyles.centerContent, { flex: 1 }]}>
          <Icon name="person" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Player not found</Text>
          <Text style={styles.emptySubtext}>This player may have been removed</Text>
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
      <NetworkStatusBar />

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
            <View style={styles.emptyContainer}>
              <Icon name="trophy" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No matches found</Text>
              <Text style={styles.emptySubtext}>This player hasn&apos;t played any matches yet</Text>
            </View>
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.backgroundAlt,
    fontSize: 16,
    fontWeight: '600',
  },
});
