
import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import { colors, commonStyles } from '../../styles/commonStyles';
import { View, Text, ScrollView, StyleSheet, TextInput, RefreshControl } from 'react-native';
import PlayerCard from '../../components/PlayerCard';
import { router, useFocusEffect } from 'expo-router';
import { Player } from '../../types';
import { DataService } from '../../services/dataService';

export default function PlayersScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadPlayers = async () => {
    try {
      const playersData = await DataService.getPlayers();
      setPlayers(playersData);
    } catch (error) {
      console.log('Error loading players:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlayers();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
    }, [])
  );

  const handlePlayerPress = (playerId: string) => {
    router.push(`/player/${playerId}`);
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Text style={commonStyles.title}>Players</Text>
          
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search players..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                position={player.ranking}
                onPress={() => handlePlayerPress(player.id)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No players found</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
