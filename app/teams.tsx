
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';
import { DataService } from '../services/dataService';
import { router, useFocusEffect } from 'expo-router';
import { Team } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TeamsScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      loadTeams();
    }, [])
  );

  const loadTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await DataService.getTeams();
      setTeams(teamsData);
    } catch (error) {
      console.log('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTeams();
    setRefreshing(false);
  }, []);

  const TeamCard = ({ team }: { team: Team }) => (
    <View style={[commonStyles.card, styles.teamCard]}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{team.name}</Text>
        <View style={styles.memberCount}>
          <Icon name="people" size={16} color={colors.textSecondary} />
          <Text style={styles.memberCountText}>
            {team.members?.length || 0} members
          </Text>
        </View>
      </View>
      
      {team.members && team.members.length > 0 && (
        <View style={styles.membersContainer}>
          <Text style={styles.membersTitle}>Members:</Text>
          <View style={styles.membersList}>
            {team.members.map((member, index) => (
              <View key={member.id} style={styles.memberChip}>
                <Text style={styles.memberName}>
                  {member.player?.name || 'Unknown Player'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.teamFooter}>
        <Text style={styles.createdDate}>
          Created {new Date(team.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.title}>Teams</Text>
        <TouchableOpacity 
          onPress={() => router.push('/create-team')} 
          style={styles.addButton}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={commonStyles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={commonStyles.section}>
          {teams.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="people-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Teams Yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first team to start playing team matches
              </Text>
              <TouchableOpacity
                style={styles.createFirstTeamButton}
                onPress={() => router.push('/create-team')}
              >
                <Icon name="add" size={20} color={colors.card} />
                <Text style={styles.createFirstTeamText}>Create Team</Text>
              </TouchableOpacity>
            </View>
          ) : (
            teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))
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
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  teamCard: {
    marginBottom: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  memberCountText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  membersContainer: {
    marginBottom: 12,
  },
  membersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  memberChip: {
    backgroundColor: colors.primary + '15',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  teamFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  createdDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  createFirstTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createFirstTeamText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 8,
  },
});
