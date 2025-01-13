<script setup lang="ts">
import { ref, computed } from "vue";
import Applications from "@/api/application";
import type { Application } from "@/models/Application";
import useToaster from "@/composables/use-toaster";

const props = defineProps<{ application: Application }>();
const loading = ref(false);
const toaster = useToaster();

// Dictionnaires pour les options
const complianceTypesDict = {
  regulation: "Réglementation",
  standard: "Standard",
  policy: "Politique",
  contractual: "Contractuel",
  security: "Sécurité",
  privacy: "Confidentialité",
};

const complianceStatusesDict = {
  compliant: "Conforme",
  non_compliant: "Non conforme",
  partially_compliant: "Partiellement conforme",
  not_concerned: "Non concerné",
};

// Transformation des dictionnaires en tableau d'options adapté à DsfrSelect
const complianceTypes = computed(() => Object.entries(complianceTypesDict).map(([value, text]) => ({ value, text })));

const complianceStatuses = computed(() => Object.entries(complianceStatusesDict).map(([value, text]) => ({ value, text })));

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
  <div class="application-compliances">
    <h2 class="title">Conformités de l’application</h2>

    <div v-if="props.application.compliances && props.application.compliances.length" class="compliances-list">
      <div v-for="(compliance, index) in props.application.compliances" :key="compliance.id" class="compliance-card">
        <header class="compliance-header">
          <h3>Conformité #{{ index + 1 }}</h3>
          <p v-if="compliance.name" class="compliance-name">{{ compliance.name }}</p>
        </header>
        <div class="compliance-content">
          <!-- Sélecteur pour le Type de conformité -->
          <DsfrSelect v-model="compliance.type" label="Type de conformité" :options="complianceTypes" />
          <!-- Input pour le Nom -->
          <DsfrInput v-model="compliance.name" label="Nom" label-visible />
          <!-- Sélecteur pour le Statut -->
          <DsfrSelect v-model="compliance.status" label="Statut" :options="complianceStatuses" />
          <!-- Autres champs -->
          <DsfrInput v-model="compliance.notes" label="Notes" label-visible isTextarea />
          <DsfrInput v-model="compliance.validityStart" label="Date de début (ISO 8601)" label-visible />
          <DsfrInput v-model="compliance.validityEnd" label="Date de fin (ISO 8601)" label-visible />
          <DsfrInput v-model="compliance.scoreValue" label="Score" label-visible />
          <DsfrInput v-model="compliance.scoreUnit" label="Unité de score" label-visible />
        </div>
      </div>
    </div>
    <div v-else class="no-compliances">
      <p>Aucune conformité n'est disponible pour cette application.</p>
    </div>

    <div class="actions">
      <DsfrButton label="Sauvegarder les conformités" :disabled="loading" @click="patchApplication" />
    </div>
  </div>
</template>

<style scoped>
.application-compliances {
  padding: 1rem;
  background-color: #fefefe;
}

.title {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  text-align: center;
  color: #333;
}

.compliances-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.compliance-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

.compliance-header {
  border-bottom: 1px solid #ddd;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
}

.compliance-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #005ea8;
}

.compliance-name {
  font-style: italic;
  color: #333;
}

.compliance-content {
  display: grid;
  gap: 1rem;
}

.no-compliances {
  text-align: center;
  font-style: italic;
  color: #777;
}

.actions {
  text-align: center;
  margin-top: 1rem;
}
</style>
