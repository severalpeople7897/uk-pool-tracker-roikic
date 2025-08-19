
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import { mockMatches } from '../../data/mockData';
import MatchCard from '../../components/MatchCard';

export default function MatchesScreen() {
  console.log('Matches screen rendered');
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'scheduled'>('all');

  const filteredMatches = mockMatches.filter(match => {
    if (selectedFilter === 'all') return true;
    return match.status === selectedFilter;
  });

  const FilterButton = ({ filter, title }: { filter: typeof selectedFilter, title: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterText,
        selectedFilter === filter && styles.activeFilterText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={commonStyles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={commonStyles.title}>Matches</Text>
        </View>

        <View style={styles.filterContainer}>
          <FilterButton filter="all" title="All" />
          <FilterButton filter="completed" title="Completed" />
          <FilterButton filter="scheduled" title="Scheduled" />
        </View>

        <View style={commonStyles.section}>
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <View style={[commonStyles.card, styles.emptyState]}>
              <Text style={commonStyles.textSecondary}>
                No {selectedFilter === 'all' ? '' : selectedFilter} matches found
              </Text>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.grey,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: colors.backgroundAlt,
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
