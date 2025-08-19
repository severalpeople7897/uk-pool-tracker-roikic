
import Icon from '../../components/Icon';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import React, { useState } from 'react';
import Button from '../../components/Button';
import { router } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Error', 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <KeyboardAvoidingView 
      style={[commonStyles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={commonStyles.content}
        contentContainerStyle={{ 
          flexGrow: 1, 
          justifyContent: 'center',
          paddingBottom: insets.bottom + 20 
        }}
      >
        <View style={commonStyles.section}>
          <View style={styles.header}>
            <Icon name="trophy" size={60} color={colors.primary} />
            <Text style={commonStyles.title}>Pool League</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <Button
              title={loading ? "Signing in..." : "Sign In"}
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            />

            <TouchableOpacity onPress={navigateToRegister} style={styles.registerLink}>
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.registerTextBold}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  loginButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  registerText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  registerTextBold: {
    fontWeight: '600',
    color: colors.primary,
  },
});
