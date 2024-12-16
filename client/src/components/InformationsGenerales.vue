<script setup lang="ts">
import type { Application } from "@/models/Application";
import useToaster from "@/composables/use-toaster";
import axios from "axios";

const props = defineProps<{ application: Application }>();
const loading = ref(false);
const toaster = useToaster();

function patchApplication(event: Event) {
  loading.value = true;
  axios
    .patch(`/applications/${props.application.id}`, {
      label: props.application.label,
      shortName: props.application.shortName,
      description: props.application.description,
    })
    .then(() => {
      toaster.addSuccessMessage("Application mise à jour avec succès");
    })
    .catch((error) => {
      toaster.addErrorMessage("Erreur lors de la mise à jour de l'application");
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<template>
  <h3>Informations générales</h3>
  <div class="fr-mb-3w"><DsfrInput v-model="application.id" label="Identifiant unique" label-visible disabled /></div>
  <div class="fr-mb-3w"><DsfrInput v-model="application.label" label="Nom" label-visible required /></div>
  <div class="fr-mb-3w"><DsfrInput v-model="application.shortName" label="Nom abrégé" label-visible required /></div>
  <div class="fr-mb-3w"><DsfrInput v-model="application.description" label="Description" label-visible required isTextarea /></div>
  <DsfrButton label="Sauvegarder" primary @click="patchApplication" />
</template>
