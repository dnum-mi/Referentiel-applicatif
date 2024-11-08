import { useAuthStore } from '@/stores/authStore'
import axios, { type AxiosResponse } from 'axios'

axios.defaults.baseURL = `${import.meta.env.VITE_RDA_API_URL ?? 'http://localhost:3500/api/'}`
axios.defaults.withCredentials = true
axios.defaults.headers.common.Accept = 'application/json'
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.timeout = 10000

export function setAuthToken () {
  const token = localStorage.getItem('access_token')
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
  }
  else {
    delete axios.defaults.headers.common.Authorization
  }
}

async function refreshToken () {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await axios.post(`${import.meta.env.VITE_KEYCLOAK_AUTH_SERVER_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/token`, new URLSearchParams({
    client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_secret: import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET,
  }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })

  return response.data.access_token
}

export async function login (username: string, password: string): Promise<string> {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_KEYCLOAK_AUTH_SERVER_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        username,
        password,
        client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
        grant_type: 'password',
        client_secret: import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET,
        scope: 'openid profile email',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    return response.data.access_token
  }
  catch (error: any) {
    console.error('Erreur lors de la connexion:', error.response?.data || error.message)
    throw error
  }
}

export async function getUserInfo (accessToken: string): Promise<any> {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_KEYCLOAK_AUTH_SERVER_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    return response.data
  }
  catch (error: any) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error.response?.data || error.message)
    throw error
  }
}

axios.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  error => Promise.reject(error)
)

axios.interceptors.response.use(
  response => response,
  async (error) => {
    const { response } = error
    if (response && response.status === 401) {
      try {
        const newToken = await refreshToken()
        localStorage.setItem('access_token', newToken)
        setAuthToken()
        return axios(error.config)
      } catch (refreshError) {
        console.error('Unable to refresh token:', refreshError)
        const authStore = useAuthStore()
        const router = useRouter()
        authStore.logout()
        await router.push({ name: 'login' })
      }
    }
    return Promise.reject(error)
  }
)

// Fonction pour extraire le corps de la réponse
const responseBody = <T>(response: AxiosResponse<T>) => response.data

// Méthodes HTTP génériques
export function get<T> (endpoint: string, params?: any): Promise<T> {
  return axios.get<T>(endpoint, { params }).then(responseBody)
}

export function post<T> (endpoint: string, body: object): Promise<T> {
  return axios.post<T>(endpoint, body).then(responseBody)
}

export function put<T> (endpoint: string, body: object): Promise<T> {
  return axios.put<T>(endpoint, body).then(responseBody)
}

export function del<T> (endpoint: string, params?: any): Promise<T> {
  return axios.delete<T>(endpoint, { params }).then(responseBody)
}

// Exportation des méthodes
const requests = {
  get,
  post,
  put,
  del,
}

export default requests
