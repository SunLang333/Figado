import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

class ApiServiceDebug {
  private apiClient: AxiosInstance

  constructor() {
    this.apiClient = axios.create({
      baseURL: 'http://192.168.124.3:8000', // Replace with your backend URL
      timeout: 10000
    })

    // Add a request interceptor to include the Bearer token
    this.apiClient.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Use Pinia store if available, fallback to localStorage
        let token = ''
        try {
          const auth = useAuthStore()
          token = auth.accessToken
        } catch (e) {
          token = localStorage.getItem('access') || ''
        }
        if (token && config.headers) {
          if (typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${token}`)
          } else {
            config.headers['Authorization'] = `Bearer ${token}`
          }
        }
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, token?: string): Promise<T> {
    try {
      // If token is passed, use it; otherwise, rely on interceptor
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      const response = await this.apiClient.get<T>(url, config)
      return response.data
    } catch (error) {
      console.error('API GET request failed:', error)
      throw error
    }
  }

  // Add other HTTP methods (POST, PUT, DELETE) as needed
}

const apiServiceDebug = new ApiServiceDebug()
export default apiServiceDebug
