
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { mockPlayers, mockMatches } from '../../data/mockData';
import MatchCard from '../../components/MatchCard';
import Icon from '../../components/Icon';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log('Player detail screen rendered for ID:', id);

  const player = mockPlayers.find(p => p.id === id);
  const playerMatches = mockMatches.filter(
    match => match.player1Id === id || match.player2Id === id
  );

  if (!player) {
    return (
      <View style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={commonStyles.text}>Player not found</Text>
      </View>
    );
  }

  const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.title}>Player Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.playerHeader}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerRank}>Rank #{player.ranking}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard title="Points" value={player.points.toString()} />
          <StatCard title="Games Played" value={player.gamesPlayed.toString()} />
          <StatCard title="Wins" value={player.gamesWon.toString()} />
          <StatCard title="Losses" value={player.gamesLost.toString()} />
          <StatCard 
            title="Win Rate" 
            value={`${player.winPercentage}%`}
            subtitle={`${player.gamesWon}/${player.gamesPlayed} games`}
          />
          <StatCard 
            title="Form" 
            value="W-W-L-W"
            subtitle="Last 4 games"
          />
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Recent Matches</Text>
          {playerMatches.length > 0 ? (
            playerMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <View style={[commonStyles.card, styles.emptyState]}>
              <Text style={commonStyles.textSecondary}>No matches found</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
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
  scrollView: {
    flex: 1,
  },
  playerHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  playerInfo: {
    alignItems: 'center',
  },
  playerName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  playerRank: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
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
