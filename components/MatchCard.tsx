
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { Match } from '../types';
import Icon from './Icon';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const getStatusColor = () => {
    switch (match.status) {
      case 'completed':
        return colors.success;
      case 'in-progress':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (match.status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in-progress':
        return 'play-circle';
      default:
        return 'time';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <View style={[commonStyles.card, styles.container]}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <Icon name={getStatusIcon()} size={16} color={getStatusColor()} />
          <Text style={[styles.status, { color: getStatusColor() }]}>
            {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
          </Text>
        </View>
        <Text style={styles.date}>{formatDate(match.created_at)}</Text>
      </View>

      <View style={styles.matchContainer}>
        <View style={styles.playerContainer}>
          <Text style={[
            styles.playerName,
            match.winner_id === match.player1_id && styles.winner
          ]}>
            {match.player1?.name || 'Player 1'}
          </Text>
          {match.status === 'completed' && (
            <Text style={[
              styles.score,
              match.winner_id === match.player1_id && styles.winnerScore
            ]}>
              {match.player1_score}
            </Text>
          )}
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vs}>vs</Text>
        </View>

        <View style={styles.playerContainer}>
          <Text style={[
            styles.playerName,
            match.winner_id === match.player2_id && styles.winner
          ]}>
            {match.player2?.name || 'Player 2'}
          </Text>
          {match.status === 'completed' && (
            <Text style={[
              styles.score,
              match.winner_id === match.player2_id && styles.winnerScore
            ]}>
              {match.player2_score}
            </Text>
          )}
        </View>
      </View>

      <Text style={styles.week}>Week {match.week || 1}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  winner: {
    fontWeight: '700',
    color: colors.success,
  },
  score: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  winnerScore: {
    color: colors.success,
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vs: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  week: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
