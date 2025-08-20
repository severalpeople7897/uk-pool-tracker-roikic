
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../styles/commonStyles';
import ErrorBoundary from '../components/ErrorBoundary';
import { setupErrorLogging } from '../utils/errorLogger';

export default function RootLayout() {
  useEffect(() => {
    // Setup global error logging
    setupErrorLogging();
    console.log('App initialized with error logging');
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" backgroundColor={colors.background} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="add-game" />
            <Stack.Screen name="create-team" />
            <Stack.Screen name="teams" />
            <Stack.Screen name="player/[id]" />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
