<script setup lang="ts">
import { ref } from 'vue'
import LastModifiedApplications from '@/components/LastModifiedApplications.vue'
import ExportButton from '@/components/ExportButton.vue'
import Applications from '@/api/application'
import type { Application } from '@/models/Application'

const searchTerm = ref<string>('')
const searchResults = ref<Application[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

// Fonction pour effectuer une recherche
async function doSearch() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    searchResults.value = await Applications.getAllApplicationBySearch(searchTerm.value)
  } catch (error) {
    errorMessage.value = 'Une erreur est survenue lors de la recherche.'
    console.error('Erreur lors de la recherche :', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Barre de recherche -->
    <DsfrSearchBar
      v-model="searchTerm"
      label="Rechercher une application"
      placeholder="Rechercher une application"
      @input="doSearch"
    />

    <!-- Résultats de recherche -->
    <div v-if="isLoading">Chargement...</div>
    <div v-else-if="searchResults.length">
      <h4>Résultats de recherche</h4>
      <div class="tiles-container">
        <DsfrTile
          v-for="app in searchResults"
          :key="app.id"
          :title="app.label"
          :to="{ name: 'application', params: { id: app.id } }"
        />
      </div>
    </div>
    <div v-else-if="!isLoading && searchTerm">
      Aucun résultat trouvé.
    </div>

    <!-- Dernières applications modifiées -->
    <LastModifiedApplications />

    <!-- Bouton d'export -->
    <ExportButton />
  </div>
</template>

<style scoped>
.tiles-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
</style>