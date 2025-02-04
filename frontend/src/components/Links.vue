<script setup lang="ts">
import { ref, computed } from "vue";
import Applications from "@/api/application";
import type { Application } from "@/models/Application";
import useToaster from "@/composables/use-toaster";
import AppDate from "./AppDate.vue";

const props = defineProps<{ application: Application }>();
const loading = ref(false);
const toaster = useToaster();

const linkTypesDict = {
  documentation: "Documentation",
  supervision: "Supervision",
  service: "Service",
};

const linkTypes = computed(() => Object.entries(linkTypesDict).map(([value, text]) => ({ value, text })));

async function patchApplication() {
  loading.value = true;
  try {
    await Applications.patchApplication(props.application);
    toaster.addSuccessMessage("Application mise à jour avec succès");
  } catch (error) {
    toaster.addErrorMessage("Erreur lors de la mise à jour de l'application");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="application-links">
    <h2 class="title">Liens de l’application</h2>

    <div v-if="props.application.externalRessource && props.application.externalRessource.length" class="links-list">
      <div v-for="(link, index) in props.application.externalRessource" :key="link.id" class="links-card">
        <header class="link-header">
          <h3>Lien #{{ index + 1 }}</h3>
          <p v-if="link.link" class="link-link">{{ link.link }}</p>
        </header>
        <div class="link-content">
          <DsfrInput v-model="link.link" label="Lien" label-visible />
          <DsfrInput v-model="link.description" label="Description" label-visible isTextarea />
          <DsfrSelect v-model="link.type" label="Type de conformité" :options="linkTypes" />
        </div>
      </div>
    </div>
    <div v-else class="no-links">
      <p>Aucun lien n'est disponible pour cette application.</p>
    </div>

    <div class="actions">
      <DsfrButton label="Sauvegarder les liens" :disabled="loading" @click="patchApplication" />
    </div>
  </div>
</template>

<style scoped>
.application-links {
  padding: 1rem;
  background-color: #fefefe;
}

.title {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  text-align: center;
  color: #333;
}

.links-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.link-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

.link-header {
  border-bottom: 1px solid #ddd;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
}

.link-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #005ea8;
}

.link-name {
  font-style: italic;
  color: #333;
}

.link-content {
  display: grid;
  gap: 1rem;
}

.no-links {
  text-align: center;
  font-style: italic;
  color: #777;
}

.actions {
  text-align: center;
  margin-top: 1rem;
}
</style>
