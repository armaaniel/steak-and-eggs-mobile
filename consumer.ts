import { createConsumer } from '@rails/actioncable'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '')
const WS = API.replace('https://', 'wss://').replace('http://', 'ws://')

let globalConsumer: ReturnType<typeof createConsumer> | null = null

global.addEventListener = () => {};
global.removeEventListener = () => {};

export const getConsumer = async () => {
  if (!globalConsumer) {
    const token = await AsyncStorage.getItem('authToken')
    globalConsumer = createConsumer(`${WS}/cable?token=${token}`)
  }
  return globalConsumer
}

export const resetConsumer = () => {
  if (globalConsumer) {
    globalConsumer.disconnect()
    globalConsumer = null
  }
}
