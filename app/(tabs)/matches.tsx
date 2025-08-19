
import React, { useState, useEffect, useCallback } from 'react';
import { colors, commonStyles } from '../../styles/commonStyles';
import MatchCard from '../../components/MatchCard';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Match } from '../../types';
import { DataService } from '../../services/dataService';
import { useFocusEffect } from 'expo-router';

type FilterType = 'all' | 'completed' | 'scheduled';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = async () => {
    try {
      const matchesData = await DataService.getMatches();
      setMatches(matchesData.reverse()); // Most recent first
    } catch (error) {
      console.log('Error loading matches:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [])
  );

  const filteredMatches = matches.filter(match => {
    if (selectedFilter === 'all') return true;
    return match.status === selectedFilter;
  });

  const FilterButton = ({ filter, title }: { filter: FilterType, title: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.activeFilterButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
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
          <Text style={commonStyles.title}>Matches</Text>
          
          <View style={styles.filterContainer}>
            <FilterButton filter="all" title="All" />
            <FilterButton filter="completed" title="Completed" />
            <FilterButton filter="scheduled" title="Scheduled" />
          </View>

          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <Text style={styles.emptyText}>No matches found</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.grey,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeFilterButtonText: {
    color: colors.backgroundAlt,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
