import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { usePortfolio, useDeposit, useWithdraw } from '@/hooks/useApi'

export default function FundsButton() {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']

  const { data: portfolioData } = usePortfolio()
  const deposit = useDeposit()
  const withdraw = useWithdraw()

  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<'picker' | 'form'>('picker')
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasTyped, setHasTyped] = useState(false)

  const balance = portfolioData?.balance
  const mutation = mode === 'deposit' ? deposit : withdraw
  const amountFloat = parseFloat(amount)
  const balanceFloat = parseFloat(balance ?? 'NaN')
  const insufficient =
    mode === 'withdraw' && !isNaN(amountFloat) && !isNaN(balanceFloat) && amountFloat > balanceFloat

  function handleOpen() {
    setIsOpen(true)
    setView('picker')
    setError(null)
    setAmount('')
  }

  function handleClose() {
    setIsOpen(false)
    setView('picker')
    setError(null)
    setAmount('')
    mutation.reset()
  }

  function handleSelectMode(selected: 'deposit' | 'withdraw') {
    setMode(selected)
    setView('form')
    setError(null)
    setAmount('')
  }

  function handleBack() {
    setView('picker')
    setError(null)
    setAmount('')
    mutation.reset()
  }

  function handleChangeText(text: string) {
    let cleaned = text.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('')
    if (parts.length === 2 && parts[1].length > 2) cleaned = parts[0] + '.' + parts[1].slice(0, 2)
    setAmount(cleaned)
    setHasTyped(true)
  }

  function handleSubmit() {
    if (!amountFloat || amountFloat <= 0) {
      setError('Please enter an amount')
      setHasTyped(false)
      return
    }
    setHasTyped(false)
    mutation.mutate(amount, {
      onSuccess: () => handleClose(),
      onError: (err) => setError(err.message),
    })
  }

  const showError = (!!error && !mutation.isPending && !hasTyped) || insufficient
  const errorMessage = insufficient ? 'Not enough funds to withdraw' : error

  const s = styles(colors)

  return (
    <>
      <Pressable style={({ pressed }) => [s.trigger, pressed && s.triggerPressed]} onPress={handleOpen} hitSlop={8}>
        <Ionicons name="add-circle-outline" size={22} color={colors.textMuted} />
        <Text style={s.triggerText}>Funds</Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={handleClose}>
        <Pressable style={s.backdrop} onPress={handleClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.sheetWrapper}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <View style={s.handle} />

            {view === 'picker' ? (
              <>
                <Text style={s.title}>Manage Funds</Text>

                <Pressable style={({ pressed }) => [s.option, pressed && s.optionPressed]} onPress={() => handleSelectMode('deposit')}>
                  <View style={[s.optionIcon, s.optionIconPositive]}>
                    <Ionicons name="add" size={18} color={colors.positive} />
                  </View>
                  <View style={s.optionText}>
                    <Text style={s.optionLabel}>Add funds</Text>
                    <Text style={s.optionSub}>Deposit into your account</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textHint} />
                </Pressable>

                <Pressable style={({ pressed }) => [s.option, pressed && s.optionPressed]} onPress={() => handleSelectMode('withdraw')}>
                  <View style={[s.optionIcon, s.optionIconNegative]}>
                    <Ionicons name="remove" size={18} color={colors.negative} />
                  </View>
                  <View style={s.optionText}>
                    <Text style={s.optionLabel}>Remove funds</Text>
                    <Text style={s.optionSub}>Withdraw to your bank</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textHint} />
                </Pressable>
              </>
            ) : (
              <>
                <View style={s.formHeader}>
                  <Pressable onPress={handleBack} hitSlop={8}>
                    <Ionicons name="arrow-back" size={20} color={colors.text} />
                  </Pressable>
                  <Text style={s.title}>{mode === 'deposit' ? 'Add Funds' : 'Remove Funds'}</Text>
                  <View style={s.formHeaderSpacer} />
                </View>

                {showError && (
                  <View style={s.errorContainer}>
                    <Text style={s.errorText}>{errorMessage}</Text>
                  </View>
                )}

                <View style={s.inputRow}>
                  <Text style={s.dollar}>$</Text>
                  <TextInput
                    style={s.input}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.textHint}
                    value={amount}
                    onChangeText={handleChangeText}
                  />
                  <Text style={s.currency}>USD</Text>
                </View>

                <Pressable
                  style={({ pressed }) => [s.submitButton, (pressed || mutation.isPending || insufficient) && s.submitDisabled]}
                  onPress={handleSubmit}
                  disabled={mutation.isPending || insufficient}
                >
                  {mutation.isPending
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={s.submitText}>Submit</Text>
                  }
                </Pressable>
              </>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

const styles = (colors: typeof Colors.light) => StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  triggerPressed: {
    opacity: 0.7,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingTop: 12,
    gap: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  optionPressed: {
    opacity: 0.6,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconPositive: {
    backgroundColor: `${colors.positive}1A`,
  },
  optionIconNegative: {
    backgroundColor: `${colors.negative}1A`,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  optionSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formHeaderSpacer: {
    width: 20,
  },
  errorContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.negative,
  },
  errorText: {
    color: colors.negative,
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    gap: 4,
  },
  dollar: {
    fontSize: 16,
    color: colors.textMuted,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
    paddingVertical: 12,
  },
  currency: {
    fontSize: 14,
    color: colors.textHint,
  },
  submitButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
})
