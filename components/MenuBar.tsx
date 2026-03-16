import { View, Pressable, StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import FundsButton from '@/components/FundsButton'

const TABS = [
  { key: 'index',    route: '/(tabs)',          focused: 'home'          as const, unfocused: 'home-outline'          as const },
  { key: 'activity', route: '/(tabs)/activity',  focused: 'list'          as const, unfocused: 'list-outline'          as const },
  { key: 'search',   route: '/(tabs)/search',    focused: 'search'        as const, unfocused: 'search-outline'        as const },
  { key: 'settings', route: '/(tabs)/settings',  focused: 'person-circle' as const, unfocused: 'person-circle-outline' as const },
]

interface Props {
  activeTab?: string
}

export default function MenuBar({ activeTab }: Props) {
  const router = useRouter()
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const s = styles(colors)

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <View style={s.bar}>
        {TABS.map((tab) => {
          const isFocused = activeTab === tab.key
          const iconName = isFocused ? tab.focused : tab.unfocused

          return (
            <Pressable
              key={tab.key}
              onPress={() => router.replace(tab.route as any)}
              style={s.item}
              hitSlop={8}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? colors.accent : colors.textMuted}
              />
            </Pressable>
          )
        })}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <FundsButton />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = (colors: typeof Colors.light) => StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
