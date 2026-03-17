import { useState } from 'react'
import { View, Text, Image, FlatList, Pressable, StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import { Colors } from '@/constants/theme'
import { toCurrency, toPnl } from '@/utils'
import { useActivity } from '@/hooks/useApi'

interface Activity {
  date: string
  id: number
  market_price: string
  quantity: number
  realized_pnl: string | null
  symbol: string
  transaction_type: 'Buy' | 'Sell' | 'Deposit' | 'Withdraw'
  value: string
}

const IS_POSITIVE: Record<Activity['transaction_type'], boolean> = {
  Sell:     true,
  Deposit:  true,
  Buy:      false,
  Withdraw: false,
}


function DetailRow({ label, value, valueColor, colors }: {
  label: string
  value: string
  valueColor?: string
  colors: typeof Colors.light
}) {
  const s = rowStyles(colors)
  return (
    <View style={s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={[s.detailValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  )
}

function TransactionRow({ item, colors, isLast, isExpanded, onPress }: {
  item: Activity
  colors: typeof Colors.light
  isLast: boolean
  isExpanded: boolean
  onPress: () => void
}) {
  const s = rowStyles(colors)
  const isPositive = IS_POSITIVE[item.transaction_type]
  const iconColor = isPositive ? colors.positive : colors.negative
  const amountPrefix = isPositive ? '+' : '-'
  const amount = `${amountPrefix}$${toCurrency(item.value) ?? '—'}`

  const title = item.symbol
    ? `${item.transaction_type} ${item.symbol}`
    : item.transaction_type

  const pnl = toPnl(item.realized_pnl)
  const pnlIsPositive = typeof pnl === 'string' && pnl.startsWith('$') && !pnl.startsWith('$-')
  const pnlColor = item.realized_pnl == null ? colors.textHint : pnlIsPositive ? colors.positive : colors.negative

  const subRight = item.quantity
    ? `${item.quantity.toLocaleString()} shares`
    : pnl ?? '—'
  const subRightColor = item.quantity ? colors.textMuted : pnlColor


  const isTrade = item.transaction_type === 'Buy' || item.transaction_type === 'Sell'

  return (
    <Animated.View layout={Layout.duration(200)} style={!isLast && s.rowBorder}>
      <Pressable style={s.row} onPress={onPress}>
        {/* Icon */}
        {isTrade ? (
          <Image
            source={{ uri: `https://img.logo.dev/ticker/${item.symbol}?token=pk_ZBCJebqoQXKBWVLhwcIBfg&retina=true&format=png` }}
            style={s.logo}
          />
        ) : (
          <View style={[s.icon, { backgroundColor: '#F5F4EE' }]}>
            <Text style={[s.iconText, { color: iconColor }]}>
              {item.transaction_type[0]}
            </Text>
          </View>
        )}

        {/* Middle */}
        <View style={s.middle}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          <Text style={s.date}>{item.date}</Text>
        </View>

        {/* Right */}
        <View style={s.right}>
          <Text style={[s.amount, { color: isPositive ? colors.positive : colors.text }]}>
            {amount}
          </Text>
          <Text style={[s.sub, { color: subRightColor }]}>{subRight}</Text>
        </View>
      </Pressable>

      {/* Expandable details */}
      {isExpanded && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)}>
          <View style={s.details}>
            {item.quantity > 0 && (
              <DetailRow label="Quantity" value={item.quantity.toLocaleString()} colors={colors} />
            )}
            {item.market_price && (
              <DetailRow label="Price per share" value={`$${toCurrency(item.market_price) ?? '—'}`} colors={colors} />
            )}
            <DetailRow label="Total value" value={`$${toCurrency(item.value) ?? '—'}`} colors={colors} />
            {item.transaction_type === 'Sell' && pnl && (
              <DetailRow label="Realized PnL" value={pnl} valueColor={pnlColor} colors={colors} />
            )}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  )
}

export default function ActivityScreen() {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']

  const { data: activityData, isLoading, isError } = useActivity()
  const [expandedId, setExpandedId] = useState<number | null>(null)

  function handlePress(id: number) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const s = styles(colors)

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <FlatList
        data={activityData ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <TransactionRow
            item={item}
            colors={colors}
            isLast={index === (activityData?.length ?? 0) - 1}
            isExpanded={expandedId === item.id}
            onPress={() => handlePress(item.id)}
          />
        )}
        contentContainerStyle={s.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={s.emptyText}>{isError ? 'Unable to fetch transactions, please try again' : 'No activity yet'}</Text>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const rowStyles = (colors: typeof Colors.light) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  middle: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
  },
  sub: {
    fontSize: 12,
  },
  details: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
})

const styles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
})
