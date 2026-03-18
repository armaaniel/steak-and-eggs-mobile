import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Colors } from '@/constants/theme'
import * as NavigationBar from 'expo-navigation-bar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

const queryClient = new QueryClient()

function RootNavigator() {
  const scheme = useColorScheme()
  const { token, isReady } = useAuth()

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(
      scheme === 'dark' ? '#262624' : '#F5F4EE'
    );
  }, [scheme]);

  if (!isReady) return null

  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const bg = { backgroundColor: colors.background }

  return (
    <>
      <Stack screenOptions={{ animation: 'fade' }}>
        <Stack.Screen name="welcome" options={{ headerShown: false, contentStyle: bg }} redirect={!!token} />
        <Stack.Screen name="login" options={{ headerShown: false, contentStyle: bg }} redirect={!!token} />
        <Stack.Screen name="signup" options={{ headerShown: false, contentStyle: bg }} redirect={!!token} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, contentStyle: bg }} redirect={!token} />
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </>
  )
}

export default function RootLayout() {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <RootNavigator />
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
