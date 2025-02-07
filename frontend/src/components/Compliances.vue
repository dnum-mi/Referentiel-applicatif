<script setup lang="ts">
import { ref, computed } from "vue";
import Applications from "@/api/application";
import type { Application } from "@/models/Application";
import useToaster from "@/composables/use-toaster";
import AppDate from "./AppDate.vue";

const props = defineProps<{ application: Application }>();
if (!props.application.compliances) {
  props.application.compliances = [];
}
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

// Ajout de la fonction pour ajouter une conformité
function addCompliance() {
  // Création d'une nouvelle conformité avec des valeurs par défaut
  props.application.compliances.push({
    id: Date.now(), // id temporaire
    type: "",
    name: "",
    status: "",
    notes: "",
    validityStart: "",
    validityEnd: "",
    scoreValue: "",
    scoreUnit: "",
  });
}

// Nouvelle variable réactive pour la sélection des conformités
const selectedComplianceIds = ref<number[]>([]);

// Fonction pour supprimer les conformités sélectionnées
function removeSelectedCompliances() {
  props.application.compliances = props.application.compliances.filter(
    (compliance) => !selectedComplianceIds.value.includes(compliance.id),
  );
  selectedComplianceIds.value = [];
}
</script>

<template>
  <div class="application-compliances">
    <h2 class="title">Conformités de l’application</h2>

    <!-- Bouton pour ajouter une nouvelle conformité -->
    <div class="actions-add">
      <DsfrButton label="Ajouter une conformité" @click="addCompliance" />
    </div>

    <!-- Bouton de suppression globale -->
    <div class="global-delete">
      <DsfrButton tertiary type="button" @click="removeSelectedCompliances" :disabled="selectedComplianceIds.length === 0">
        Supprimer la sélection
      </DsfrButton>
    </div>

    <!-- Affichage conditionnel du tableau ou d'un message -->
    <div v-if="props.application.compliances && props.application.compliances.length">
      <table class="compliance-table">
        <thead>
          <tr>
            <th>Sélection</th>
            <th>Type</th>
            <th>Nom</th>
            <th>Statut</th>
            <th>Notes</th>
            <th>Date de début</th>
            <th>Date de fin</th>
            <th>Score</th>
            <th>Unité</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="compliance in props.application.compliances" :key="compliance.id">
            <td>
              <input type="checkbox" :value="compliance.id" v-model="selectedComplianceIds" />
            </td>
            <td>
              <DsfrSelect v-model="compliance.type" :options="complianceTypes" />
            </td>
            <td>
              <DsfrInput v-model="compliance.name" placeholder="Nom" />
            </td>
            <td>
              <DsfrSelect v-model="compliance.status" :options="complianceStatuses" />
            </td>
            <td>
              <DsfrInput v-model="compliance.notes" placeholder="Notes" isTextarea />
            </td>
            <td>
              <AppDate v-model="compliance.validityStart" label="Date de début" />
            </td>
            <td>
              <AppDate v-model="compliance.validityEnd" label="Date de fin" />
            </td>
            <td>
              <DsfrInput v-model="compliance.scoreValue" placeholder="Score" />
            </td>
            <td>
              <DsfrInput v-model="compliance.scoreUnit" placeholder="Unité" />
            </td>
          </tr>
        </tbody>
      </table>
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

.actions-add {
  text-align: center;
  margin-bottom: 1rem;
}

.global-delete {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-start;
}

.compliance-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #ccc;
  background-color: #fff;
  margin-bottom: 1.5rem;
}

.compliance-table thead {
  background-color: #f9f9f9;
  color: #5a5959;
}

.compliance-table th,
.compliance-table td {
  padding: 1rem;
  border-bottom: 1px solid #ccc;
  text-align: left;
}

.compliance-table tbody tr:nth-child(even) {
  background-color: #fbfbfb;
}

.compliance-table tbody tr:hover {
  background-color: #f7f7f7;
}
</style>
