import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '@/constants/theme'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const API = process.env.EXPO_PUBLIC_API_URL

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasTyped, setHasTyped] = useState(false)

  const isLogin = mode === 'login'
  const showError = !!error && !isSubmitting && !hasTyped

  const validateUsername = (value: string) => {
    if (value.length > 20) return 'Username must be 20 characters or less'
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores'
    return null
  }

  const validatePassword = (value: string) => {
    if (value.length === 0) return 'Password must contain at least 1 character'
    return null
  }

  async function handleSubmit() {
    setHasTyped(false)

    if (!isLogin) {
      const usernameError = validateUsername(username)
      const passwordError = validatePassword(password)
      if (usernameError) { setError(usernameError); return }
      if (passwordError) { setError(passwordError); return }
    }

    try {
      setIsSubmitting(true)
			console.log(`${API}/${mode}`)
      const response = await fetch(`${API}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      if (response.ok) {
        const data = await response.json()
        await AsyncStorage.setItem('authToken', data.token)
        await AsyncStorage.setItem('username', data.username)
        router.replace('/(tabs)')
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch (err) {
      setError('Something went wrong, please try again')
		  console.error('Auth error:', err);
    } finally {
      setIsSubmitting(false)
    }
  }

  const s = styles(colors)

  return (
    <View style={s.container}>
      <Text style={s.heading}>{isLogin ? 'Welcome Back' : 'Sign Up'}</Text>

      {showError && (
        <View style={s.errorContainer}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      <TextInput
        style={s.input}
        placeholder="Username"
        placeholderTextColor={colors.textHint}
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={(text) => { setUsername(text); setHasTyped(true) }}
      />

      <TextInput
        style={s.input}
        placeholder="Password"
        placeholderTextColor={colors.textHint}
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={(text) => { setPassword(text); setHasTyped(true) }}
      />

      <Pressable
        style={({ pressed }) => [s.button, pressed && s.buttonPressed, isSubmitting && s.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting
          ? <ActivityIndicator color={colors.surface} />
          : <Text style={s.buttonText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
        }
      </Pressable>

      <Text style={s.footer}>
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <Link href={isLogin ? '/signup' : '/login'} style={s.footerLink}>
          {isLogin ? 'Sign Up' : 'Login'}
        </Link>
      </Text>
    </View>
  )
}

const styles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.negative,
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: colors.negative,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: colors.accent,
    fontWeight: '600',
  },
})
