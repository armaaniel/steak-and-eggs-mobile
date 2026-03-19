import { useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  ViewToken,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import { useAuth } from '@/contexts/AuthContext'
import { Colors } from '@/constants/theme'

const API = process.env.EXPO_PUBLIC_API_URL

// ─── Cards data ─────────────────────────────────────────────────────────────

const homeImageDark = require('@/assets/onboarding-home.png')
const homeImageLight = require('@/assets/homelight.png')
const stocksImageDark = require('@/assets/onboarding-stocks.png')
const stocksImageLight = require('@/assets/stockslight.png')
const activityImageDark = require('@/assets/onboarding-activity.png')
const activityImageLight = require('@/assets/activitylight.png')

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const router = useRouter()
  const { login } = useAuth()
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const { width } = useWindowDimensions()
  const [activeIndex, setActiveIndex] = useState(0)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)
  const cards = [
    {
      title: 'Paper Trading,\nReal Experience',
      subtitle: 'Practice buying and selling stocks with simulated funds. No real money involved, ever.',
      image: scheme === 'dark' ? homeImageDark : homeImageLight,
    },
    {
      title: 'Market Data,\nZero Risk',
      subtitle: '15-minute delayed prices so you can learn how the market moves without risking a cent.',
      image: scheme === 'dark' ? stocksImageDark : stocksImageLight,
    },
    {
      title: 'Track Your\nPerformance',
      subtitle: 'Build a portfolio, monitor your positions, and see how your strategy performs over time.',
      image: scheme === 'dark' ? activityImageDark : activityImageLight,
    },
  ]
  const s = styles(colors, width)

  async function handleDemo() {
    setDemoError(null)
    setDemoLoading(true)
    try {
      const response = await fetch(`${API}/demo`, { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        await login(data.token, data.username)
      } else {
        const data = await response.json()
        setDemoError(data.error || 'Something went wrong')
        setDemoLoading(false)
      }
    } catch {
      setDemoError('Something went wrong, please try again')
      setDemoLoading(false)
    }
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index)
    }
  }).current

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <FlatList
        data={cards}
        horizontal
        pagingEnabled
        style={{ flexGrow: 0 }}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.illustrationWrap}>
              <Image source={item.image} style={s.cardImage} resizeMode="contain" />
            </View>
            <View style={s.cardText}>
              <Text style={s.cardTitle}>{item.title}</Text>
              <Text style={s.cardSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Dots */}
      <View style={s.dots}>
        {cards.map((_, i) => (
          <View key={i} style={[s.dot, i === activeIndex && s.dotActive]} />
        ))}
      </View>

      {/* Auth buttons */}
      <View style={s.buttons}>
        <Pressable
          style={({ pressed }) => [s.loginButton, pressed && s.pressed]}
          onPress={() => router.push('/login')}
        >
          <Text style={s.loginText}>Log In</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.signupButton, pressed && s.pressed]}
          onPress={() => router.push('/signup')}
        >
          <Text style={s.signupText}>Sign Up</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.demoButton, pressed && s.pressed]}
          onPress={handleDemo}
          disabled={demoLoading}
        >
          <View style={s.demoInner}>
            {demoLoading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Animated.Text entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} layout={Layout.duration(200)} style={s.demoText}>Try Demo</Animated.Text>}
            {demoError && !demoLoading && (
              <Animated.Text
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={s.demoError}
                numberOfLines={1}
              >
                {demoError}
              </Animated.Text>
            )}
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = (colors: typeof Colors.light, width: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    gap: 32,
  },

  card: {
    width,
    paddingHorizontal: 32,
		paddingTop:32,
  },
  illustrationWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardImage: {
    width: width - 64,
    height: (width - 64) * (1100 / 1080),
    borderRadius: 12,
  },
  cardText: {
    flexDirection: 'column',
    gap: 8,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 40,
  },
  cardSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.textMuted,
  },
  buttons: {
    paddingHorizontal: 24,
    gap: 12,
  },
  loginButton: {
    backgroundColor: '#30302E',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#30302E',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  demoError: {
    color: colors.text,
    fontSize: 12,
    flexShrink: 1,
  },
})