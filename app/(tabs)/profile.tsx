
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import Icon from '../../components/Icon';
import { Player, Match } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { DataService } from '../../services/dataService';
import MatchCard from '../../components/MatchCard';
import Button from '../../components/Button';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [playerMatches, setPlayerMatches] = useState<Match[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const loadProfileData = async () => {
    if (!user?.id) return;
    
    try {
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
    } catch (error) {
      console.log('Error loading profile data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [user?.id])
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
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

          {playerData && (
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
                <Text style={styles.emptyText}>No recent matches</Text>
              )}
            </>
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
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
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
});
