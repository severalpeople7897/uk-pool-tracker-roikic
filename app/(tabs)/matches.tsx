
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import MatchCard from '../../components/MatchCard';
import { Match } from '../../types';
import { DataService } from '../../services/dataService';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterType = 'all' | 'recent' | 'today';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const loadMatches = useCallback(async () => {
    try {
      const matchesData = await DataService.getMatches();
      setMatches(matchesData);
      filterMatches(matchesData, activeFilter);
    } catch (error) {
      console.log('Error loading matches:', error);
    }
  }, [activeFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const filterMatches = (matchesData: Match[], filter: FilterType) => {
    let filtered = [...matchesData];
    
    switch (filter) {
      case 'recent':
        filtered = matchesData.slice(-10).reverse();
        break;
      case 'today':
        const today = new Date().toDateString();
        filtered = matchesData.filter(match => 
          new Date(match.date).toDateString() === today
        );
        break;
      default:
        filtered = matchesData.reverse();
    }
    
    setFilteredMatches(filtered);
    setActiveFilter(filter);
  };

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches])
  );

  const FilterButton = ({ filter, title }: { filter: FilterType, title: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => filterMatches(matches, filter)}
    >
      <Text style={[
        styles.filterText,
        activeFilter === filter && styles.activeFilterText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
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
          <Text style={commonStyles.title}>Matches</Text>
          
          <View style={styles.filterContainer}>
            <FilterButton filter="all" title="All" />
            <FilterButton filter="recent" title="Recent" />
            <FilterButton filter="today" title="Today" />
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeFilterText: {
    color: colors.backgroundAlt,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
