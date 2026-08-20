import axios from 'axios'
import { io } from 'socket.io-client'

const API_BASE = import.meta.env.VITE_API_URL || ''

const instance = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

let socket = null
let isConnecting = false

export const getSocket = () => {
  if (socket && socket.connected) return socket
  if (isConnecting) return socket

  const token = localStorage.getItem('token')
  if (!token) {
    if (socket) {
      socket.disconnect()
      socket = null
    }
    return null
  }

  isConnecting = true

  const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    isConnecting = false
  })

  socket.on('connect_error', () => {
    isConnecting = false
  })

  socket.on('disconnect', () => {
    isConnecting = false
  })

  return socket
}

export default instance
