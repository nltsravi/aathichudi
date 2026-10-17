import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../src/context/AppContext';
import { setupNotificationHandler } from '../src/notifications/scheduler';

function NavigationStack() {
  const { isDark, theme } = useApp();

  useEffect(() => {
    setupNotificationHandler();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="poet/[poetId]" options={{ headerShown: false }} />
        <Stack.Screen name="verse/[poetId]/[number]" options={{ headerShown: false }} />
        <Stack.Screen name="daily-verse" options={{ headerShown: false }} />
        <Stack.Screen name="collections/index" options={{ headerShown: false }} />
        <Stack.Screen name="collections/create" options={{ headerShown: false }} />
        <Stack.Screen name="collections/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationStack />
      </AppProvider>
    </SafeAreaProvider>
  );
}
