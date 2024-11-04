<script setup lang="ts">
import type { Application } from '@/models/Application'
import Applications from '@/api/application'
import { ref } from 'vue'

// État de la recherche et pagination
const searchTerm = ref<string>('')
const searchResults = ref<Application[]>([])

const isLoading = ref(false)
const errorMessage = ref('')

let debounceTimeout: NodeJS.Timeout

async function doSearch () {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(async () => {
    if (!searchTerm.value) {
      searchResults.value = []
      return
    }
    isLoading.value = true
    errorMessage.value = ''
    try {
      const response = await Applications.getAllApplicationBySearch(searchTerm.value)
      searchResults.value = response
    }
    catch (error) {
      errorMessage.value = 'Une erreur est survenue lors de la recherche. Veuillez réessayer.'
      console.error('Error during search:', error)
    }
    finally {
      isLoading.value = false
    }
  }, 300)
}
</script>

<template>
  <div>
    <div>
      <!-- Export buttons -->
      <div class="button-group fr-mb-2w">
        <DsfrButton
          :disabled="false"
          :icon-only="false"
          :icon-right="true"
          icon="ri-arrow-down-s-line"
          label="Export csv"
          :no-outline="false"
          :secondary="false"
          :tertiary="false"
        />
      </div>
    </div>
    <div class="container-search">
      <div class="content-container">
        <h4>Rechercher une application</h4>

        <div class="search-container">
          <!-- Barre de recherche -->
          <DsfrSearchBar
            v-model="searchTerm"
            :hide-icon="true"
            label="Rechercher une application"
            :label-visible="true"
            :large="false"
            placeholder="Rechercher une application"
            @input="doSearch"
          />
        </div>
      </div>
      <div>
        <div class="container-tiles">
          <div
            v-if="searchResults.length && !isLoading"
            class="tiles-container"
          >
            <DsfrTile
              v-for="app in searchResults"
              :key="app.id"
              :title="app.label"
              :to="{ name: 'application', params: { id: app.id } }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Styles pour la page */
.container {
  display: flex;
  justify-content: space-between;
  width: 20rem;
}

.content-container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 25em;
}

.container-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10em;
  margin-top: 5em;
  width: 100%;
}

.container-tiles {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  margin-top: 1em;
}

/* Grille des tuiles */
.tiles-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  width: 25em; /* Ajuste la largeur des tuiles */
}

.section-espace {
  margin-top: 5em;
  margin-bottom: 5em;
  display: flex;
  justify-content: space-between;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.filter-button {
  position: relative;
  display: inline-block;
}

.popover {
  position: absolute;
  top: 100%; /* Positionne le popover juste en dessous du bouton */
  left: 0;
  z-index: 1000;
  background-color: white;
  border: 1px solid #dcdfe3;
  padding: 1rem;
  width: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.popover ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.popover li {
  padding: 0.5rem 0;
  cursor: pointer;
}

.popover li:hover {
  background-color: #f5f5f5;
}
</style>
