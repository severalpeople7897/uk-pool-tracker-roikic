
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

  const getWinMethodIcon = () => {
    switch (match.win_method) {
      case 'foul':
        return 'warning';
      case 'forfeit':
        return 'flag';
      case 'timeout':
        return 'time';
      default:
        return null;
    }
  };

  const getWinMethodText = () => {
    switch (match.win_method) {
      case 'foul':
        return 'Won by foul';
      case 'forfeit':
        return 'Won by forfeit';
      case 'timeout':
        return 'Won by timeout';
      default:
        return null;
    }
  };

  const isTeamMatch = match.match_type === 'teams';
  const totalFouls = match.fouls?.reduce((sum, foul) => sum + foul.foul_count, 0) || 0;

  return (
    <View style={[commonStyles.card, styles.container]}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <Icon name={getStatusIcon()} size={16} color={getStatusColor()} />
          <Text style={[styles.status, { color: getStatusColor() }]}>
            {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
          </Text>
          {isTeamMatch && (
            <View style={styles.teamBadge}>
              <Text style={styles.teamBadgeText}>TEAM</Text>
            </View>
          )}
        </View>
        <Text style={styles.date}>
          {match.match_date ? formatDate(match.match_date) : formatDate(match.created_at)}
        </Text>
      </View>

      <View style={styles.matchContainer}>
        <View style={styles.playerContainer}>
          <Text style={[
            styles.playerName,
            (isTeamMatch ? match.winning_team_id === match.team1_id : match.winner_id === match.player1_id) && styles.winner
          ]}>
            {isTeamMatch ? match.team1?.name : match.player1?.name || 'Player 1'}
          </Text>
          {isTeamMatch && match.team1?.members && (
            <Text style={styles.teamMembers}>
              {match.team1.members.map(m => m.player?.name).join(', ')}
            </Text>
          )}
          {match.status === 'completed' && (
            <Text style={[
              styles.score,
              (isTeamMatch ? match.winning_team_id === match.team1_id : match.winner_id === match.player1_id) && styles.winnerScore
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
            (isTeamMatch ? match.winning_team_id === match.team2_id : match.winner_id === match.player2_id) && styles.winner
          ]}>
            {isTeamMatch ? match.team2?.name : match.player2?.name || 'Player 2'}
          </Text>
          {isTeamMatch && match.team2?.members && (
            <Text style={styles.teamMembers}>
              {match.team2.members.map(m => m.player?.name).join(', ')}
            </Text>
          )}
          {match.status === 'completed' && (
            <Text style={[
              styles.score,
              (isTeamMatch ? match.winning_team_id === match.team2_id : match.winner_id === match.player2_id) && styles.winnerScore
            ]}>
              {match.player2_score}
            </Text>
          )}
        </View>
      </View>

      {/* Enhanced match details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailsRow}>
          <Text style={styles.week}>Week {match.week || 1}</Text>
          {match.location && (
            <View style={styles.locationContainer}>
              <Icon name="location" size={12} color={colors.textSecondary} />
              <Text style={styles.location}>{match.location}</Text>
            </View>
          )}
        </View>

        {(getWinMethodText() || totalFouls > 0) && (
          <View style={styles.detailsRow}>
            {getWinMethodText() && (
              <View style={styles.winMethodContainer}>
                {getWinMethodIcon() && (
                  <Icon name={getWinMethodIcon()!} size={12} color={colors.warning} />
                )}
                <Text style={styles.winMethod}>{getWinMethodText()}</Text>
              </View>
            )}
            {totalFouls > 0 && (
              <View style={styles.foulsContainer}>
                <Icon name="warning" size={12} color={colors.error} />
                <Text style={styles.fouls}>{totalFouls} foul{totalFouls !== 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
        )}

        {match.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {match.notes}
          </Text>
        )}
      </View>
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
  teamBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  teamBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.card,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  teamMembers: {
    fontSize: 11,
    color: colors.textSecondary,
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
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  week: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  winMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winMethod: {
    fontSize: 11,
    color: colors.warning,
    marginLeft: 4,
    fontWeight: '500',
  },
  foulsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fouls: {
    fontSize: 11,
    color: colors.error,
    marginLeft: 4,
    fontWeight: '500',
  },
  notes: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
