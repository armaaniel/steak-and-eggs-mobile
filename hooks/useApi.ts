import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import type { ChartData } from '@/types'

const API = process.env.EXPO_PUBLIC_API_URL

async function getToken() {
  return AsyncStorage.getItem('authToken')
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const KEYS = {
  portfolio:      ['portfolio']      as const,
  portfolioChart: ['portfolioChart'] as const,
  activity:       ['activity']       as const,
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function usePortfolio() {
  const { logout } = useAuth()
  return useQuery({
    queryKey: KEYS.portfolio,
    queryFn: async () => {
      const token = await getToken()
      if (!token) { await logout(); return null }
      const res = await fetch(`${API}/portfoliodata`, { headers: { authToken: token } })
      if (res.status === 401) { await logout(); return null }
      if (!res.ok) throw new Error('Unable to fetch portfolio')
      return res.json()
    },
  })
}

export function usePortfolioChart() {
  const { logout } = useAuth()
  return useQuery({
    queryKey: KEYS.portfolioChart,
    queryFn: async () => {
      const token = await getToken()
      if (!token) { await logout(); return [] as ChartData[] }
      const res = await fetch(`${API}/portfoliochart`, { headers: { authToken: token } })
      if (res.status === 401) { await logout(); return [] as ChartData[] }
      if (!res.ok) {
        const today = new Date()
        return [
          { date: today.toLocaleDateString(), value: 0 },
          { date: today.toLocaleDateString(), value: 0 },
        ] as ChartData[]
      }
      return res.json() as Promise<ChartData[]>
    },
  })
}


export function useActivity() {
  const { logout } = useAuth()
  return useQuery({
    queryKey: KEYS.activity,
    queryFn: async () => {
      const token = await getToken()
      if (!token) { await logout(); return [] }
      const res = await fetch(`${API}/activitydata`, { headers: { authToken: token } })
      if (res.status === 401) { await logout(); return [] }
      if (!res.ok) throw new Error('Unable to fetch transactions')
      return res.json()
    },
  })
}

// ─── Shared invalidation ─────────────────────────────────────────────────────

function useInvalidateAll() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: KEYS.portfolio })
    queryClient.invalidateQueries({ queryKey: KEYS.portfolioChart })
    queryClient.invalidateQueries({ queryKey: KEYS.activity })
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useDeposit() {
  const invalidateAll = useInvalidateAll()
  return useMutation({
    mutationFn: async (amount: string) => {
      const token = await getToken()
      const res = await fetch(`${API}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authToken: token ?? '' },
        body: JSON.stringify({ amount }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    },
    onSuccess: invalidateAll,
  })
}

export function useWithdraw() {
  const invalidateAll = useInvalidateAll()
  return useMutation({
    mutationFn: async (amount: string) => {
      const token = await getToken()
      const res = await fetch(`${API}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authToken: token ?? '' },
        body: JSON.stringify({ amount }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    },
    onSuccess: invalidateAll,
  })
}

export function useBuy() {
  const invalidateAll = useInvalidateAll()
  return useMutation({
    mutationFn: async ({ symbol, name, quantity }: { symbol: string; name: string; quantity: string }) => {
      const token = await getToken()
      const res = await fetch(`${API}/stocks/${symbol}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authToken: token ?? '' },
        body: JSON.stringify({ name, quantity }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: invalidateAll,
  })
}

export function useSell() {
  const invalidateAll = useInvalidateAll()
  return useMutation({
    mutationFn: async ({ symbol, name, quantity }: { symbol: string; name: string; quantity: string }) => {
      const token = await getToken()
      const res = await fetch(`${API}/stocks/${symbol}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authToken: token ?? '' },
        body: JSON.stringify({ name, quantity }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: invalidateAll,
  })
}
