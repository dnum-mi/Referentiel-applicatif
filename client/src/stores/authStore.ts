import Users from '@/api/user'
import { login as apiLogin, getUserInfo } from '@/api/xhr-client'
// src/stores/authStore.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string>(localStorage.getItem('access_token') || '')
  const userInfo = ref<any>(null)
  const errorMessage = ref<string>('')

  const isAuthenticated = computed(() => !!accessToken.value)

  async function login (username: string, password: string) {
    try {
      const token = await apiLogin(username, password)
      accessToken.value = token
      localStorage.setItem('access_token', token)

      const info = await getUserInfo(token)
      userInfo.value = info

      if (info && info.sub) {
        const keycloakId = info.sub
        const email = info.email
        await Users.createOrUpdateUser(keycloakId, email)
      }

      errorMessage.value = ''
      return true
    }
    catch (error: any) {
      console.error('Erreur lors de la connexion de l\'utilisateur:', error)
      errorMessage.value = 'Connexion échouée. Veuillez vérifier vos identifiants.'
      return false
    }
  }

  function logout () {
    accessToken.value = ''
    userInfo.value = null
    localStorage.removeItem('access_token')
  }

  return {
    accessToken,
    userInfo,
    errorMessage,
    isAuthenticated,
    login,
    logout,
  }
})
