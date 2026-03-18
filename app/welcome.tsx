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
import AsyncStorage from '@react-native-async-storage/async-storage'
import Svg, {
  Path,
  Circle,
  Line,
  Polyline,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
} from 'react-native-svg'
import { Colors } from '@/constants/theme'

const API = process.env.EXPO_PUBLIC_API_URL

// ─── Illustrations ──────────────────────────────────────────────────────────

function ChartIllustration({ color, accent }: { color: string; accent: string }) {
  return (
    <Svg width={240} height={200} viewBox="0 0 240 200">
      <Defs>
        <LinearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={accent} stopOpacity={0.18} />
          <Stop offset="100%" stopColor={accent} stopOpacity={0} />
        </LinearGradient>
        <ClipPath id="screen">
          <Rect x="62" y="18" width="116" height="164" rx="10" />
        </ClipPath>
      </Defs>

      <Rect x="56" y="12" width="128" height="176" rx="16" fill="none" stroke={color} strokeOpacity={0.18} strokeWidth={1.5} />
      <Rect x="62" y="18" width="116" height="164" rx="10" fill={color} fillOpacity={0.03} />
      <Rect x="100" y="14" width="40" height="5" rx="2.5" fill={color} fillOpacity={0.08} />

      <Rect x="74" y="34" width="52" height="6" rx="3" fill={color} fillOpacity={0.12} />
      <Rect x="74" y="44" width="32" height="4" rx="2" fill={color} fillOpacity={0.06} />

      <G clipPath="url(#screen)">
        <Path d="M74 108 L90 98 L108 102 L124 82 L140 72 L154 76 L168 56 L168 120 L74 120 Z" fill="url(#cg)" />
      </G>
      <Polyline
        points="74,108 90,98 108,102 124,82 140,72 154,76 168,56"
        fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      />
      <Circle cx="168" cy="56" r="6" fill={accent} fillOpacity={0.12} />
      <Circle cx="168" cy="56" r="3" fill={accent} />

      <Rect x="78"  y="114" width="6" height="6"  rx="1.5" fill={color} fillOpacity={0.06} />
      <Rect x="90"  y="112" width="6" height="8"  rx="1.5" fill={color} fillOpacity={0.07} />
      <Rect x="102" y="110" width="6" height="10" rx="1.5" fill={color} fillOpacity={0.08} />
      <Rect x="114" y="108" width="6" height="12" rx="1.5" fill={color} fillOpacity={0.06} />
      <Rect x="126" y="106" width="6" height="14" rx="1.5" fill={color} fillOpacity={0.09} />
      <Rect x="138" y="104" width="6" height="16" rx="1.5" fill={accent} fillOpacity={0.15} />
      <Rect x="150" y="102" width="6" height="18" rx="1.5" fill={accent} fillOpacity={0.2} />

      <Rect x="74" y="130" width="12" height="12" rx="3" fill={color} fillOpacity={0.07} />
      <Rect x="92" y="132" width="30" height="4" rx="2" fill={color} fillOpacity={0.1} />
      <Rect x="92" y="139" width="20" height="3" rx="1.5" fill={color} fillOpacity={0.05} />
      <Rect x="148" y="132" width="20" height="4" rx="2" fill="#2D8C4E" fillOpacity={0.35} />

      <Rect x="74" y="150" width="12" height="12" rx="3" fill={color} fillOpacity={0.07} />
      <Rect x="92" y="152" width="26" height="4" rx="2" fill={color} fillOpacity={0.1} />
      <Rect x="92" y="159" width="18" height="3" rx="1.5" fill={color} fillOpacity={0.05} />
      <Rect x="148" y="152" width="20" height="4" rx="2" fill="#C4391D" fillOpacity={0.3} />

      <Circle cx="100" cy="176" r="2" fill={color} fillOpacity={0.1} />
      <Circle cx="120" cy="176" r="2" fill={accent} fillOpacity={0.4} />
      <Circle cx="140" cy="176" r="2" fill={color} fillOpacity={0.1} />

      <Rect x="188" y="40" width="40" height="20" rx="6" fill={color} fillOpacity={0.04} stroke={color} strokeOpacity={0.08} strokeWidth={0.5} />
      <Rect x="194" y="46" width="18" height="4" rx="1.5" fill="#2D8C4E" fillOpacity={0.3} />
      <Rect x="194" y="53" width="12" height="3" rx="1.5" fill={color} fillOpacity={0.08} />

      <Path d="M22 130 L30 118 L38 130" fill="none" stroke="#2D8C4E" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.25} />
      <Circle cx="20" cy="60" r="3" fill={accent} fillOpacity={0.1} />
      <Circle cx="210" cy="140" r="2.5" fill={accent} fillOpacity={0.08} />
      <Circle cx="30" cy="170" r="2" fill="#2D8C4E" fillOpacity={0.12} />
    </Svg>
  )
}

function ClockIllustration({ color, accent }: { color: string; accent: string }) {
  const cx = 120
  const cy = 100
  const r = 68

  const minorAngles = [30, 60, 120, 150, 210, 240, 300, 330]
  const dotAngles = [8, 22, 38, 55, 72, 82]

  return (
    <Svg width={240} height={200} viewBox="0 0 240 200">
      <Circle cx={cx} cy={cy} r={r + 20} fill={accent} fillOpacity={0.03} />
      <Circle cx={cx} cy={cy} r={r + 20} fill="none" stroke={color} strokeOpacity={0.04} strokeWidth={0.5} />
      <Circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.025} stroke={color} strokeOpacity={0.12} strokeWidth={1.2} />
      <Circle cx={cx} cy={cy} r={r - 8} fill="none" stroke={color} strokeOpacity={0.04} strokeWidth={0.5} />

      {/* Major markers: 12, 3, 6, 9 */}
      <Line x1={cx} y1={cy - r + 4} x2={cx} y2={cy - r + 12} stroke={color} strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round" />
      <Line x1={cx + r - 4} y1={cy} x2={cx + r - 12} y2={cy} stroke={color} strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round" />
      <Line x1={cx} y1={cy + r - 4} x2={cx} y2={cy + r - 12} stroke={color} strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round" />
      <Line x1={cx - r + 4} y1={cy} x2={cx - r + 12} y2={cy} stroke={color} strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round" />

      {/* Minor ticks */}
      {minorAngles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <Line key={i}
            x1={cx + (r - 4) * Math.sin(rad)} y1={cy - (r - 4) * Math.cos(rad)}
            x2={cx + (r - 9) * Math.sin(rad)} y2={cy - (r - 9) * Math.cos(rad)}
            stroke={color} strokeOpacity={0.12} strokeWidth={1} strokeLinecap="round"
          />
        )
      })}

      {/* 15-min arc */}
      <Path
        d={`M${cx} ${cy - r + 1} A${r - 1} ${r - 1} 0 0 1 ${cx + r - 1} ${cy}`}
        fill="none" stroke={accent} strokeWidth={3} strokeLinecap="round" opacity={0.15}
      />

      {/* Trailing dots along the arc */}
      {dotAngles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <Circle key={i}
            cx={cx + (r + 10) * Math.sin(rad)}
            cy={cy - (r + 10) * Math.cos(rad)}
            r={1.5} fill={accent} fillOpacity={0.08 + i * 0.04}
          />
        )
      })}

      {/* Hour hand (~10 o'clock) */}
      <Line x1={cx} y1={cy} x2={cx - 18} y2={cy - 36} stroke={color} strokeOpacity={0.4} strokeWidth={3} strokeLinecap="round" />
      {/* Minute hand (3 o'clock = 15 min) */}
      <Line x1={cx} y1={cy} x2={cx + 46} y2={cy - 8} stroke={accent} strokeWidth={2} strokeLinecap="round" />

      <Circle cx={cx} cy={cy} r={4.5} fill={accent} />
      <Circle cx={cx} cy={cy} r={2} fill={color} fillOpacity={0.15} />

      {/* "15m" badge */}
      <Rect x="186" y="38" width="40" height="22" rx="7" fill={accent} fillOpacity={0.1} stroke={accent} strokeOpacity={0.25} strokeWidth={0.5} />
      <Rect x="193" y="46" width="10" height="4" rx="1.5" fill={accent} fillOpacity={0.6} />
      <Rect x="206" y="46" width="14" height="4" rx="1.5" fill={accent} fillOpacity={0.35} />

      <Circle cx="22" cy="60" r="3" fill={accent} fillOpacity={0.08} />
      <Circle cx="218" cy="150" r="2.5" fill={accent} fillOpacity={0.1} />
      <Path d="M20 155 A10 10 0 1 1 14 143" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" opacity={0.12} />
      <Path d="M18 158 L20 152 L26 156" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" opacity={0.12} />
    </Svg>
  )
}

function TrendIllustration({ color, accent }: { color: string; accent: string }) {
  const green = '#2D8C4E'
  const red = '#C4391D'

  return (
    <Svg width={240} height={200} viewBox="0 0 240 200">
      {/* Background tilted card */}
      <Rect x="34" y="10" width="172" height="52" rx="10" fill={color} fillOpacity={0.02} stroke={color} strokeOpacity={0.06} strokeWidth={0.5} transform="rotate(-2, 120, 36)" />

      {/* Card 1 */}
      <Rect x="28" y="18" width="184" height="52" rx="10" fill={color} fillOpacity={0.03} stroke={color} strokeOpacity={0.1} strokeWidth={0.7} />
      <Circle cx="50" cy="44" r="10" fill={color} fillOpacity={0.06} />
      <Rect x="66" y="36" width="36" height="5" rx="2" fill={color} fillOpacity={0.12} />
      <Rect x="66" y="45" width="24" height="3.5" rx="1.5" fill={color} fillOpacity={0.06} />
      <Rect x="150" y="36" width="28" height="5" rx="2" fill={color} fillOpacity={0.1} />
      <Rect x="154" y="45" width="24" height="3.5" rx="1.5" fill={green} fillOpacity={0.3} />
      <Polyline points="118,52 124,50 130,51 136,47 142,44 148,45 154,42 160,40 166,38 172,34" fill="none" stroke={green} strokeWidth={1} strokeLinecap="round" opacity={0.35} />

      {/* Card 2 */}
      <Rect x="22" y="78" width="196" height="52" rx="10" fill={color} fillOpacity={0.03} stroke={color} strokeOpacity={0.1} strokeWidth={0.7} />
      <Circle cx="46" cy="104" r="10" fill={color} fillOpacity={0.06} />
      <Rect x="62" y="96" width="40" height="5" rx="2" fill={color} fillOpacity={0.12} />
      <Rect x="62" y="105" width="28" height="3.5" rx="1.5" fill={color} fillOpacity={0.06} />
      <Rect x="156" y="96" width="30" height="5" rx="2" fill={color} fillOpacity={0.1} />
      <Rect x="162" y="105" width="24" height="3.5" rx="1.5" fill={red} fillOpacity={0.3} />
      <Polyline points="120,98 126,100 132,99 138,102 144,106 150,104 156,108 162,110 168,112 174,116" fill="none" stroke={red} strokeWidth={1} strokeLinecap="round" opacity={0.35} />

      {/* Card 3 — highlighted */}
      <Rect x="16" y="138" width="208" height="52" rx="10" fill={color} fillOpacity={0.04} stroke={accent} strokeOpacity={0.3} strokeWidth={1} />
      <Circle cx="40" cy="164" r="10" fill={accent} fillOpacity={0.08} />
      <Rect x="56" y="156" width="44" height="5" rx="2" fill={color} fillOpacity={0.12} />
      <Rect x="56" y="165" width="30" height="3.5" rx="1.5" fill={color} fillOpacity={0.06} />
      <Rect x="160" y="156" width="32" height="5" rx="2" fill={color} fillOpacity={0.1} />
      <Rect x="166" y="165" width="26" height="3.5" rx="1.5" fill={green} fillOpacity={0.4} />
      <Polyline points="112,174 120,170 128,172 136,164 144,158 152,160 160,150 168,146 176,140 184,132" fill="none" stroke={accent} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
      <Path d="M190 140 L195 132 L200 140" fill="none" stroke={accent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />

      <Circle cx="8" cy="50" r="2.5" fill={accent} fillOpacity={0.1} />
      <Circle cx="232" cy="90" r="3" fill={green} fillOpacity={0.12} />
      <Circle cx="12" cy="170" r="2" fill={accent} fillOpacity={0.06} />
      <Circle cx="234" cy="160" r="2" fill={green} fillOpacity={0.08} />
    </Svg>
  )
}

// ─── Cards data ─────────────────────────────────────────────────────────────

const cards = [
  {
    title: 'Paper Trading,\nReal Experience',
    subtitle: 'Practice buying and selling stocks with simulated funds. No real money involved, ever.',
    illustration: 'chart',
    image: require('@/assets/onboarding-home.png'),
  },
  {
    title: 'Market Data,\nZero Risk',
    subtitle: '15-minute delayed prices so you can learn how the market moves without risking a cent.',
    illustration: 'clock',
    image: require('@/assets/onboarding-stocks.png'),
  },
  {
    title: 'Track Your\nPerformance',
    subtitle: 'Build a portfolio, monitor your positions, and see how your strategy performs over time.',
    illustration: 'trend',
    image: require('@/assets/onboarding-activity.png'),
  },
]

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const router = useRouter()
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const { width } = useWindowDimensions()
  const [activeIndex, setActiveIndex] = useState(0)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)
  const s = styles(colors, width)

  async function handleDemo() {
    setDemoError(null)
    setDemoLoading(true)
    try {
      const response = await fetch(`${API}/demo`, { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        await AsyncStorage.setItem('authToken', data.token)
        await AsyncStorage.setItem('username', data.username)
        router.replace('/(tabs)')
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

  function renderIllustration(type: string) {
    const props = { color: colors.text, accent: colors.accent }
    switch (type) {
      case 'chart': return <ChartIllustration {...props} />
      case 'clock': return <ClockIllustration {...props} />
      case 'trend': return <TrendIllustration {...props} />
      default: return null
    }
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <FlatList
        data={cards}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.illustrationWrap}>
              <Image source={item.image} style={s.cardImage} resizeMode="contain" />
            </View>
            <Text style={s.cardTitle}>{item.title}</Text>
            <Text style={s.cardSubtitle}>{item.subtitle}</Text>
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
  },
  card: {
    width,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
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
  cardTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
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
    paddingBottom: 16,
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
    paddingBottom: 48,
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
    color: colors.text,
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