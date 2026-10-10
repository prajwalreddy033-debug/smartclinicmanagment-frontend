import axios from 'axios'

const LIVE_RENDER_API = 'https://smartclinicmanagment-backend.onrender.com/api/v1'

const getBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL

  // If running in production (Vercel) or placeholder was entered, use live Render backend
  if (!envUrl || envUrl.includes('YOUR-RENDER-BACKEND-URL') || envUrl.includes('<')) {
    if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
      return LIVE_RENDER_API
    }
    return 'http://localhost:8070/api/v1'
  }

  let url = envUrl.trim().replace(/\/+$/, '')
  if (!url.endsWith('/api/v1')) {
    url += '/api/v1'
  }
  return url
}

const API_BASE_URL = getBaseUrl()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
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

export default api
