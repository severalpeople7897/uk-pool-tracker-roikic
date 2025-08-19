
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../contexts/AuthContext';
import { DataService } from '../../services/dataService';
import { Player, Match } from '../../types';
import { useFocusEffect } from 'expo-router';
import MatchCard from '../../components/MatchCard';
import Button from '../../components/Button';
import Icon from '../../components/Icon';

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const [playerProfile, setPlayerProfile] = useState<Player | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      const players = await DataService.getPlayers();
      const userPlayer = players.find(p => p.user_id === user.id);
      setPlayerProfile(userPlayer || null);

      if (userPlayer) {
        const matches = await DataService.getMatchesForPlayer(userPlayer.id);
        setRecentMatches(matches.slice(0, 5)); // Last 5 matches
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
    }, [user])
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
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
    <View style={commonStyles.container}>
      <ScrollView 
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={commonStyles.section}>
          <Text style={commonStyles.title}>My Profile</Text>
          
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Icon name="person" size={40} color={colors.primary} />
            </View>
            <Text style={styles.userName}>{user?.name || user?.email}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          {playerProfile ? (
            <>
              <View style={styles.rankContainer}>
                <Text style={styles.rankText}>League Ranking</Text>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankNumber}>#{playerProfile.ranking}</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <StatCard title="Games Played" value={playerProfile.games_played.toString()} />
                <StatCard title="Games Won" value={playerProfile.games_won.toString()} />
                <StatCard title="Games Lost" value={playerProfile.games_lost.toString()} />
                <StatCard title="Win Rate" value={`${playerProfile.win_percentage}%`} />
                <StatCard title="Points" value={playerProfile.points.toString()} />
                <StatCard title="Total Matches" value={recentMatches.length.toString()} />
              </View>

              <Text style={styles.sectionTitle}>Recent Matches</Text>
              {recentMatches.length > 0 ? (
                recentMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))
              ) : (
                <Text style={styles.emptyText}>No matches played yet</Text>
              )}
            </>
          ) : (
            <View style={styles.noProfileContainer}>
              <Icon name="person-add" size={60} color={colors.textSecondary} />
              <Text style={styles.noProfileText}>
                Your player profile will appear here once you join a game
              </Text>
            </View>
          )}

          <Button
            text="Logout"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  rankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  rankBadge: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
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
    marginBottom: 20,
  },
  noProfileContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 20,
  },
  noProfileText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: colors.error,
  },
});
