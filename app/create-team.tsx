
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { DataService } from '../services/dataService';
import { router } from 'expo-router';
import { Player } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateTeamScreen() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamName, setTeamName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const playersData = await DataService.getPlayers();
      setPlayers(playersData);
    } catch (error) {
      console.log('Error loading players:', error);
    }
  };

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else {
        return [...prev, player];
      }
    });
  };

  const handleSubmit = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    if (selectedPlayers.length < 2) {
      Alert.alert('Error', 'Please select at least 2 players for the team');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const teamData = {
        name: teamName.trim(),
        created_by: user.id,
        memberIds: selectedPlayers.map(p => p.id)
      };

      await DataService.createTeam(teamData);
      Alert.alert('Success', 'Team created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.log('Error creating team:', error);
      Alert.alert('Error', 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.title}>Create Team</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={commonStyles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={commonStyles.section}>
          {/* Team Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Team Name</Text>
            <TextInput
              style={styles.textInput}
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Enter team name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Player Selection */}
          <View style={styles.playersSection}>
            <Text style={styles.sectionTitle}>
              Select Players ({selectedPlayers.length} selected)
            </Text>
            <Text style={styles.sectionSubtitle}>
              Choose at least 2 players for your team
            </Text>

            {players.map((player) => {
              const isSelected = selectedPlayers.some(p => p.id === player.id);
              return (
                <TouchableOpacity
                  key={player.id}
                  style={[
                    styles.playerItem,
                    isSelected && styles.playerItemSelected
                  ]}
                  onPress={() => togglePlayerSelection(player)}
                >
                  <View style={styles.playerInfo}>
                    <Text style={[
                      styles.playerName,
                      isSelected && styles.playerNameSelected
                    ]}>
                      {player.name}
                    </Text>
                    <Text style={styles.playerStats}>
                      {player.games_played} games • {player.win_percentage ? player.win_percentage.toFixed(1) : '0.0'}% win rate
                    </Text>
                  </View>
                  <View style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected
                  ]}>
                    {isSelected && (
                      <Icon name="checkmark" size={16} color={colors.card} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Players Summary */}
          {selectedPlayers.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Selected Players</Text>
              <View style={styles.selectedPlayersList}>
                {selectedPlayers.map((player, index) => (
                  <View key={player.id} style={styles.selectedPlayerChip}>
                    <Text style={styles.selectedPlayerText}>
                      {player.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => togglePlayerSelection(player)}
                      style={styles.removePlayerButton}
                    >
                      <Icon name="close" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Button
            title={loading ? "Creating Team..." : "Create Team"}
            onPress={handleSubmit}
            disabled={loading || !teamName.trim() || selectedPlayers.length < 2}
            style={styles.submitButton}
          />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  placeholder: {
    width: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  playersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 8,
  },
  playerItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  playerNameSelected: {
    color: colors.primary,
  },
  playerStats: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  selectedPlayersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedPlayerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  selectedPlayerText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginRight: 6,
  },
  removePlayerButton: {
    padding: 2,
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
  },
});
