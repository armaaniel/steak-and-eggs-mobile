import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Colors } from '@/constants/theme'
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage'

const queryClient = new QueryClient()

export default function RootLayout() {
  const scheme = useColorScheme()
  const router = useRouter()
  const segments = useSegments()
  const [isReady, setIsReady] = useState(false)
  const [token, setToken] = useState<string | null>(null)
	
	// TOD: fix auth guard
	
	useEffect(() => {
	    NavigationBar.setBackgroundColorAsync(
	      scheme === 'dark' ? '#262624' : '#F5F4EE'
	    );
	  }, [scheme]);

  useEffect(() => {
    AsyncStorage.getItem('authToken').then((stored) => {
      setToken(stored)
      setIsReady(true)
    })
  }, [segments])

	useEffect(() => {
	  if (!isReady) return
	  const inTabs = segments[0] === '(tabs)'
	  const inAuth = segments[0] === 'login' || segments[0] === 'signup'
	  if (token && inAuth) {
	    router.replace('/(tabs)')
	  } else if (!token && !inAuth) {
	    router.replace('/login')
	  }
	}, [isReady, token, segments])

  if (!isReady) return null

  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const bg = { backgroundColor: colors.background }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <QueryClientProvider client={queryClient}>
      <BottomSheetModalProvider>
      <Stack initialRouteName="login" screenOptions={{ animation: 'fade' }}>
        <Stack.Screen name="login" options={{ headerShown: false, contentStyle: bg }} />
        <Stack.Screen name="signup" options={{ headerShown: false, contentStyle: bg }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, contentStyle: bg }} />
        <Stack.Screen name="stocks/[symbol]" options={{ headerShown: false, contentStyle: bg }} />
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}