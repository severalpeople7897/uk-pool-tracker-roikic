
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { mockPlayers, mockMatches } from '../../data/mockData';
import PlayerCard from '../../components/PlayerCard';
import MatchCard from '../../components/MatchCard';

export default function LeagueScreen() {
  console.log('League screen rendered');
  
  const topPlayers = mockPlayers.slice(0, 3);
  const upcomingMatches = mockMatches.filter(match => match.status === 'scheduled').slice(0, 3);

  const handlePlayerPress = (playerId: string) => {
    console.log('Player pressed:', playerId);
    router.push(`/player/${playerId}`);
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={commonStyles.title}>English Pool League</Text>
          <Text style={commonStyles.textSecondary}>Season 2024</Text>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Top Players</Text>
          {topPlayers.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              position={index + 1}
              onPress={() => handlePlayerPress(player.id)}
            />
          ))}
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Upcoming Matches</Text>
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <View style={[commonStyles.card, styles.emptyState]}>
              <Text style={commonStyles.textSecondary}>No upcoming matches scheduled</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});
