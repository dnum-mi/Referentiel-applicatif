<script setup lang="ts">
import type { Application } from '@/models/Application'
import Applications from '@/api/application'
import ApplicationOverview from '@/components/ApplicationOverview.vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const id = route.params.id as string
const application = ref<Application | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  isLoading.value = true
  try {
    console.log('ID récupéré depuis la route:', id)
    application.value = await Applications.getApplicationById(id)
    console.log('Données de l\'application chargées :', application.value)
  }
  catch (error) {
    console.error('Erreur lors de la récupération de l\'application:', error)
    errorMessage.value = 'Une erreur est survenue lors de la récupération de l\'application.'
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div>
    <DsfrBreadcrumb />
    <h1>Fiche de l'application</h1>
    <div v-if="isLoading">
      Chargement...
    </div>
    <div v-else-if="errorMessage">
      {{ errorMessage }}
    </div>
    <div v-else-if="application">
      <h2>{{ application.label }}</h2>
      <!-- Affichez directement le composant avec les détails de l'application -->
      <ApplicationOverview :application="application" />
    </div>
  </div>
</template>
