import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
  withCredentials: true,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export default apiClient
