import { FlatList, View, Text, Image, Pressable, StyleSheet, useColorScheme } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import { toCurrency, toPercent, toPnlCurrency } from '@/utils'
import type { Positions, Prices, Error } from '@/types'

const FALLBACK_LOGO = require('@/assets/images/icon.png')

interface Props {
  positions?: Positions[]
  prices: Prices
  error: Error
}

function PositionRow({ position, prices, isLast }: { position: Positions; prices: Prices; isLast: boolean }) {
  const router = useRouter()
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']

  const price = prices[position.symbol] ?? position.price
  const totalValue = price * position.shares
  const dailyChange = toPercent(price, position.open)
  const dailyIsPositive = dailyChange?.startsWith('+')
  const dailyColor = dailyChange == null ? colors.textMuted : dailyIsPositive ? colors.positive : colors.negative

  const pnlChange = toPercent(price, position.average_price)
  const pnlIsPositive = pnlChange?.startsWith('+')
  const pnlColor = pnlChange == null ? colors.textMuted : pnlIsPositive ? colors.positive : colors.negative
  const pnlDollars = toPnlCurrency((price - parseFloat(position.average_price)) * position.shares)

  const s = rowStyles(colors)

  return (
    <Pressable
      style={({ pressed }) => [s.row, !isLast && s.rowBorder, pressed && s.rowPressed]}
      onPress={() => router.push(`/(tabs)/stocks/${position.symbol}` as any)}
    >
      <Image
        source={{ uri: `https://img.logo.dev/ticker/${position.symbol}?token=pk_ZBCJebqoQXKBWVLhwcIBfg&retina=true&format=png` }}
        style={s.logo}
        defaultSource={FALLBACK_LOGO}
      />
      <View style={s.middle}>
        <View style={s.symbolRow}>
          <Text style={s.symbol}>{position.symbol}</Text>
          <Text style={s.shares}>{position.shares} shares</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.price}>${toCurrency(price)}</Text>
          <Text style={[s.daily, { color: dailyColor }]}>{dailyChange ?? '—'}</Text>
        </View>
      </View>
      <View style={s.right}>
        <Text style={s.value}>${toCurrency(totalValue)}</Text>
        <View style={s.pnlRow}>
          <Text style={[s.pnl, { color: pnlColor }]}>
            {pnlDollars != null ? `${pnlIsPositive ? '+' : ''}$${pnlDollars}` : '—'}
          </Text>
          <Text style={[s.pnl, { color: pnlColor }]}>{pnlChange ?? '—'}</Text>
        </View>
      </View>
    </Pressable>
  )
}

export default function PositionsList({ positions, prices, error }: Props) {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const s = listStyles(colors)

  if (!positions && error) {
    return <Text style={[s.message, { color: colors.negative }]}>{error}</Text>
  }

  if (!positions || positions.length === 0) {
    return <Text style={s.message}>No positions yet</Text>
  }

  return (
    <FlatList
      data={positions}
      keyExtractor={(item) => item.symbol}
      renderItem={({ item, index }) => (
        <PositionRow
          position={item}
          prices={prices}
          isLast={index === positions.length - 1}
        />
      )}
      scrollEnabled={false}
    />
  )
}

const rowStyles = (colors: typeof Colors.light) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    opacity: 0.6,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  middle: {
    flex: 1,
    gap: 2,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  symbol: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  shares: {
    fontSize: 12,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  daily: {
    fontSize: 12,
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
  },
  pnlRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pnl: {
    fontSize: 12,
    fontWeight: '500',
  },
})

const listStyles = (colors: typeof Colors.light) => StyleSheet.create({
  message: {
    color: colors.textMuted,
    fontSize: 14,
  },
})
