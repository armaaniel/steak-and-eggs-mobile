import { View, Text, Image, StyleSheet, useColorScheme } from 'react-native'
import { Colors } from '@/constants/theme'
import { toCurrency, toPercent, toPnlCurrency } from '@/utils'
import type { Position, Price } from '@/types'

// TODO: replace with a proper fallback-logo asset
const FALLBACK_LOGO = require('@/assets/images/icon.png')

interface Props {
  position: Position
  price: Price
}

export default function PositionCard({ position, price }: Props) {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']

  const value = price != null ? Number(price) * Number(position.shares) : null
  const pnl = price != null ? (Number(price) - Number(position.average_price)) * Number(position.shares) : null
  const pnlChange = toPercent(price, position.average_price)
  const pnlIsPositive = pnlChange?.startsWith('+')
  const pnlColor = pnlChange == null ? colors.textMuted : pnlIsPositive ? colors.positive : colors.negative

  const s = styles(colors)

  return (
    <View style={s.card}>
      {/* Left: logo + symbol + shares */}
      <View style={s.left}>
        <Image
          source={{ uri: `https://img.logo.dev/ticker/${position.symbol}?token=pk_ZBCJebqoQXKBWVLhwcIBfg&retina=true&format=png` }}
          style={s.logo}
          defaultSource={FALLBACK_LOGO}
        />
        <View>
          <Text style={s.symbol}>{position.symbol}</Text>
          <Text style={s.shares}>{position.shares} shares</Text>
        </View>
      </View>

      {/* Right: total value + avg price + PnL */}
      <View style={s.right}>
        <Text style={s.value}>{value != null ? `$${toCurrency(value)}` : '—'}</Text>
        <Text style={s.avgPrice}>avg ${toCurrency(position.average_price)}</Text>
        <View style={s.pnlRow}>
          <Text style={[s.pnl, { color: pnlColor }]}>
            {pnl != null ? `$${toPnlCurrency(pnl)}` : '—'}
          </Text>
          <Text style={[s.pnl, { color: pnlColor }]}>{pnlChange ?? '—'}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = (colors: typeof Colors.light) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
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
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  avgPrice: {
    fontSize: 12,
    color: colors.textMuted,
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
