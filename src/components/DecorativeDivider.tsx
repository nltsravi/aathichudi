import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

export const DecorativeDivider: React.FC<{ symbol?: string; style?: any }> = ({
  symbol = '❖',
  style,
}) => {
  const { theme } = useApp();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
      <Text style={[styles.symbol, { color: theme.accent }]}>{symbol}</Text>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    paddingHorizontal: 20,
  },
  line: {
    flex: 1,
    height: 1,
    opacity: 0.7,
  },
  symbol: {
    marginHorizontal: 12,
    fontSize: 14,
    opacity: 0.9,
  },
});
