import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  useColorScheme,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDebounce } from 'use-debounce'
import { Colors } from '@/constants/theme'
import { stockLogoUrl } from '@/utils'
import { useAuth } from '@/contexts/AuthContext'
import type { Error } from '@/types'

interface SearchResult {
  id: number
  symbol: string
  name: string
  exchange: string
  ticker_type: string
}


function StockCard({ symbol, onPress, s, scheme }: { symbol: string; onPress: () => void; s: ReturnType<typeof styles>; scheme: string | null | undefined }) {
  return (
    <Pressable style={({ pressed }) => [s.card, pressed && s.cardPressed]} onPress={onPress}>
      <Image
        source={{ uri: stockLogoUrl(symbol) }}
        style={[s.cardLogo, symbol === 'AAPL' && scheme === 'dark' && { backgroundColor: '#F5F4EE' }]}
      />
      <Text style={s.cardSymbol}>{symbol}</Text>
    </Pressable>
  )
}

export default function SearchScreen() {
  const router = useRouter()
  const { logout, username } = useAuth()
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const API = process.env.EXPO_PUBLIC_API_URL

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 150)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<Error>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [recentStocks, setRecentStocks] = useState<{ symbol: string; name: string }[]>([])

  // Reset search and reload recents every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      setSearchTerm('')
      setSearchResults([])
      setHasSearched(false)
      AsyncStorage.getItem(`recentStocks:${username}`).then((raw) => {
        if (raw) setRecentStocks(JSON.parse(raw))
      })
    }, [])
  )

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setSearchResults([])
      setError(null)
      setHasSearched(false)
      return
    }

    async function searchStocks() {
      setError(null)
      const token = await AsyncStorage.getItem('authToken')
      if (!token) { await logout(); return }

      try {
        const response = await fetch(`${API}/search?q=${encodeURIComponent(debouncedSearchTerm)}`, {
          headers: { authToken: token },
        })
        if (response.status === 401) { await logout(); return }
        if (!response.ok) throw new Error(`${response.status}`)
        setSearchResults(await response.json())
      } catch {
        setError('Something went wrong, please try again later')
        setSearchResults([])
      } finally {
        setHasSearched(true)
      }
    }

    searchStocks()
  }, [debouncedSearchTerm])

  function handleSelect(symbol: string) {
    router.push(`/(tabs)/stocks/${symbol}` as any)
  }

  const s = styles(colors)

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      {/* Search input */}
      <View style={s.inputRow}>
        <Ionicons name="search-outline" size={18} color={colors.textHint} style={s.searchIcon} />
        <TextInput
          style={s.input}
          placeholder="Search name or symbol"
          placeholderTextColor={colors.textHint}
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="characters"
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {/* Results */}
      <FlatList
        data={searchResults}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [s.resultItem, pressed && s.resultItemPressed]}
            onPress={() => handleSelect(item.symbol)}
          >
            <Text style={s.resultSymbol}>{item.symbol}</Text>
            <Text style={s.resultName} numberOfLines={1}>{item.name}</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        ListEmptyComponent={
          hasSearched ? (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>{error ?? 'No stocks found'}</Text>
            </View>
          ) : !searchTerm ? (
              <View style={s.sections}>
                <View style={s.section}>
                  <Text style={s.sectionHeader}>Recent</Text>
                  {recentStocks.length > 0 ? (
                    <View style={s.grid}>
                      {recentStocks.map(({ symbol }) => (
                        <StockCard key={symbol} symbol={symbol} onPress={() => handleSelect(symbol)} s={s} scheme={scheme} />
                      ))}
                    </View>
                  ) : (
                    <Text style={s.emptyText}>Stocks you look up will appear here</Text>
                  )}
                </View>
              </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
       borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    height: 52,
    gap: 10,
  },
  searchIcon: {
    marginTop: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
       gap: 12,
  },
  resultItemPressed: {
    backgroundColor: colors.background,
  },
  resultSymbol: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    width: 72,
  },
  resultName: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sections: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '31%',
       borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 6,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
     },
  cardSymbol: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
})
