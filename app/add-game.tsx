
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
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DataService } from '../services/dataService';
import { router } from 'expo-router';
import { Player } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddGameScreen() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
  const [showPlayer1Selector, setShowPlayer1Selector] = useState(false);
  const [showPlayer2Selector, setShowPlayer2Selector] = useState(false);
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

  const handleSubmit = async () => {
    if (!player1 || !player2 || !player1Score || !player2Score) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (player1.id === player2.id) {
      Alert.alert('Error', 'Please select different players');
      return;
    }

    const score1 = parseInt(player1Score);
    const score2 = parseInt(player2Score);

    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      Alert.alert('Error', 'Please enter valid scores');
      return;
    }

    try {
      const matchData = {
        player1Id: player1.id,
        player2Id: player2.id,
        player1Score: score1,
        player2Score: score2,
        winnerId: score1 > score2 ? player1.id : player2.id,
        date: new Date().toISOString(),
      };

      await DataService.addMatch(matchData);
      Alert.alert('Success', 'Match added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.log('Error adding match:', error);
      Alert.alert('Error', 'Failed to add match');
    }
  };

  const PlayerSelector = ({ title, selectedPlayer, onSelect }: { 
    title: string; 
    selectedPlayer: Player | null; 
    onSelect: (player: Player) => void;
  }) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <TouchableOpacity
        style={styles.playerButton}
        onPress={() => {
          if (title.includes('Player 1')) {
            setShowPlayer1Selector(!showPlayer1Selector);
            setShowPlayer2Selector(false);
          } else {
            setShowPlayer2Selector(!showPlayer2Selector);
            setShowPlayer1Selector(false);
          }
        }}
      >
        <Text style={styles.playerButtonText}>
          {selectedPlayer ? selectedPlayer.name : 'Select Player'}
        </Text>
        <Icon name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      
      {((title.includes('Player 1') && showPlayer1Selector) || 
        (title.includes('Player 2') && showPlayer2Selector)) && (
        <View style={styles.dropdown}>
          {players.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(player);
                setShowPlayer1Selector(false);
                setShowPlayer2Selector(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{player.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.title}>Add Game</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={commonStyles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={commonStyles.section}>
          <PlayerSelector
            title="Player 1"
            selectedPlayer={player1}
            onSelect={setPlayer1}
          />

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Player 1 Score</Text>
            <TextInput
              style={styles.scoreInput}
              value={player1Score}
              onChangeText={setPlayer1Score}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <PlayerSelector
            title="Player 2"
            selectedPlayer={player2}
            onSelect={setPlayer2}
          />

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Player 2 Score</Text>
            <TextInput
              style={styles.scoreInput}
              value={player2Score}
              onChangeText={setPlayer2Score}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <Button
            title="Add Match"
            onPress={handleSubmit}
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
  },
  placeholder: {
    width: 40,
  },
  selectorContainer: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  playerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  playerButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdown: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  scoreContainer: {
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  scoreInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  vsContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  vsText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  submitButton: {
    marginTop: 32,
  },
});
