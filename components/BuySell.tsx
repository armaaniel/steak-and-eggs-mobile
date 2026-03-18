import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { Colors } from '@/constants/theme'
import { toCurrency } from '@/utils'
import { useBuy, useSell } from '@/hooks/useApi'
import type { Position, Price, Error } from '@/types'

interface Props {
  getUserData?: () => void
  balance: string | undefined
  position: Position | undefined
  price: Price
  name: string | undefined
  symbol: string | undefined
}

interface OrderData {
  market_price: string
  quantity: number
  symbol: string
  value: string
}

export default function BuySell({ getUserData, balance, position, price, name, symbol }: Props) {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']

  const buy = useBuy()
  const sell = useSell()

  const [action, setAction] = useState<'buy' | 'sell'>('buy')
  const [step, setStep] = useState(1)
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState<Error>(null)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [time, setTime] = useState<string | null>(null)

  const isSubmitting = buy.isPending || sell.isPending

  const isBuy = action === 'buy'
  const [tabWidth, setTabWidth] = useState(0)
  const slideX = useSharedValue(0)
  const balanceOpacity = useSharedValue(balance != null ? 1 : 0)

  useEffect(() => {
    if (balance != null) {
      balanceOpacity.value = withTiming(1, { duration: 250 })
    }
  }, [balance])

  function handleTabLayout(e: { nativeEvent: { layout: { width: number } } }) {
    setTabWidth(e.nativeEvent.layout.width)
  }

  function handleSetAction(next: 'buy' | 'sell') {
    const toX = next === 'buy' ? 0 : tabWidth / 2
    slideX.value = withTiming(toX, { duration: 180, easing: Easing.out(Easing.cubic) })
    setAction(next)
    setQuantity('')
  }

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }))

  const estimatedCost = (() => {
    if (price === null) return 'N/A'
    return (Number(quantity) || 0) * Number(price)
  })()

  const free = estimatedCost === 0 || isNaN(estimatedCost as any)
  const hasInsufficientFunds = balance != null && (isNaN(Number(balance)) || (typeof estimatedCost === 'number' && estimatedCost > Number(balance)))
  const hasInsufficientShares = Number(quantity) > (position?.shares || 0)
  const quantityInvalid = quantity === ''

  function handleChangeText(text: string) {
    // digits and one decimal point only, max 2 decimal places
    let cleaned = text.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('')
    if (parts.length === 2 && parts[1].length > 2) cleaned = parts[0] + '.' + parts[1].slice(0, 2)
    setQuantity(cleaned)
  }

  function resetState() {
    setAction('buy')
    setStep(1)
    setQuantity('')
    setError(null)
    setOrderData(null)
    setTime(null)
  }

  useEffect(() => {
    resetState()
  }, [symbol])

  function handleSubmit() {
    if (!symbol || !name) return
    setError(null)
    const mutation = action === 'buy' ? buy : sell
    mutation.mutate({ symbol, name, quantity }, {
      onSuccess: (data) => {
        setOrderData(data)
        getUserData?.()
      },
      onError: (err) => {
        setError(err.message)
      },
      onSettled: () => {
        setTime(new Date().toLocaleTimeString())
        setStep(3)
      },
    })
  }

  const s = styles(colors)

  // ─── Step 1: Order Entry ────────────────────────────────────────────────────
  if (step === 1) {
    const balanceLoading = balance == null
    const priceLoading = price == null
    const blockNext = (isBuy ? (balanceLoading || hasInsufficientFunds) : hasInsufficientShares) || priceLoading || quantityInvalid || free

    return (
      <View style={s.card}>
        {/* Buy / Sell toggle */}
        <View style={s.toggle} onLayout={handleTabLayout}>
          {tabWidth > 0 && (
            <Animated.View style={[s.slider, { width: tabWidth / 2 }, sliderStyle]} />
          )}
          <Pressable style={s.toggleBtn} onPress={() => handleSetAction('buy')}>
            <Text style={[s.toggleText, isBuy && s.toggleTextActive]}>Buy</Text>
          </Pressable>
          <Pressable style={s.toggleBtn} onPress={() => handleSetAction('sell')}>
            <Text style={[s.toggleText, !isBuy && s.toggleTextActive]}>Sell</Text>
          </Pressable>
        </View>

        <View style={s.divider} />

        {/* Order type */}
        <View style={s.row}>
          <Text style={s.rowLabel}>Order Type</Text>
          <Text style={s.rowValue}>{isBuy ? 'Buy' : 'Sell'}</Text>
        </View>

        {/* Shares input */}
        <View style={s.row}>
          <Text style={s.rowLabel}>Shares</Text>
          <TextInput
            style={s.sharesInput}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textHint}
            value={quantity}
            onChangeText={handleChangeText}
          />
        </View>

        {/* Estimated cost / value */}
        <View style={s.row}>
          <Text style={s.rowLabel}>{isBuy ? 'Estimated Cost' : 'Estimated Value'}</Text>
          <Text style={s.rowValue}>
            {price === null ? '$0.00 USD' : `$${toCurrency(estimatedCost)} USD`}
          </Text>
        </View>

        <View style={s.divider} />

        {/* Available cash / shares */}
        <View style={s.row}>
          <Text style={s.rowLabel}>{isBuy ? 'Available Cash' : 'Available Shares'}</Text>
          <Animated.Text style={[s.rowValue, { opacity: isBuy ? balanceOpacity : 1 }]}>
            {isBuy ? `$${toCurrency(balance)} USD` : (position?.shares?.toLocaleString() ?? '0')}
          </Animated.Text>
        </View>

        {/* Inline error */}
        {((isBuy && hasInsufficientFunds) || (!isBuy && hasInsufficientShares)) && (
          <Text style={s.inlineError}>
            {isBuy ? 'Insufficient funds for this purchase' : 'Insufficient shares for this sale'}
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [s.actionBtn, (blockNext || pressed) && s.actionBtnDisabled]}
          onPress={() => setStep(2)}
          disabled={blockNext}
        >
          <Text style={s.actionBtnText}>Next</Text>
        </Pressable>
      </View>
    )
  }

  // ─── Step 2: Review ─────────────────────────────────────────────────────────
  if (step === 2) {
    const blockSubmit = isSubmitting || (isBuy && hasInsufficientFunds) || (!isBuy && hasInsufficientShares)

    return (
      <View style={[s.card, { gap: 16 }]}>
        <Pressable style={s.backBtn} onPress={() => setStep(1)}>
          <Text style={s.backBtnText}><Text style={s.backArrow}>←</Text> back</Text>
        </Pressable>

        <View style={s.row}>
          <Text style={s.rowLabel}>Order</Text>
          <Text style={s.rowValue}>{isBuy ? 'Buy' : 'Sell'}</Text>
        </View>

        <View style={s.row}>
          <Text style={s.rowLabel}>Symbol</Text>
          <Text style={s.rowValue}>{symbol}</Text>
        </View>

        <View style={s.row}>
          <Text style={s.rowLabel}>Shares</Text>
          <Text style={s.rowValue}>{parseFloat(quantity).toLocaleString()}</Text>
        </View>

        <View style={s.row}>
          <Text style={s.rowLabel}>{isBuy ? 'Estimated Cost' : 'Estimated Value'}</Text>
          <Text style={s.rowValue}>${toCurrency(estimatedCost)} USD</Text>
        </View>

        <View style={s.divider} />

        {((isBuy && hasInsufficientFunds) || (!isBuy && hasInsufficientShares)) && (
          <Text style={s.inlineError}>
            {isBuy ? 'Insufficient funds for this purchase' : 'Insufficient shares for this sale'}
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [s.actionBtn, (blockSubmit || pressed) && s.actionBtnDisabled]}
          onPress={handleSubmit}
          disabled={blockSubmit}
        >
          {isSubmitting
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={s.actionBtnText}>Submit</Text>
          }
        </Pressable>
      </View>
    )
  }

  // ─── Step 3: Result ──────────────────────────────────────────────────────────
  if (step === 3 && !isSubmitting) {
    const succeeded = !!orderData && !error

    return (
      <View style={s.card}>
        <View style={s.resultHeader}>
          <Text style={[s.resultTitle, { color: succeeded ? colors.positive : colors.negative }]}>
            {succeeded ? 'Order Success' : 'Order Failed'}
          </Text>
          {time && <Text style={s.resultTime}>Today at {time}</Text>}
        </View>

        <View style={s.divider} />

        <View style={s.row}>
          <Text style={s.rowLabel}>Order</Text>
          <Text style={s.rowValue}>
            {isBuy
              ? `Buy ${succeeded ? orderData!.symbol : symbol}`
              : `Sell ${succeeded ? orderData!.symbol : symbol}`}
          </Text>
        </View>

        {succeeded ? (
          <>
            <View style={s.row}>
              <Text style={s.rowLabel}>{isBuy ? 'Cost' : 'Value'}</Text>
              <Text style={s.rowValue}>${toCurrency(orderData!.value)} USD</Text>
            </View>
            <View style={s.row}>
              <Text style={s.rowLabel}>Shares</Text>
              <Text style={s.rowValue}>{orderData!.quantity.toLocaleString()}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.rowLabel}>Price Per Share</Text>
              <Text style={s.rowValue}>${toCurrency(orderData!.market_price)} USD</Text>
            </View>
          </>
        ) : (
          <>
            <View style={s.row}>
              <Text style={s.rowLabel}>Shares</Text>
              <Text style={s.rowValue}>{quantity}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.rowLabel}>Message</Text>
              <Text style={[s.rowValue, { color: colors.negative, flexShrink: 1 }]}>{error}</Text>
            </View>
          </>
        )}

        <View style={s.divider} />

        <Pressable
          style={({ pressed }) => [s.actionBtn, pressed && s.actionBtnDisabled]}
          onPress={resetState}
        >
          <Text style={s.actionBtnText}>Done</Text>
        </Pressable>
      </View>
    )
  }

  return null
}

const styles = (colors: typeof Colors.light) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
    minHeight: 304,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 3,
    overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: 6,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'right',
  },
  sharesInput: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'right',
    minWidth: 80,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inlineError: {
    fontSize: 13,
    color: colors.negative,
    textAlign: 'center',
  },
  actionBtn: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  backArrow: {
    fontSize: 20,
  },
  resultHeader: {
    gap: 2,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  resultTime: {
    fontSize: 13,
    color: colors.textMuted,
  },
})
