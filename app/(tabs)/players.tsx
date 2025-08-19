
import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon';
import { colors, commonStyles } from '../../styles/commonStyles';
import { View, Text, ScrollView, StyleSheet, TextInput, RefreshControl, TouchableOpacity } from 'react-native';
import PlayerCard from '../../components/PlayerCard';
import { router, useFocusEffect } from 'expo-router';
import { Player } from '../../types';
import { DataService } from '../../services/dataService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PlayersScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

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
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={commonStyles.content}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={commonStyles.section}>
          <View style={styles.header}>
            <Text style={commonStyles.title}>Players</Text>
            <TouchableOpacity
              style={styles.teamsButton}
              onPress={() => router.push('/teams')}
            >
              <Icon name="people" size={20} color={colors.primary} />
              <Text style={styles.teamsButtonText}>Teams</Text>
            </TouchableOpacity>
          </View>
          
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  teamsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  teamsButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
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
