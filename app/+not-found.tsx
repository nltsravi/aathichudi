import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';

export default function NotFoundScreen() {
  const router = useRouter();
  const { theme } = useApp();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Ionicons name="alert-circle-outline" size={64} color={theme.primary} />
      <Text style={[styles.title, { color: theme.textPrimary }]}>பக்கம் காணப்படவில்லை</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        நீங்கள் தேடிய பக்கம் அல்லது பாடல் முகவரி கிடைக்கவில்லை.
      </Text>
      <TouchableOpacity
        onPress={() => router.replace('/')}
        style={[styles.button, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.buttonText}>முகப்புக்குச் செல் (Go Home)</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
