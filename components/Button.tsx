
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../styles/commonStyles';

interface ButtonProps {
  title?: string;
  text?: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function Button({ title, text, onPress, style, textStyle, disabled = false }: ButtonProps) {
  const buttonText = title || text || 'Button';
  
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        disabled && styles.buttonDisabled,
        style
      ]} 
      onPress={onPress} 
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[
        styles.buttonText, 
        disabled && styles.buttonTextDisabled,
        textStyle
      ]}>
        {buttonText}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: colors.grey,
    opacity: 0.6,
  },
  buttonText: {
    color: colors.backgroundAlt,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: colors.textSecondary,
  },
});
