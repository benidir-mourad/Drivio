import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

let csrfInitialized = false

async function ensureCsrf(): Promise<void> {
  if (csrfInitialized) return
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
  await axios.get(`${base}/sanctum/csrf-cookie`, { withCredentials: true })
  csrfInitialized = true
}

api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method ?? '')) {
    await ensureCsrf()
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
