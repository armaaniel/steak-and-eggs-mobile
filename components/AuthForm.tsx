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
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import Svg, { Ellipse, Path, G, Circle, Text as SvgText } from 'react-native-svg'
import { Colors } from '@/constants/theme'

function Logo({ textColor }: { textColor: string }) {
  return (
    <Svg width={180} height={110} viewBox="0 0 364 224">
      <Ellipse cx="182" cy="112" rx="180" ry="110" fill="#f5f5f5" stroke="#d3d3d3" strokeWidth="4" />
      <Path d="m122 82c-20-10 40-30 120 0 30 20 20 60-10 70-70 20-130 0-140-30-10-20 10-30 30-40" fill="#8b4513" stroke="#654321" strokeWidth="3" />
      <G stroke="#472400" strokeWidth="3">
        <Path d="m142 92 60 10" />
        <Path d="m162 112 60 10" />
        <Path d="m152 132 60 10" />
      </G>
      <Circle cx="142" cy="62" r="35" fill="#fff" stroke="#e6e6e6" strokeWidth="2" />
      <Circle cx="142" cy="62" r="12" fill="#ffd700" />
      <Circle cx="232" cy="52" r="30" fill="#fff" stroke="#e6e6e6" strokeWidth="2" />
      <Circle cx="232" cy="52" r="10" fill="#ffd700" />
      <SvgText x="182" y="222" fill={textColor} fontFamily="Arial" fontSize="32" fontWeight="bold" textAnchor="middle">
        STEAK &amp; EGGS
      </SvgText>
    </Svg>
  )
}

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const { login } = useAuth()
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  const API = process.env.EXPO_PUBLIC_API_URL

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasTyped, setHasTyped] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)
  const [demoLoading, setDemoLoading] = useState(false)

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
      const response = await fetch(`${API}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      if (response.ok) {
        const data = await response.json()
        await login(data.token, data.username)
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch {
      setError('Something went wrong, please try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  const s = styles(colors)

  return (
    <View style={s.container}>
      <Pressable onPress={() => router.replace('/welcome')} style={s.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>
      <View style={s.logoWrap}><Logo textColor={scheme === 'dark' ? '#E07B3C' : '#333333'} /></View>
      <Animated.Text layout={Layout.duration(200)} style={s.heading}>{isLogin ? 'Welcome Back' : 'Sign Up'}</Animated.Text>

      {showError && (
        <Animated.Text
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={s.errorText}
        >
          {error}
        </Animated.Text>
      )}

      <Animated.View layout={Layout.duration(200)} style={s.labeledInput}>
        <Text style={s.inputLabel}>Username</Text>
        <TextInput
          style={s.inputField}
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={(text) => { setUsername(text); setHasTyped(true) }}
        />
      </Animated.View>

      <Animated.View layout={Layout.duration(200)} style={s.labeledInput}>
        <Text style={s.inputLabel}>Password</Text>
        <TextInput
          style={s.inputField}
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={(text) => { setPassword(text); setHasTyped(true) }}
        />
      </Animated.View>

      <Animated.View layout={Layout.duration(200)}>
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
      </Animated.View>

      <Animated.View layout={Layout.duration(200)}>
        <Text style={s.footer}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link href={isLogin ? '/signup' : '/login'} style={s.footerLink}>
            {isLogin ? 'Sign Up' : 'Login'}
          </Link>
        </Text>
      </Animated.View>

      {!isLogin && (
        <Pressable style={s.tryDemoBtn} disabled={demoLoading} onPress={async () => {
          setDemoError(null)
          setHasTyped(false)
          setDemoLoading(true)
          try {
            const response = await fetch(`${API}/demo`, { method: 'POST' })
            if (response.ok) {
              const data = await response.json()
              await login(data.token, data.username)
            } else {
              const data = await response.json()
              setDemoError(data.error || 'Something went wrong')
            }
          } catch {
            setDemoError('Something went wrong')
          } finally {
            setDemoLoading(false)
          }
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={s.tryDemo}>Try Demo</Text>
            {demoLoading && <Animated.View entering={FadeIn.duration(200)} style={{ position: 'absolute', left: '100%', marginLeft: 6 }}><ActivityIndicator size="small" color={colors.accent} /></Animated.View>}
          </View>
          {demoError && !hasTyped && (
            <Animated.Text
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={s.tryDemoError}
            >
              {demoError}
            </Animated.Text>
          )}
        </Pressable>
      )}
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 1,
    padding: 4,
  },
  logoWrap: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  errorText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  labeledInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  inputLabel: {
    fontSize: 11,
    color: colors.textHint,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  inputField: {
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 10,
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
  tryDemoBtn: {
    position: 'absolute',
    bottom: 96,
    alignSelf: 'center',
  },
  tryDemo: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tryDemoError: {
    position: 'absolute',
    top: '100%',
    marginTop: 6,
    alignSelf: 'center',
    color: colors.textMuted,
    fontSize: 12,
    width: 250,
    textAlign: 'center',
  },
  footerLink: {
    color: colors.accent,
    fontWeight: '600',
  },
})
