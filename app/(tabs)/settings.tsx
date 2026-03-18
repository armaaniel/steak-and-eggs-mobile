import { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, useColorScheme, Modal, TextInput, ActivityIndicator } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '@/constants/theme'
import { useAuth } from '@/contexts/AuthContext'

const API = process.env.EXPO_PUBLIC_API_URL

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase()
}

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  danger?: boolean
}

function Row({ icon, label, onPress, danger }: RowProps) {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const s = makeStyles(colors)

  return (
    <Pressable style={({ pressed }) => [s.row, pressed && s.rowPressed]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={danger ? colors.negative : colors.textMuted} />
      <Text style={[s.rowLabel, danger && s.rowLabelDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textHint} />
    </Pressable>
  )
}

interface LabeledInputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  secureTextEntry?: boolean
  colors: typeof Colors.light
}

function LabeledInput({ label, value, onChangeText, secureTextEntry, colors }: LabeledInputProps) {
  return (
    <View style={{
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
    }}>
      <Text style={{ fontSize: 11, color: colors.textHint, paddingHorizontal: 12, paddingTop: 8 }}>
        {label}
      </Text>
      <TextInput
        style={{ paddingHorizontal: 12, paddingTop: 2, paddingBottom: 10, fontSize: 15, color: colors.text }}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
      />
    </View>
  )
}

export default function SettingsScreen() {
  const { logout, username } = useAuth()
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const s = makeStyles(colors)

  // Change password state
  const [cpVisible, setCpVisible] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cpError, setCpError] = useState<string | null>(null)
  const [cpSuccess, setCpSuccess] = useState<string | null>(null)
  const [cpSubmitting, setCpSubmitting] = useState(false)
  const [cpHasTyped, setCpHasTyped] = useState(false)

  // Delete account state
  const [daVisible, setDaVisible] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [daError, setDaError] = useState<string | null>(null)
  const [daSubmitting, setDaSubmitting] = useState(false)
  const [daHasTyped, setDaHasTyped] = useState(false)

  const cpMessageOpacity = useSharedValue(0)
  const cpShowMessage = !!(cpSuccess || cpError) && !cpHasTyped && !cpSubmitting
  useEffect(() => {
    cpMessageOpacity.value = withTiming(cpShowMessage ? 1 : 0, { duration: 200 })
  }, [cpShowMessage])
  const cpMessageStyle = useAnimatedStyle(() => ({
    opacity: cpMessageOpacity.value,
  }))

  const daMessageOpacity = useSharedValue(0)
  const daShowMessage = !!daError && !daHasTyped && !daSubmitting
  useEffect(() => {
    daMessageOpacity.value = withTiming(daShowMessage ? 1 : 0, { duration: 200 })
  }, [daShowMessage])
  const daMessageStyle = useAnimatedStyle(() => ({
    opacity: daMessageOpacity.value,
  }))

  async function handleLogout() {
    await logout()
  }

  function openChangePassword() {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setCpError(null)
    setCpSuccess(null)
    setCpSubmitting(false)
    setCpHasTyped(false)
    setCpVisible(true)
  }

  function closeChangePassword() {
    setCpVisible(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setCpError(null)
    setCpSuccess(null)
    setCpSubmitting(false)
    setCpHasTyped(false)
  }

  function openDeleteAccount() {
    setDeletePassword('')
    setDaError(null)
    setDaSubmitting(false)
    setDaHasTyped(false)
    setDaVisible(true)
  }

  function closeDeleteAccount() {
    setDaVisible(false)
    setDeletePassword('')
    setDaError(null)
    setDaSubmitting(false)
    setDaHasTyped(false)
  }

  async function handleChangePassword() {
    setCpHasTyped(false)
    setCpSuccess(null)
    setCpError(null)

    if (newPassword !== confirmPassword) {
      setCpError('New passwords do not match')
      return
    }
    if (newPassword.length === 0) {
      setCpError("Password can't be empty")
      return
    }

    setCpSubmitting(true)
    const token = await AsyncStorage.getItem('authToken')
    try {
      const response = await fetch(`${API}/change_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authToken: token } as HeadersInit,
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      })
      if (response.ok) {
        setCpSuccess('Password updated successfully')
      } else {
        const data = await response.json()
        setCpError(data.error || 'Something went wrong')
      }
    } catch {
      setCpError('Something went wrong, please try again')
    } finally {
      setCpSubmitting(false)
    }
  }

  async function handleDeleteAccount() {
    setDaHasTyped(false)
    setDaError(null)

    if (deletePassword.length === 0) {
      setDaError('Please enter your password')
      return
    }

    setDaSubmitting(true)
    const token = await AsyncStorage.getItem('authToken')
    try {
      const response = await fetch(`${API}/delete_account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', authToken: token } as HeadersInit,
        body: JSON.stringify({ password: deletePassword }),
      })
      if (response.ok) {
        handleLogout()
      } else {
        const data = await response.json()
        setDaError(data.error || 'Something went wrong')
      }
    } catch {
      setDaError('Something went wrong, please try again')
    } finally {
      setDaSubmitting(false)
    }
  }

  return (
    <View style={s.container}>
      {/* Avatar + username */}
      <View style={s.profile}>
        <View style={s.avatar}>
          <Text style={s.initials}>{getInitials(username || '??')}</Text>
        </View>
        <Text style={s.username}>{username}</Text>
      </View>

      {/* Account section */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Account</Text>
        <View style={s.card}>
          <Row
            icon="lock-closed-outline"
            label="Change password"
            onPress={openChangePassword}
          />
          <View style={s.divider} />
          <Row
            icon="trash-outline"
            label="Delete account"
            onPress={openDeleteAccount}
            danger
          />
        </View>
      </View>

      {/* Logout section */}
      <View style={s.section}>
        <View style={s.card}>
          <Row
            icon="log-out-outline"
            label="Log out"
            onPress={handleLogout}
            danger
          />
        </View>
      </View>

      {/* Change Password Modal */}
      <Modal visible={cpVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Change password</Text>
              <Animated.Text style={[{ color: colors.textMuted, fontSize: 12 }, cpMessageStyle]}>
                {cpSuccess ?? cpError}
              </Animated.Text>
            </View>

            <LabeledInput
              label="Current Password"
              value={currentPassword}
              onChangeText={(text) => { setCurrentPassword(text); setCpHasTyped(true) }}
              secureTextEntry
              colors={colors}
            />
            <LabeledInput
              label="New Password"
              value={newPassword}
              onChangeText={(text) => { setNewPassword(text); setCpHasTyped(true) }}
              secureTextEntry
              colors={colors}
            />
            <LabeledInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setCpHasTyped(true) }}
              secureTextEntry
              colors={colors}
            />

            <Pressable
              style={({ pressed }) => [s.button, pressed && s.buttonPressed]}
              onPress={handleChangePassword}
              disabled={cpSubmitting}
            >
              {cpSubmitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.buttonText}>Update password</Text>}
            </Pressable>

            <Pressable onPress={closeChangePassword} style={s.cancelButton}>
              <Text style={s.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={daVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Delete account</Text>
              <Animated.Text style={[{ color: colors.textMuted, fontSize: 12 }, daMessageStyle]}>
                {daError}
              </Animated.Text>
            </View>
            <Text style={s.warningText}>
              This action is permanent and cannot be undone. All your data, positions, and history will be deleted immediately.
            </Text>

            <LabeledInput
              label="Enter your password to confirm"
              value={deletePassword}
              onChangeText={(text) => { setDeletePassword(text); setDaHasTyped(true) }}
              secureTextEntry
              colors={colors}
            />

            <Pressable
              style={({ pressed }) => [s.dangerButton, pressed && s.buttonPressed]}
              onPress={handleDeleteAccount}
              disabled={daSubmitting}
            >
              {daSubmitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.buttonText}>Delete account</Text>}
            </Pressable>

            <Pressable onPress={closeDeleteAccount} style={s.cancelButton}>
              <Text style={s.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const makeStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    paddingTop: 24,
    gap: 24,
  },
  profile: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 44,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  rowLabelDanger: {
    color: colors.negative,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  dangerButton: {
    backgroundColor: colors.negative,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 10,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  warningText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
})
