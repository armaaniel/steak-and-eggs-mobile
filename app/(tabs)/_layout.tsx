import { Tabs } from 'expo-router'
import { View, Pressable, StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Colors } from '@/constants/theme'
import FundsButton from '@/components/FundsButton'

const ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  index:    { focused: 'home',          unfocused: 'home-outline' },
  activity: { focused: 'list',          unfocused: 'list-outline' },
  search:   { focused: 'search',        unfocused: 'search-outline' },
  settings: { focused: 'person-circle', unfocused: 'person-circle-outline' },
}

function MenuBar({ state, navigation }: BottomTabBarProps) {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const s = styles(colors)

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <View style={s.bar}>
        {state.routes.map((route, index) => {
          const icon = ICONS[route.name]
          if (!icon) return null
          const isFocused = state.index === index
          const iconName = isFocused ? icon.focused : icon.unfocused

          return (
            <Pressable
              key={route.key}
              onPress={() => { if (!isFocused) navigation.navigate(route.name) }}
              style={s.item}
              hitSlop={8}
            >
              <Ionicons
                name={iconName ?? 'ellipse-outline'}
                size={22}
                color={isFocused ? (scheme === 'dark' ? colors.textMuted : colors.accent) : (scheme === 'dark' ? colors.textHint : colors.textMuted)}
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

export default function TabLayout() {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  return (
    <Tabs
      tabBar={(props) => <MenuBar {...props} />}
      screenOptions={{ headerShown: false, tabBarPosition: 'top', animation: 'fade', sceneStyle: { backgroundColor: colors.background } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      <Tabs.Screen name="stocks/[symbol]" options={{ href: null }} initialParams={{ symbol: '' }} />
    </Tabs>
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
