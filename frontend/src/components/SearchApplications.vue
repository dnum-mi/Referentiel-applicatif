<script setup lang="ts">
import Applications from "@/api/application";
import { onMounted, ref } from "vue";

const searchTerm = ref<string>("");
const searchResults = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const debounceTimeout = ref<NodeJS.Timeout | null>(null);

async function doSearch() {
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value);
  }
  debounceTimeout.value = setTimeout(async () => {
    try {
      isLoading.value = true;
      errorMessage.value = "";
      const results = await Applications.getAllApplicationBySearch(searchTerm.value || "");
      searchResults.value = results || [];
    } catch (error) {
      errorMessage.value = "Une erreur est survenue lors du chargement des applications.";
    } finally {
      isLoading.value = false;
    }
  }, 300);
}

onMounted(async () => {
  await doSearch();
});
</script>

<template>
  <div>
    <DsfrSearchBar
      v-model="searchTerm"
      :hide-icon="true"
      label="Rechercher une application"
      placeholder="Rechercher une application"
      @input="doSearch"
    />

    <div v-if="searchResults.length" class="card-container">
      <DsfrCard
        class="fixed-card"
        v-for="(app, index) in searchResults"
        :key="index"
        :title="app.label || 'Applications'"
        :img-src="app.logo || ''"
        :link="{ name: 'application', params: { id: app.id } }"
      />
    </div>

    <div v-if="isLoading" class="loading-message">Chargement...</div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-else-if="!isLoading && !searchResults.length && searchTerm">
      <p>Aucun résultat trouvé pour "{{ searchTerm }}".</p>
    </div>
  </div>
</template>

<style scoped>
.card-container {
  margin: 2em;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.fixed-card {
  height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fixed-card .card-content {
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
