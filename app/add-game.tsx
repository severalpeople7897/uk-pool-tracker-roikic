
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { DataService } from '../services/dataService';
import { router } from 'expo-router';
import { Player, Team } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddGameScreen() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  // Match type
  const [isTeamMatch, setIsTeamMatch] = useState(false);
  
  // Singles match data
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  
  // Team match data
  const [team1, setTeam1] = useState<Team | null>(null);
  const [team2, setTeam2] = useState<Team | null>(null);
  
  // Scores
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  
  // Enhanced logging
  const [winMethod, setWinMethod] = useState<'normal' | 'foul' | 'forfeit' | 'timeout'>('normal');
  const [location, setLocation] = useState('');
  const [matchDate, setMatchDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Fouls tracking
  const [fouls, setFouls] = useState<{ [playerId: string]: { count: number; details: string } }>({});
  
  // UI state
  const [showPlayer1Selector, setShowPlayer1Selector] = useState(false);
  const [showPlayer2Selector, setShowPlayer2Selector] = useState(false);
  const [showTeam1Selector, setShowTeam1Selector] = useState(false);
  const [showTeam2Selector, setShowTeam2Selector] = useState(false);
  const [showWinMethodSelector, setShowWinMethodSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [playersData, teamsData] = await Promise.all([
        DataService.getPlayers(),
        DataService.getTeams()
      ]);
      setPlayers(playersData);
      setTeams(teamsData);
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!score1 || !score2) {
      Alert.alert('Error', 'Please enter scores for both sides');
      return;
    }

    if (isTeamMatch) {
      if (!team1 || !team2) {
        Alert.alert('Error', 'Please select both teams');
        return;
      }
      if (team1.id === team2.id) {
        Alert.alert('Error', 'Please select different teams');
        return;
      }
    } else {
      if (!player1 || !player2) {
        Alert.alert('Error', 'Please select both players');
        return;
      }
      if (player1.id === player2.id) {
        Alert.alert('Error', 'Please select different players');
        return;
      }
    }

    const scoreNum1 = parseInt(score1);
    const scoreNum2 = parseInt(score2);

    if (isNaN(scoreNum1) || isNaN(scoreNum2) || scoreNum1 < 0 || scoreNum2 < 0) {
      Alert.alert('Error', 'Please enter valid scores');
      return;
    }

    setLoading(true);
    try {
      const matchData: any = {
        player1_score: scoreNum1,
        player2_score: scoreNum2,
        created_by: user?.id,
        match_type: isTeamMatch ? 'teams' : 'singles',
        win_method: winMethod,
        location: location || null,
        match_date: matchDate.toISOString().split('T')[0],
        notes: notes || null,
      };

      if (isTeamMatch) {
        matchData.team1_id = team1!.id;
        matchData.team2_id = team2!.id;
        matchData.winning_team_id = scoreNum1 > scoreNum2 ? team1!.id : team2!.id;
      } else {
        matchData.player1_id = player1!.id;
        matchData.player2_id = player2!.id;
        matchData.winner_id = scoreNum1 > scoreNum2 ? player1!.id : player2!.id;
      }

      // Add fouls data
      const foulData = Object.entries(fouls)
        .filter(([_, foul]) => foul.count > 0)
        .map(([playerId, foul]) => ({
          player_id: playerId,
          foul_count: foul.count,
          foul_details: foul.details || null
        }));

      if (foulData.length > 0) {
        matchData.fouls = foulData;
      }

      await DataService.addMatch(matchData);
      Alert.alert('Success', 'Match added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.log('Error adding match:', error);
      Alert.alert('Error', 'Failed to add match');
    } finally {
      setLoading(false);
    }
  };

  const PlayerSelector = ({ title, selectedPlayer, onSelect, isFirst }: { 
    title: string; 
    selectedPlayer: Player | null; 
    onSelect: (player: Player) => void;
    isFirst: boolean;
  }) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <TouchableOpacity
        style={styles.playerButton}
        onPress={() => {
          if (isFirst) {
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
      
      {((isFirst && showPlayer1Selector) || (!isFirst && showPlayer2Selector)) && (
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

  const TeamSelector = ({ title, selectedTeam, onSelect, isFirst }: { 
    title: string; 
    selectedTeam: Team | null; 
    onSelect: (team: Team) => void;
    isFirst: boolean;
  }) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <TouchableOpacity
        style={styles.playerButton}
        onPress={() => {
          if (isFirst) {
            setShowTeam1Selector(!showTeam1Selector);
            setShowTeam2Selector(false);
          } else {
            setShowTeam2Selector(!showTeam2Selector);
            setShowTeam1Selector(false);
          }
        }}
      >
        <Text style={styles.playerButtonText}>
          {selectedTeam ? selectedTeam.name : 'Select Team'}
        </Text>
        <Icon name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      
      {((isFirst && showTeam1Selector) || (!isFirst && showTeam2Selector)) && (
        <View style={styles.dropdown}>
          {teams.map((team) => (
            <TouchableOpacity
              key={team.id}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(team);
                setShowTeam1Selector(false);
                setShowTeam2Selector(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{team.name}</Text>
              <Text style={styles.teamMembersText}>
                {team.members?.map(m => m.player?.name).join(', ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const FoulTracker = ({ playerId, playerName }: { playerId: string; playerName: string }) => {
    const playerFouls = fouls[playerId] || { count: 0, details: '' };
    
    return (
      <View style={styles.foulContainer}>
        <Text style={styles.foulTitle}>{playerName} Fouls</Text>
        <View style={styles.foulRow}>
          <TouchableOpacity
            style={styles.foulButton}
            onPress={() => {
              const newCount = Math.max(0, playerFouls.count - 1);
              setFouls(prev => ({
                ...prev,
                [playerId]: { ...playerFouls, count: newCount }
              }));
            }}
          >
            <Icon name="remove" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.foulCount}>{playerFouls.count}</Text>
          <TouchableOpacity
            style={styles.foulButton}
            onPress={() => {
              setFouls(prev => ({
                ...prev,
                [playerId]: { ...playerFouls, count: playerFouls.count + 1 }
              }));
            }}
          >
            <Icon name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.foulDetailsInput}
          value={playerFouls.details}
          onChangeText={(text) => {
            setFouls(prev => ({
              ...prev,
              [playerId]: { ...playerFouls, details: text }
            }));
          }}
          placeholder="Foul details (optional)"
          placeholderTextColor={colors.textSecondary}
          multiline
        />
      </View>
    );
  };

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
          {/* Match Type Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Team Match</Text>
            <Switch
              value={isTeamMatch}
              onValueChange={setIsTeamMatch}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          {/* Players/Teams Selection */}
          {isTeamMatch ? (
            <>
              <View style={styles.teamSectionHeader}>
                <Text style={styles.sectionTitle}>Teams</Text>
                <TouchableOpacity
                  style={styles.createTeamButton}
                  onPress={() => router.push('/create-team')}
                >
                  <Icon name="add" size={20} color={colors.primary} />
                  <Text style={styles.createTeamText}>Create Team</Text>
                </TouchableOpacity>
              </View>
              <TeamSelector
                title="Team 1"
                selectedTeam={team1}
                onSelect={setTeam1}
                isFirst={true}
              />
              <TeamSelector
                title="Team 2"
                selectedTeam={team2}
                onSelect={setTeam2}
                isFirst={false}
              />
            </>
          ) : (
            <>
              <PlayerSelector
                title="Player 1"
                selectedPlayer={player1}
                onSelect={setPlayer1}
                isFirst={true}
              />
              <PlayerSelector
                title="Player 2"
                selectedPlayer={player2}
                onSelect={setPlayer2}
                isFirst={false}
              />
            </>
          )}

          {/* Scores */}
          <View style={styles.scoresRow}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>
                {isTeamMatch ? (team1?.name || 'Team 1') : (player1?.name || 'Player 1')} Score
              </Text>
              <TextInput
                style={styles.scoreInput}
                value={score1}
                onChangeText={setScore1}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>
                {isTeamMatch ? (team2?.name || 'Team 2') : (player2?.name || 'Player 2')} Score
              </Text>
              <TextInput
                style={styles.scoreInput}
                value={score2}
                onChangeText={setScore2}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Win Method */}
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorTitle}>How was the match won?</Text>
            <TouchableOpacity
              style={styles.playerButton}
              onPress={() => setShowWinMethodSelector(!showWinMethodSelector)}
            >
              <Text style={styles.playerButtonText}>
                {winMethod === 'normal' ? 'Normal Win' :
                 winMethod === 'foul' ? 'Opponent Foul' :
                 winMethod === 'forfeit' ? 'Forfeit' : 'Timeout'}
              </Text>
              <Icon name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            {showWinMethodSelector && (
              <View style={styles.dropdown}>
                {[
                  { value: 'normal', label: 'Normal Win' },
                  { value: 'foul', label: 'Opponent Foul' },
                  { value: 'forfeit', label: 'Forfeit' },
                  { value: 'timeout', label: 'Timeout' }
                ].map((method) => (
                  <TouchableOpacity
                    key={method.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setWinMethod(method.value as any);
                      setShowWinMethodSelector(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{method.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Where was the game played?"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Match Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {matchDate.toLocaleDateString()}
              </Text>
              <Icon name="calendar" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={matchDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setMatchDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Fouls Tracking */}
          {!isTeamMatch && player1 && player2 && (
            <View style={styles.foulsSection}>
              <Text style={styles.sectionTitle}>Fouls Tracking</Text>
              <FoulTracker playerId={player1.id} playerName={player1.name} />
              <FoulTracker playerId={player2.id} playerName={player2.name} />
            </View>
          )}

          {/* Notes */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes about the match..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <Button
            title={loading ? "Adding Match..." : "Add Match"}
            onPress={handleSubmit}
            disabled={loading}
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
  teamMembersText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scoresRow: {
    marginBottom: 24,
  },
  scoreContainer: {
    flex: 1,
    marginBottom: 16,
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
    textAlign: 'center',
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
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  foulsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  foulContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  foulTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  foulRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  foulButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 16,
  },
  foulCount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  foulDetailsInput: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    height: 60,
    textAlignVertical: 'top',
  },
  teamSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  createTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  createTeamText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 32,
    backgroundColor: colors.primary,
  },
});
