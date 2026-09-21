import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { LoadingScreen } from '../src/components/common/LoadingScreen';
import { DataProvider, useData } from '../src/context/DataContext';
import { useNotifications } from '../src/hooks/useNotifications';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutContent() {
  const { isReady } = useData();

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="period/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useNotifications();

  return (
    <DataProvider>
      <RootLayoutContent />
    </DataProvider>
  );
}
