
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { mockPlayers } from '../../data/mockData';
import PlayerCard from '../../components/PlayerCard';
import Icon from '../../components/Icon';

export default function PlayersScreen() {
  console.log('Players screen rendered');
  
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayers = mockPlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayerPress = (playerId: string) => {
    console.log('Player pressed:', playerId);
    router.push(`/player/${playerId}`);
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={commonStyles.title}>Players</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search players..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>League Standings</Text>
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                position={player.ranking}
                onPress={() => handlePlayerPress(player.id)}
              />
            ))
          ) : (
            <View style={[commonStyles.card, styles.emptyState]}>
              <Text style={commonStyles.textSecondary}>No players found</Text>
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
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
