
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
import { router } from 'expo-router';
import { colors, commonStyles } from '../styles/commonStyles';
import { Player } from '../types';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function AddGameScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState<Player | null>(null);
  const [selectedPlayer2, setSelectedPlayer2] = useState<Player | null>(null);
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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

  const handleSubmit = async () => {
    if (!selectedPlayer1 || !selectedPlayer2) {
      Alert.alert('Error', 'Please select both players');
      return;
    }

    if (selectedPlayer1.id === selectedPlayer2.id) {
      Alert.alert('Error', 'Please select different players');
      return;
    }

    const score1 = parseInt(player1Score);
    const score2 = parseInt(player2Score);

    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      Alert.alert('Error', 'Please enter valid scores');
      return;
    }

    if (score1 === score2) {
      Alert.alert('Error', 'Scores cannot be tied. One player must win.');
      return;
    }

    setLoading(true);
    try {
      const winnerId = score1 > score2 ? selectedPlayer1.id : selectedPlayer2.id;
      
      await DataService.addMatch({
        player1_id: selectedPlayer1.id,
        player2_id: selectedPlayer2.id,
        player1_score: score1,
        player2_score: score2,
        winner_id: winnerId,
        created_by: user?.id || '',
      });

      Alert.alert('Success', 'Game added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.log('Error adding game:', error);
      Alert.alert('Error', 'Failed to add game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PlayerSelector = ({ 
    title, 
    selectedPlayer, 
    onSelect 
  }: { 
    title: string; 
    selectedPlayer: Player | null; 
    onSelect: (player: Player) => void;
  }) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playerScroll}>
        {players.map((player) => (
          <TouchableOpacity
            key={player.id}
            style={[
              styles.playerOption,
              selectedPlayer?.id === player.id && styles.selectedPlayerOption,
            ]}
            onPress={() => onSelect(player)}
          >
            <Text
              style={[
                styles.playerOptionText,
                selectedPlayer?.id === player.id && styles.selectedPlayerOptionText,
              ]}
            >
              {player.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Game</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PlayerSelector
          title="Player 1"
          selectedPlayer={selectedPlayer1}
          onSelect={setSelectedPlayer1}
        />

        <PlayerSelector
          title="Player 2"
          selectedPlayer={selectedPlayer2}
          onSelect={setSelectedPlayer2}
        />

        <View style={styles.scoresContainer}>
          <Text style={styles.scoresTitle}>Scores</Text>
          <View style={styles.scoresRow}>
            <View style={styles.scoreInput}>
              <Text style={styles.scoreLabel}>
                {selectedPlayer1?.name || 'Player 1'}
              </Text>
              <TextInput
                style={styles.scoreTextInput}
                value={player1Score}
                onChangeText={setPlayer1Score}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <Text style={styles.vsText}>VS</Text>

            <View style={styles.scoreInput}>
              <Text style={styles.scoreLabel}>
                {selectedPlayer2?.name || 'Player 2'}
              </Text>
              <TextInput
                style={styles.scoreTextInput}
                value={player2Score}
                onChangeText={setPlayer2Score}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <Button
          text={loading ? "Adding Game..." : "Add Game"}
          onPress={handleSubmit}
          style={[styles.submitButton, loading && styles.disabledButton]}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  selectorContainer: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  playerScroll: {
    flexDirection: 'row',
  },
  playerOption: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedPlayerOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  playerOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  selectedPlayerOptionText: {
    color: colors.backgroundAlt,
  },
  scoresContainer: {
    marginBottom: 32,
  },
  scoresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreInput: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreTextInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
    width: 80,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    marginHorizontal: 20,
  },
  submitButton: {
    marginBottom: 40,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
