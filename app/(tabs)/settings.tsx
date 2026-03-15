import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '@/constants/theme'
import { resetConsumer } from '@/consumer'

const USERNAME = 'demo_user'

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
  const s = styles(colors)

  return (
    <Pressable style={({ pressed }) => [s.row, pressed && s.rowPressed]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={danger ? colors.negative : colors.textMuted} />
      <Text style={[s.rowLabel, danger && s.rowLabelDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textHint} />
    </Pressable>
  )
}

export default function SettingsScreen() {
  const router = useRouter()
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const s = styles(colors)

  async function handleLogout() {
    await AsyncStorage.removeItem('authToken')
    resetConsumer()
    router.replace('/login')
  }

  return (
    <View style={s.container}>
      {/* Avatar + username */}
      <View style={s.profile}>
        <View style={s.avatar}>
          <Text style={s.initials}>{getInitials(USERNAME)}</Text>
        </View>
        <Text style={s.username}>{USERNAME}</Text>
      </View>

      {/* Account section */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Account</Text>
        <View style={s.card}>
          <Row
            icon="lock-closed-outline"
            label="Change password"
            onPress={() => console.log('change password')}
          />
          <View style={s.divider} />
          <Row
            icon="trash-outline"
            label="Delete account"
            onPress={() => console.log('delete account')}
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
    </View>
  )
}

const styles = (colors: typeof Colors.light) => StyleSheet.create({
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
})
