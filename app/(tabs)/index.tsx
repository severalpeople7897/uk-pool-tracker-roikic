
import React, { useState, useEffect, useCallback } from 'react';
import { colors, commonStyles } from '../../styles/commonStyles';
import PlayerCard from '../../components/PlayerCard';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import MatchCard from '../../components/MatchCard';
import { router, useFocusEffect } from 'expo-router';
import { Player, Match } from '../../types';
import { DataService } from '../../services/dataService';

export default function LeagueScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [playersData, matchesData] = await Promise.all([
        DataService.getPlayers(),
        DataService.getMatches(),
      ]);
      
      setPlayers(playersData.slice(0, 5)); // Top 5 players
      setRecentMatches(matchesData.slice(-3).reverse()); // Last 3 matches
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handlePlayerPress = (playerId: string) => {
    router.push(`/player/${playerId}`);
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={commonStyles.section}>
          <Text style={commonStyles.title}>Pool League</Text>
          
          <Text style={styles.sectionTitle}>League Standings</Text>
          {players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              position={index + 1}
              onPress={() => handlePlayerPress(player.id)}
            />
          ))}
          
          <Text style={styles.sectionTitle}>Recent Matches</Text>
          {recentMatches.length > 0 ? (
            recentMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <Text style={styles.emptyText}>No recent matches</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});
