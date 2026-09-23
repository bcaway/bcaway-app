import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { LoadingScreen } from '../src/components/common/LoadingScreen';
import { DataProvider, useData } from '../src/context/DataContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useNotifications } from '../src/hooks/useNotifications';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutContent() {
  const { isReady } = useData();
  const { session, isLoading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    const inAuthGroup = (segments[0] as string) === 'login';

    if (!session && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, authLoading, segments, router]);

  // While restoring auth session or waiting for initial schedule readiness when logged in
  if (authLoading || (session && !isReady)) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
        <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="period/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useNotifications();

  return (
    <AuthProvider>
      <DataProvider>
        <RootLayoutContent />
      </DataProvider>
    </AuthProvider>
  );
}
