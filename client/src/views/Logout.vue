<!-- src/views/Logout.vue -->
<script setup lang="ts">
import useToaster from '@/composables/use-toaster'
import { routeNames } from '@/router/route-names'
import { useAuthStore } from '@/stores/authStore'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const toaster = useToaster()

onMounted(() => {
  try {
    // Appel de la fonction de déconnexion
    authStore.logout()
    console.log('Déconnexion réussie.')

    // Redirection vers la page de connexion
    router.push({ name: routeNames.SIGNIN })
  }
  catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    toaster.addErrorMessage({ description: 'Une erreur est survenue lors de la déconnexion.' })
  }
})
</script>

<template>
  <div class="fr-container">
    <h2>Déconnexion...</h2>
  </div>
</template>
s
