import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { resetConsumer } from '@/consumer'

interface AuthContextType {
  token: string | null
  username: string | null
  isReady: boolean
  login: (token: string, username: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('authToken'),
      AsyncStorage.getItem('username'),
    ]).then(([storedToken, storedUsername]) => {
      setToken(storedToken)
      setUsername(storedUsername)
      setIsReady(true)
    })
  }, [])

  const login = useCallback(async (newToken: string, username: string) => {
    await AsyncStorage.setItem('authToken', newToken)
    await AsyncStorage.setItem('username', username)
    setToken(newToken)
    setUsername(username)
  }, [])

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('authToken')
    resetConsumer()
    setToken(null)
    setUsername(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, username, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
