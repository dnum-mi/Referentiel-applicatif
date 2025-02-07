<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Applications from "@/api/application";
import type { Application, ExternalRessource } from "@/models/Application";
import useToaster from "@/composables/use-toaster";
import { defineProps, defineEmits } from "vue";

const toaster = useToaster();

const props = defineProps({
  application: {
    type: Object,
    required: true,
  },
  title: { type: String, default: "" },
  icon: { type: String, default: "" },
});

const emit = defineEmits(["update:application"]);

const localLinks = ref<ExternalRessource[]>(
  Array.isArray(props.application.externalRessource) ? [...props.application.externalRessource] : [],
);

watch(
  () => props.application.externalRessource,
  (newVal) => {
    localLinks.value = Array.isArray(newVal) ? [...newVal] : [];
  },
);

const linkTypesDict = {
  documentation: "Documentation",
  supervision: "Supervision",
  service: "Service",
};

const linkTypes = computed(() => [
  { value: "", text: "choisir un type de lien" },
  ...Object.entries(linkTypesDict).map(([key, label]) => ({
    value: key,
    text: label,
  })),
]);

const loading = ref(false);

const hasChanges = computed(() => JSON.stringify(localLinks.value) !== JSON.stringify(props.application.externalRessource));

const selectedLinkIds = ref<string[]>([]);

function addLink() {
  localLinks.value.push({
    id: Date.now().toString(),
    link: "",
    description: "",
    type: "",
    applicationId: props.application.id,
  });
}

function removeLink(linkId: string) {
  localLinks.value = localLinks.value.filter((link) => link.id !== linkId);
}

function removeSelectedLinks() {
  localLinks.value = localLinks.value.filter((link) => !selectedLinkIds.value.includes(link.id));
  selectedLinkIds.value = [];
}

function cancelChanges() {
  localLinks.value = Array.isArray(props.application.externalRessource) ? [...props.application.externalRessource] : [];
}

async function saveAll() {
  for (const link of localLinks.value) {
    if (!link.link.trim()) {
      toaster.addErrorMessage("Le lien est requis pour tous les liens.");
      return;
    }
  }

  const existingIds = new Set((props.application.externalRessource || []).map((l: ExternalRessource) => l.id));
  const linksToSave = localLinks.value.map((link) => (existingIds.has(link.id) ? link : { ...link, id: undefined }));

  loading.value = true;
  try {
    const updatedApplication = await Applications.patchApplication({
      ...props.application,
      externalRessource: linksToSave,
    });
    emit("update:application", updatedApplication);
    toaster.addSuccessMessage("Liens sauvegardés avec succès !");
  } catch (error) {
    toaster.addErrorMessage("Erreur lors de la sauvegarde des liens.");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <div class="header">
      <h2>Gestion des liens</h2>
    </div>

    <div class="global-delete">
      <DsfrButton type="button" tertiary @click="removeSelectedLinks" :disabled="selectedLinkIds.length === 0">
        Supprimer la sélection
      </DsfrButton>
    </div>

    <table class="link-table">
      <thead>
        <tr>
          <th>Sélection</th>
          <th>Lien</th>
          <th>Description</th>
          <th>Type de lien</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="link in localLinks" :key="link.id">
          <td>
            <input type="checkbox" :value="link.id" v-model="selectedLinkIds" />
          </td>
          <td>
            <DsfrInput v-model="link.link" placeholder="Entrez le lien" />
          </td>
          <td>
            <DsfrInput v-model="link.description" placeholder="Entrez la description" />
          </td>
          <td>
            <DsfrSelect v-model="link.type" :options="linkTypes" />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="actions">
      <DsfrButton type="button" class="add-btn" @click="addLink">Ajouter un lien</DsfrButton>
      <DsfrButton type="button" class="cancel-btn" @click="cancelChanges" :disabled="!hasChanges"> Annuler </DsfrButton>
      <DsfrButton type="button" class="save-btn" @click="saveAll" :loading="loading">Sauvegarder</DsfrButton>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.link-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--dsfr-border, #ccc);
  overflow: hidden;
  background-color: #fff;
  font-family: var(--dsfr-font-family, Arial, sans-serif);
}
.link-table thead {
  background-color: var(--dsfr-gray-10, #f9f9f9);
  color: #5a5959;
}
.link-table th,
.link-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--dsfr-border, #ccc);
  text-align: left;
}
.link-table th {
  font-size: 0.95rem;
  font-weight: 600;
}
.link-table tbody tr:last-child td {
  border-bottom: none;
}
.link-table tbody tr:nth-child(even) {
  background-color: var(--dsfr-gray-50, #fbfbfb);
}
.link-table tbody tr:hover {
  background-color: var(--dsfr-gray-100, #f7f7f7);
}

.link-table input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.global-delete {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-start;
}
.global-delete DsfrButton {
  background-color: var(--dsfr-error, #d32f2f);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  transition: filter 0.3s;
}
.global-delete DsfrButton:hover:not(:disabled) {
  filter: brightness(0.9);
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.actions DsfrButton {
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-weight: 600;
  transition: filter 0.3s;
}
.actions DsfrButton:hover:not(:disabled) {
  filter: brightness(0.95);
}
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
