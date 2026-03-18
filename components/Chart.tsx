import { memo, useMemo } from 'react'
import { View, StyleSheet, useColorScheme, useWindowDimensions } from 'react-native'
import { LineChart } from 'react-native-wagmi-charts'
import { Colors } from '@/constants/theme'
import type { ChartData } from '@/types'

const CHART_HEIGHT = 200
const H_PADDING = 32

// ─── Worklet-safe formatters (UI thread, no Intl/toLocaleString) ────────────

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const addCommas = (s: string): string => {
  'worklet'
  let result = ''
  let count = 0
  for (let i = s.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) result = ',' + result
    result = s[i] + result
    count++
  }
  return result
}

const formatPrice = (value: string): string => {
  'worklet'
  if (!value || value === '') return '—'

  const n = Number(value)
  if (isNaN(n)) return '—'

  const neg = n < 0
  const abs = neg ? -n : n

  if (abs > 0 && abs < 1) {
    const s = abs.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
    return (neg ? '-$' : '$') + s
  }

  const fixed = abs.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  return (neg ? '-$' : '$') + addCommas(intPart) + '.' + decPart
}

const formatDate = (value: string): string => {
  'worklet'
  if (!value || value === '') return ''
  const d = new Date(Number(value))
  return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()
}

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  chartData: ChartData[]
}

const Chart = memo(({ chartData }: Props) => {
  const { width } = useWindowDimensions()
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']

  const data = useMemo(
    () =>
      chartData.map(({ date, value }) => ({
        timestamp: new Date(date).getTime(),
        value,
      })),
    [chartData],
  )

  const yRange = useMemo(() => {
    if (data.length === 0) return undefined
    const values = data.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    return { min: min * 0.95, max: max * 1.05 }
  }, [data])

  if (data.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      />
    )
  }

  return (
    <LineChart.Provider data={data} yRange={yRange}>
      <View style={styles.chartWrapper}>
        <LineChart width={width - H_PADDING} height={CHART_HEIGHT}>
          <LineChart.Path color={colors.accent} width={2} />
          <LineChart.CursorCrosshair color={colors.accent}>
            <LineChart.Tooltip
              position="top"
              style={[
                styles.tooltip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <LineChart.PriceText
                format={({ value }) => {
                  'worklet'
                  return formatPrice(value)
                }}
                style={[styles.priceText, { color: colors.text }]}
              />
              <LineChart.DatetimeText
                format={({ value }) => {
                  'worklet'
                  return formatDate(value)
                }}
                style={[styles.dateText, { color: colors.textMuted }]}
              />
            </LineChart.Tooltip>
          </LineChart.CursorCrosshair>
        </LineChart>
      </View>
    </LineChart.Provider>
  )
})

Chart.displayName = 'Chart'

export default Chart

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  empty: {
    height: CHART_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: -49,
  },
  chartWrapper: {
    height: CHART_HEIGHT,
    overflow: 'hidden',
    marginBottom: -49,
    backgroundColor: 'transparent',
  },
  tooltip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
  },
})