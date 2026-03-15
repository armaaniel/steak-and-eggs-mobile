import { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, useColorScheme } from 'react-native'
import { useThrottledCallback } from 'use-debounce'
import { Colors } from '@/constants/theme'
import { toPortfolio } from '@/utils'
import { getConsumer } from '@/consumer'
import Chart from '@/components/Chart'
import PositionsList from '@/components/PositionsList'
import { usePortfolio, usePortfolioChart } from '@/hooks/useApi'
import type { Positions, Prices } from '@/types'

export default function HomeScreen() {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']

  const { data: portfolio, isError } = usePortfolio()
  const { data: chartData = [] } = usePortfolioChart()

  const [prices, setPrices] = useState<Prices>({})
  const [liveAum, setLiveAum] = useState<number | undefined>()

  useEffect(() => {
    if (!portfolio?.positions) return

    let subscriptions: any[] = []

    const setup = async () => {
      const consumer = await getConsumer()
      subscriptions = (portfolio.positions as Positions[]).map((position) =>
        consumer.subscriptions.create(
          { channel: 'PriceChannel', symbol: position.symbol },
          {
            received(data: number) {
              setPrices((prev) => ({ ...prev, [position.symbol]: data }))
            },
          },
        ),
      )
    }

    setup()
    return () => subscriptions.forEach((sub) => sub.unsubscribe())
  }, [portfolio?.positions])

  const updateLiveAum = useThrottledCallback(
    () => {
      if (!portfolio?.positions || Object.keys(prices).length === 0) return
      const stockValue = (portfolio.positions as Positions[]).reduce((acc: number, position: Positions) => {
        const price = prices[position.symbol] || position.price
        return acc + price * position.shares
      }, 0)
      setLiveAum(stockValue + parseFloat(portfolio?.balance || '0'))
    },
    5000,
    { trailing: false },
  )

  useEffect(() => {
    updateLiveAum()
  }, [prices, portfolio?.positions, portfolio?.balance, updateLiveAum])

  const aum = liveAum ?? portfolio?.aum
  const s = styles(colors)

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>
      {/* 1. Portfolio value */}
      <Text style={s.valueAmount}>{toPortfolio(aum) ?? '—'}</Text>
      <Text style={s.cashLine}>Cash: {toPortfolio(portfolio?.balance) ?? '—'}</Text>

      {/* 2. Chart */}
      <Chart chartData={chartData} />

      {/* 3. Holdings */}
      <View>
        <Text style={s.sectionHeader}>Holdings</Text>
        <PositionsList
          positions={portfolio?.positions}
          prices={prices}
          error={isError ? 'Unable to fetch positions, please try again' : null}
        />
      </View>
    </ScrollView>
  )
}

const styles = (colors: typeof Colors.light) => StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingTop: 20,
    gap: 16,
  },
  valueAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  cashLine: {
    fontSize: 15,
    color: colors.textMuted,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
})
