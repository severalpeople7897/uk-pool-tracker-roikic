
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { Player } from '../types';
import Icon from './Icon';

interface PlayerCardProps {
  player: Player;
  position: number;
  onPress: () => void;
}

export default function PlayerCard({ player, position, onPress }: PlayerCardProps) {
  const getTrendIcon = () => {
    if (position <= 3) return 'trophy';
    return 'person';
  };

  const getTrendColor = () => {
    if (position === 1) return colors.accent;
    if (position <= 3) return colors.secondary;
    return colors.textSecondary;
  };

  return (
    <TouchableOpacity style={[commonStyles.card, styles.container]} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.positionContainer}>
          <Text style={[styles.position, { color: getTrendColor() }]}>#{position}</Text>
          <Icon name={getTrendIcon()} size={20} color={getTrendColor()} />
        </View>
        <Text style={styles.playerName}>{player.name}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{player.points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{player.games_won}-{player.games_lost}</Text>
          <Text style={styles.statLabel}>W-L</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{player.win_percentage}%</Text>
          <Text style={styles.statLabel}>Win %</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  position: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 4,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
