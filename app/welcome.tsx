import { useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  ViewToken,
} from 'react-native'
import { useRouter } from 'expo-router'
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg'
import { Colors } from '@/constants/theme'

function ChartIllustration({ color, accent }: { color: string; accent: string }) {
  return (
    <Svg width={200} height={160} viewBox="0 0 200 160">
      {/* Grid lines */}
      <Line x1="30" y1="20" x2="30" y2="130" stroke={color} strokeOpacity={0.15} strokeWidth={1} />
      <Line x1="30" y1="130" x2="185" y2="130" stroke={color} strokeOpacity={0.15} strokeWidth={1} />
      <Line x1="30" y1="85" x2="185" y2="85" stroke={color} strokeOpacity={0.08} strokeWidth={1} strokeDasharray="4,4" />
      <Line x1="30" y1="52" x2="185" y2="52" stroke={color} strokeOpacity={0.08} strokeWidth={1} strokeDasharray="4,4" />
      {/* Chart line */}
      <Polyline
        points="30,110 55,95 80,100 105,70 130,55 155,60 180,35"
        fill="none"
        stroke={accent}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot at end */}
      <Circle cx="180" cy="35" r="5" fill={accent} />
      {/* Bars at bottom */}
      <Rect x="40" y="118" width="8" height="12" rx={2} fill={color} fillOpacity={0.1} />
      <Rect x="58" y="114" width="8" height="16" rx={2} fill={color} fillOpacity={0.1} />
      <Rect x="76" y="110" width="8" height="20" rx={2} fill={color} fillOpacity={0.15} />
      <Rect x="94" y="106" width="8" height="24" rx={2} fill={color} fillOpacity={0.15} />
      <Rect x="112" y="112" width="8" height="18" rx={2} fill={color} fillOpacity={0.1} />
      <Rect x="130" y="108" width="8" height="22" rx={2} fill={color} fillOpacity={0.15} />
      <Rect x="148" y="102" width="8" height="28" rx={2} fill={accent} fillOpacity={0.3} />
    </Svg>
  )
}

function ClockIllustration({ color, accent }: { color: string; accent: string }) {
  return (
    <Svg width={200} height={160} viewBox="0 0 200 160">
      {/* Clock face */}
      <Circle cx="100" cy="80" r="55" fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={2} />
      <Circle cx="100" cy="80" r="48" fill="none" stroke={color} strokeOpacity={0.08} strokeWidth={1} />
      {/* Hour ticks */}
      <Line x1="100" y1="30" x2="100" y2="36" stroke={color} strokeOpacity={0.3} strokeWidth={2} />
      <Line x1="100" y1="124" x2="100" y2="130" stroke={color} strokeOpacity={0.3} strokeWidth={2} />
      <Line x1="50" y1="80" x2="56" y2="80" stroke={color} strokeOpacity={0.3} strokeWidth={2} />
      <Line x1="144" y1="80" x2="150" y2="80" stroke={color} strokeOpacity={0.3} strokeWidth={2} />
      {/* Hour hand */}
      <Line x1="100" y1="80" x2="100" y2="50" stroke={color} strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
      {/* Minute hand */}
      <Line x1="100" y1="80" x2="130" y2="65" stroke={accent} strokeWidth={2.5} strokeLinecap="round" />
      {/* Center dot */}
      <Circle cx="100" cy="80" r="4" fill={accent} />
      {/* "15" label */}
      <Rect x="140" y="28" width="36" height="22" rx={6} fill={accent} fillOpacity={0.15} />
      <Path d="M151 35 v10 M156 35 a4 4 0 0 1 4 4 v0 a4 4 0 0 1-4 4 h-1 M156 39 h3" fill="none" stroke={accent} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  )
}

function TrendIllustration({ color, accent }: { color: string; accent: string }) {
  return (
    <Svg width={200} height={160} viewBox="0 0 200 160">
      {/* Card outlines */}
      <Rect x="20" y="25" width="70" height="45" rx={8} fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={1.5} />
      <Rect x="110" y="25" width="70" height="45" rx={8} fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={1.5} />
      <Rect x="20" y="90" width="70" height="45" rx={8} fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={1.5} />
      <Rect x="110" y="90" width="70" height="45" rx={8} fill={accent} fillOpacity={0.08} stroke={accent} strokeOpacity={0.3} strokeWidth={1.5} />
      {/* Mini sparklines in cards */}
      <Polyline points="30,55 40,50 50,52 60,42 70,38 80,40" fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={1.5} strokeLinecap="round" />
      <Polyline points="120,55 130,52 140,56 150,48 160,50 170,44" fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={1.5} strokeLinecap="round" />
      <Polyline points="30,120 40,118 50,122 60,115 70,119 80,112" fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={1.5} strokeLinecap="round" />
      {/* Highlighted card sparkline */}
      <Polyline points="120,120 130,115 140,118 150,108 160,105 170,95" fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" />
      {/* Arrow up in highlighted card */}
      <Path d="M168 97 l4-6 l4 6" fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Label bars */}
      <Rect x="30" y="35" width="25" height="4" rx={2} fill={color} fillOpacity={0.15} />
      <Rect x="120" y="35" width="20" height="4" rx={2} fill={color} fillOpacity={0.15} />
      <Rect x="30" y="100" width="22" height="4" rx={2} fill={color} fillOpacity={0.15} />
      <Rect x="120" y="100" width="28" height="4" rx={2} fill={accent} fillOpacity={0.3} />
    </Svg>
  )
}

const cards = [
  {
    title: 'Paper Trading,\nReal Experience',
    subtitle: 'Practice buying and selling stocks with simulated funds. No real money involved — ever.',
    illustration: 'chart',
  },
  {
    title: 'Market Data,\nZero Risk',
    subtitle: '15-minute delayed prices so you can learn how the market moves without risking a cent.',
    illustration: 'clock',
  },
  {
    title: 'Track Your\nPerformance',
    subtitle: 'Build a portfolio, monitor your positions, and see how your strategy plays out over time.',
    illustration: 'trend',
  },
]

export default function WelcomeScreen() {
  const router = useRouter()
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const { width } = useWindowDimensions()
  const [activeIndex, setActiveIndex] = useState(0)
  const s = styles(colors, width)

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
    <View style={s.container}>
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
              {renderIllustration(item.illustration)}
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
      </View>
    </View>
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
    marginBottom: 32,
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
    paddingBottom: 32,
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
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 16,
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
})
