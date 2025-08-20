
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import MatchCard from '../../components/MatchCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import NetworkStatusBar from '../../components/NetworkStatusBar';
import { Match } from '../../types';
import { DataService } from '../../services/dataService';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import Icon from '../../components/Icon';

type FilterType = 'all' | 'recent' | 'today';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const networkStatus = useNetworkStatus();

  const filterMatches = useCallback((matchesData: Match[], filter: FilterType) => {
    console.log(`Filtering ${matchesData.length} matches with filter: ${filter}`);
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
    
    console.log(`Filtered to ${filtered.length} matches`);
    setFilteredMatches(filtered);
    setActiveFilter(filter);
  }, []);

  const loadMatches = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('Loading matches...');
      const matchesData = await DataService.getMatches();
      setMatches(matchesData);
      filterMatches(matchesData, activeFilter);
      console.log('Matches loaded successfully');
    } catch (error) {
      console.log('Error loading matches:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load matches';
      setError(errorMessage);
      
      if (!networkStatus.isConnected) {
        setError('No internet connection. Please check your network and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [activeFilter, filterMatches, networkStatus.isConnected]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMatches(false);
    setRefreshing(false);
  }, [loadMatches]);

  const handleRetry = useCallback(() => {
    loadMatches(true);
  }, [loadMatches]);

  useFocusEffect(
    useCallback(() => {
      loadMatches(true);
    }, [loadMatches])
  );

  // Auto-retry when network comes back online
  useEffect(() => {
    if (networkStatus.isConnected && error) {
      console.log('Network reconnected, retrying...');
      loadMatches(false);
    }
  }, [networkStatus.isConnected, error, loadMatches]);

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

  if (loading) {
    return (
      <View style={[commonStyles.container, { paddingTop: insets.top }]}>
        <NetworkStatusBar />
        <LoadingSpinner message="Loading matches..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[commonStyles.container, { paddingTop: insets.top }]}>
        <NetworkStatusBar />
        <View style={styles.errorContainer}>
          <Icon name="warning" size={64} color={colors.danger} />
          <Text style={styles.errorTitle}>Failed to load matches</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      <NetworkStatusBar />
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
            <View style={styles.emptyContainer}>
              <Icon name="trophy" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No matches found</Text>
              <Text style={styles.emptySubtext}>
                {activeFilter === 'today' 
                  ? 'No matches played today' 
                  : 'Start playing to see matches here'}
              </Text>
            </View>
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.backgroundAlt,
    fontSize: 16,
    fontWeight: '600',
  },
});
