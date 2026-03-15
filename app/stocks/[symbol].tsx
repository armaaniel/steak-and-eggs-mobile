import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  useColorScheme,
} from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '@/constants/theme'
import { toReadable, toCurrency, toPercent } from '@/utils'
import { getConsumer, resetConsumer } from '@/consumer'
import Chart from '@/components/Chart'
import BuySell from '@/components/BuySell'
import PositionCard from '@/components/PositionCard'
import type { TickerData, UserData, ChartData, Price, Open } from '@/types'

// TODO: replace with a proper fallback-logo asset
const FALLBACK_LOGO = require('@/assets/images/icon.png')

const FADE_DURATION = 250

const EXCHANGE_NAMES: { [key: string]: string } = {
  XNAS: 'NASDAQ',
  BATS: 'BATS',
  XASE: 'NYSE American',
  XNYS: 'NYSE',
  ARCX: 'NYSE Arca',
}

interface MarketData {
  high: number | string
  open: number | string
  low: number | string
  volume: number | string
}

interface CompanyData {
  description: string | null
  market_cap: number | string | null
}

function useFadeIn(trigger: unknown) {
  const opacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (trigger != null) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start()
    }
  }, [trigger])
  return opacity
}

export default function StockScreen() {
  const router = useRouter()
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const API = process.env.EXPO_PUBLIC_API_URL

  const params = useLocalSearchParams<{ symbol: string }>()
  const symbol = params.symbol?.toUpperCase()

  const [tickerData, setTickerData] = useState<TickerData | null>(null)
  const [tickerNotFound, setTickerNotFound] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [price, setPrice] = useState<Price>(null)
  const [open, setOpen] = useState<Open>(null)
  const [asOf, setAsOf] = useState(new Date(Date.now() - 15 * 60 * 1000))

  const tickerOpacity = useFadeIn(tickerData)
  const priceOpacity = useFadeIn(price)
  const chartOpacity = useFadeIn(chartData.length > 0 ? chartData : null)
  const marketOpacity = useFadeIn(marketData)
  const companyOpacity = useFadeIn(companyData)

  const percentChange = toPercent(price, open)
  const isPositive = Boolean(percentChange && percentChange.startsWith('+'))
  const changeColor = percentChange == null
    ? colors.textMuted
    : isPositive ? colors.positive : colors.negative

  async function handle401() {
    await AsyncStorage.removeItem('authToken')
    resetConsumer()
    router.replace('/login')
  }

  async function getUserData() {
    const token = await AsyncStorage.getItem('authToken')
    if (!token) { router.replace('/login'); return }
    try {
      const response = await fetch(`${API}/stocks/${symbol}/userdata`, {
        headers: { authToken: token },
      })
      if (response.status === 401) { await handle401(); return }
      const data = await response.json()
      setUserData(data)
    } catch {
      setUserData({ balance: 'N/A' })
    }
  }

  // Ticker + user data in parallel on symbol change
  useEffect(() => {
    async function getData() {
      const token = await AsyncStorage.getItem('authToken')
      if (!token) { router.replace('/login'); return }

      setTickerNotFound(false)
      try {
        const [tickerResponse] = await Promise.all([
          fetch(`${API}/stocks/${symbol}/tickerdata`, { headers: { authToken: token } }),
          getUserData(),
        ])
        if (tickerResponse.ok) {
          const data = await tickerResponse.json()
          setTickerData(data)
          // Save to recents
          const raw = await AsyncStorage.getItem('recentStocks')
          const recents: { symbol: string; name: string }[] = raw ? JSON.parse(raw) : []
          const filtered = recents.filter((r) => r.symbol !== symbol)
          filtered.unshift({ symbol, name: data.name ?? symbol })
          await AsyncStorage.setItem('recentStocks', JSON.stringify(filtered.slice(0, 12)))
        } else if (tickerResponse.status === 401) {
          await handle401()
        } else {
          setTickerNotFound(true)
        }
      } catch {
        setTickerData({ exchange: 'N/A', name: 'N/A', ticker_type: 'N/A' })
      }
    }
    getData()
  }, [symbol])

  useEffect(() => {
    async function getChartData() {
      const token = await AsyncStorage.getItem('authToken')
      if (!token) return
      try {
        const response = await fetch(`${API}/stocks/${symbol}/chartdata`, { headers: { authToken: token } })
        if (response.status === 401) { await handle401(); return }
        setChartData(await response.json())
      } catch {
        const today = new Date()
        setChartData([
          { date: today.toLocaleDateString(), value: 0 },
          { date: today.toLocaleDateString(), value: 0 },
        ])
      }
    }
    getChartData()
  }, [symbol])

  useEffect(() => {
    async function getCompanyData() {
      setCompanyData(null)
      const token = await AsyncStorage.getItem('authToken')
      if (!token) return
      try {
        const response = await fetch(`${API}/stocks/${symbol}/companydata`, { headers: { authToken: token } })
        if (response.status === 401) { await handle401(); return }
        setCompanyData(await response.json())
      } catch {
        setCompanyData({ market_cap: 'N/A', description: 'N/A' })
      }
    }
    getCompanyData()
  }, [symbol])

  useEffect(() => {
    async function getMarketData() {
      setMarketData(null)
      const token = await AsyncStorage.getItem('authToken')
      if (!token) return
      try {
        const response = await fetch(`${API}/stocks/${symbol}/marketdata`, { headers: { authToken: token } })
        if (response.status === 401) { await handle401(); return }
        setMarketData(await response.json())
      } catch {
        setMarketData({ open: 'N/A', high: 'N/A', low: 'N/A', volume: 'N/A' })
      }
    }
    getMarketData()
  }, [symbol])

  useEffect(() => {
    async function getStockPrice() {
      const token = await AsyncStorage.getItem('authToken')
      if (!token) return
      try {
        const response = await fetch(`${API}/stocks/${symbol}/stockprice`, { headers: { authToken: token } })
        if (response.status === 401) { await handle401(); return }
        const data = await response.json()
        setPrice(data.price)
        setOpen(data.open)
      } catch {
        setPrice('N/A')
        setOpen('N/A')
      }
    }
    getStockPrice()
  }, [symbol])

  // WebSocket: live price updates
  useEffect(() => {
    let subscription: any = null
    const setup = async () => {
      const consumer = await getConsumer()
      subscription = consumer.subscriptions.create(
        { channel: 'PriceChannel', symbol },
        { received(data: number) { setPrice(data) } },
      )
    }
    setup()
    return () => subscription?.unsubscribe()
  }, [symbol])

  // "As of" timestamp refresh every 15s
  useEffect(() => {
    const id = setInterval(() => setAsOf(new Date(Date.now() - 15 * 60 * 1000)), 15000)
    return () => clearInterval(id)
  }, [])

  const s = styles(colors)

  if (tickerNotFound) {
    return (
      <>
        <Stack.Screen options={{ title: symbol, headerBackTitle: 'Back' }} />
        <View style={s.notFound}>
          <Text style={s.notFoundText}>Ticker "{symbol}" not found.</Text>
        </View>
      </>
    )
  }

  return (
    <>
      <Stack.Screen options={{ title: symbol, headerBackTitle: 'Back' }} />
      <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>

        {/* 1. Back button + logo + symbol + name */}
        <Pressable onPress={() => router.replace('/(tabs)')} hitSlop={12} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </Pressable>
        <View style={s.heading}>
          <Image
            source={{ uri: `https://img.logo.dev/ticker/${symbol}?token=pk_ZBCJebqoQXKBWVLhwcIBfg&retina=true&format=png` }}
            style={s.logo}
            defaultSource={FALLBACK_LOGO}
          />
          <View style={s.headingText}>
            <Text style={s.symbol}>{symbol}</Text>
            <Animated.Text style={[s.name, { opacity: tickerOpacity }]}>{tickerData?.name}</Animated.Text>
          </View>
        </View>

        {/* 2. Price + percent change + timestamp */}
        <View style={s.priceRow}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={s.price}>$</Text>
              <Animated.View style={{ opacity: priceOpacity }}>
                <Text style={s.price}>{toCurrency(price)}</Text>
              </Animated.View>
              <Text style={s.priceCurrency}> USD</Text>
            </View>
            <Text style={s.asOf}>{asOf.toLocaleTimeString()}</Text>
          </View>
          <Animated.View style={{ opacity: priceOpacity }}>
            <Text style={[s.percentChange, { color: changeColor }]}>{percentChange}</Text>
          </Animated.View>
        </View>

        {/* 3. Chart */}
        <Animated.View style={{ opacity: chartOpacity }}>
          <Chart chartData={chartData} />
        </Animated.View>

        {/* 4. Buy/Sell */}
        <BuySell
          getUserData={getUserData}
          balance={userData?.balance}
          price={price}
          position={userData?.position}
          name={tickerData?.name}
          symbol={symbol}
        />

        {/* 5. Holdings card (if position exists) */}
        {userData?.position && (
          <View style={s.section}>
            <Text style={s.sectionHeader}>Holdings</Text>
            <PositionCard position={userData.position} price={price} />
          </View>
        )}

        {/* 6. Market details grid */}
        <View style={s.section}>
          <Text style={s.sectionHeader}>Market Details</Text>
          <View style={s.grid}>
            <MarketCell label="Open" value={`$${toCurrency(marketData?.open) ?? ''}`} opacity={marketOpacity} />
            <MarketCell label="High" value={`$${toCurrency(marketData?.high) ?? ''}`} opacity={marketOpacity} />
            <MarketCell label="Low" value={`$${toCurrency(marketData?.low) ?? ''}`} opacity={marketOpacity} />
            <MarketCell label="Volume" value={toReadable(marketData?.volume) ?? ''} opacity={marketOpacity} />
            <MarketCell label="Currency" value="USD" opacity={marketOpacity} />
            <MarketCell label="Exchange" value={EXCHANGE_NAMES[tickerData?.exchange ?? ''] ?? tickerData?.exchange ?? ''} opacity={marketOpacity} />
            {tickerData?.ticker_type === 'CS' && (
              <MarketCell label="Market Cap" value={toReadable(companyData?.market_cap) ?? ''} opacity={companyOpacity} />
            )}
          </View>
        </View>

        {/* 7. Company description (common stocks only) */}
        {tickerData?.ticker_type === 'CS' && companyData?.description && (
          <Animated.View style={[s.section, { opacity: companyOpacity }]}>
            <Text style={s.sectionHeader}>Description</Text>
            <Text style={s.description}>{companyData.description}</Text>
          </Animated.View>
        )}

      </ScrollView>
      </SafeAreaView>
    </>
  )
}

function MarketCell({ label, value, opacity }: { label: string; value: string; opacity: Animated.Value }) {
  const colors = Colors[useColorScheme() === 'dark' ? 'dark' : 'light']
  return (
    <View style={cellStyles.cell}>
      <Text style={[cellStyles.label, { color: colors.textMuted }]}>{label}</Text>
      <Animated.View style={{ opacity }}>
        <Text style={[cellStyles.value, { color: colors.text }]}>{value}</Text>
      </Animated.View>
    </View>
  )
}

const cellStyles = StyleSheet.create({
  cell: { width: '50%', paddingVertical: 8, paddingHorizontal: 4 },
  label: { fontSize: 14, marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '500' },
})

const styles = (colors: typeof Colors.light) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 20, paddingBottom: 48 },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 16, color: colors.textMuted },

  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headingText: { flex: 1 },
  backBtn: { padding: 4 },
  backBtnText: { fontSize: 24, color: colors.textMuted, lineHeight: 28 },
  logo: { width: 48, height: 48, borderRadius: 10 },
  symbol: { fontSize: 20, fontWeight: '700', color: colors.text },
  name: { fontSize: 14, color: colors.textMuted },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: { fontSize: 28, fontWeight: '700', color: colors.text },
  priceCurrency: { fontSize: 16, fontWeight: '400', color: colors.textMuted },
  asOf: { fontSize: 12, color: colors.textHint, marginTop: 2 },
  percentChange: { fontSize: 18, fontWeight: '600' },

  section: { gap: 10 },
  sectionHeader: { fontSize: 18, fontWeight: '600', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },

  description: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
})
