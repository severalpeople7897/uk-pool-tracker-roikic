
import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { commonStyles } from '../styles/commonStyles';
import { Platform, SafeAreaView } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { setupErrorLogging } from '../utils/errorLogger';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = useState(false);
  const params = useGlobalSearchParams();

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
        <SafeAreaView style={[commonStyles.wrapper, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="add-game" />
            <Stack.Screen name="player/[id]" />
          </Stack>
          <StatusBar style="dark" />
        </SafeAreaView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
