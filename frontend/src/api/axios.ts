import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

// Origen del servidor sin el sufijo /api, para armar URLs de archivos subidos
export const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
