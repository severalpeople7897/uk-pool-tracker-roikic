
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import Icon from '../../components/Icon';
import LoadingSpinner from '../../components/LoadingSpinner';
import NetworkStatusBar from '../../components/NetworkStatusBar';
import { Player, Match } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { DataService } from '../../services/dataService';
import MatchCard from '../../components/MatchCard';
import Button from '../../components/Button';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [playerMatches, setPlayerMatches] = useState<Match[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const networkStatus = useNetworkStatus();

  const loadProfileData = useCallback(async (showLoading = true) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('Loading profile data...');
      const [players, matches] = await Promise.all([
        DataService.getPlayers(),
        DataService.getMatches(),
      ]);
      
      const currentPlayer = players.find(p => p.user_id === user.id);
      setPlayerData(currentPlayer || null);
      
      if (currentPlayer) {
        const userMatches = matches.filter(
          match => match.player1Id === currentPlayer.id || match.player2Id === currentPlayer.id
        );
        setPlayerMatches(userMatches.slice(-5).reverse()); // Last 5 matches
      }
      console.log('Profile data loaded successfully');
    } catch (error) {
      console.log('Error loading profile data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile data';
      setError(errorMessage);
      
      if (!networkStatus.isConnected) {
        setError('No internet connection. Please check your network and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, networkStatus.isConnected]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfileData(false);
    setRefreshing(false);
  }, [loadProfileData]);

  const handleRetry = useCallback(() => {
    loadProfileData(true);
  }, [loadProfileData]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData(true);
    }, [loadProfileData])
  );

  // Auto-retry when network comes back online
  useEffect(() => {
    if (networkStatus.isConnected && error) {
      console.log('Network reconnected, retrying...');
      loadProfileData(false);
    }
  }, [networkStatus.isConnected, error, loadProfileData]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  }, [logout]);

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
        <NetworkStatusBar />
        <LoadingSpinner message="Loading profile..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[commonStyles.container, { paddingTop: insets.top }]}>
        <NetworkStatusBar />
        <View style={styles.errorContainer}>
          <Icon name="warning" size={64} color={colors.danger} />
          <Text style={styles.errorTitle}>Failed to load profile</Text>
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
          <Text style={commonStyles.title}>Profile</Text>
          
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Icon name="person-circle" size={80} color={colors.primary} />
            </View>
            <Text style={styles.playerName}>{user?.name || 'Unknown Player'}</Text>
            <Text style={styles.playerEmail}>{user?.email}</Text>
          </View>

          {playerData ? (
            <>
              <View style={styles.statsContainer}>
                <StatCard 
                  title="Ranking" 
                  value={`#${playerData.ranking || 'N/A'}`} 
                />
                <StatCard 
                  title="Wins" 
                  value={playerData.wins?.toString() || '0'} 
                />
                <StatCard 
                  title="Losses" 
                  value={playerData.losses?.toString() || '0'} 
                />
                <StatCard 
                  title="Points" 
                  value={playerData.points?.toString() || '0'} 
                />
              </View>

              <Text style={styles.sectionTitle}>Recent Matches</Text>
              {playerMatches.length > 0 ? (
                playerMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon name="trophy" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>No recent matches</Text>
                  <Text style={styles.emptySubtext}>Start playing to see your matches here</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="person" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Profile not found</Text>
              <Text style={styles.emptySubtext}>Your player profile will be created automatically</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Logout"
              onPress={handleLogout}
              style={styles.logoutButton}
              textStyle={styles.logoutButtonText}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  playerName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  playerEmail: {
    fontSize: 16,
    color: colors.textSecondary,
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
  buttonContainer: {
    marginTop: 32,
  },
  logoutButton: {
    backgroundColor: colors.danger,
  },
  logoutButtonText: {
    color: colors.backgroundAlt,
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
