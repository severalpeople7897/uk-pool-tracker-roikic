
import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import LoadingSpinner from '../../components/LoadingSpinner';
import NetworkStatusBar from '../../components/NetworkStatusBar';
import { colors, commonStyles } from '../../styles/commonStyles';
import { View, Text, ScrollView, StyleSheet, TextInput, RefreshControl, TouchableOpacity } from 'react-native';
import PlayerCard from '../../components/PlayerCard';
import { router, useFocusEffect } from 'expo-router';
import { Player } from '../../types';
import { DataService } from '../../services/dataService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export default function PlayersScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const networkStatus = useNetworkStatus();

  const loadPlayers = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('Loading players...');
      const playersData = await DataService.getPlayers();
      setPlayers(playersData);
      console.log('Players loaded successfully');
    } catch (error) {
      console.log('Error loading players:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load players';
      setError(errorMessage);
      
      if (!networkStatus.isConnected) {
        setError('No internet connection. Please check your network and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [networkStatus.isConnected]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlayers(false);
    setRefreshing(false);
  }, [loadPlayers]);

  const handleRetry = useCallback(() => {
    loadPlayers(true);
  }, [loadPlayers]);

  useFocusEffect(
    useCallback(() => {
      loadPlayers(true);
    }, [loadPlayers])
  );

  // Auto-retry when network comes back online
  useEffect(() => {
    if (networkStatus.isConnected && error) {
      console.log('Network reconnected, retrying...');
      loadPlayers(false);
    }
  }, [networkStatus.isConnected, error, loadPlayers]);

  const handlePlayerPress = useCallback((playerId: string) => {
    router.push(`/player/${playerId}`);
  }, []);

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[commonStyles.container, { paddingTop: insets.top }]}>
        <NetworkStatusBar />
        <LoadingSpinner message="Loading players..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[commonStyles.container, { paddingTop: insets.top }]}>
        <NetworkStatusBar />
        <View style={styles.errorContainer}>
          <Icon name="warning" size={64} color={colors.danger} />
          <Text style={styles.errorTitle}>Failed to load players</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      <NetworkStatusBar />
      <ScrollView 
        style={commonStyles.content}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={commonStyles.section}>
          <View style={styles.header}>
            <Text style={commonStyles.title}>Players</Text>
            <TouchableOpacity
              style={styles.teamsButton}
              onPress={() => router.push('/teams')}
            >
              <Icon name="people" size={20} color={colors.primary} />
              <Text style={styles.teamsButtonText}>Teams</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search players..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                position={player.ranking}
                onPress={() => handlePlayerPress(player.id)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="people" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No players found' : 'No players yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery 
                  ? `No players match "${searchQuery}"` 
                  : 'Players will appear here once they join'}
              </Text>
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
    marginBottom: 20,
  },
  teamsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  teamsButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
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
