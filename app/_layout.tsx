
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { commonStyles } from '../styles/commonStyles';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setupErrorLogging } from '../utils/errorLogger';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setupErrorLogging();
        console.log('App initialized successfully');
      } catch (error) {
        console.log('Error initializing app:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={commonStyles.wrapper}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="add-game" />
            <Stack.Screen name="player/[id]" />
          </Stack>
          <StatusBar style="dark" />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
