
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function NetworkStatusBar() {
  const networkStatus = useNetworkStatus();

  if (networkStatus.isConnected && networkStatus.isInternetReachable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {!networkStatus.isConnected 
          ? 'No internet connection' 
          : 'Limited connectivity'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: colors.backgroundAlt,
    fontSize: 14,
    fontWeight: '500',
  },
});
