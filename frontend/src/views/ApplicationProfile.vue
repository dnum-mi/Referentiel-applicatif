<script setup lang="ts">
import type { Application } from "@/models/Application";
import Applications from "@/api/application";
import ApplicationOverview from "@/components/ApplicationOverview.vue";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import ReportIssue from "@/components/ReportIssue.vue";

const route = useRoute();
const id = route.params.id as string;
const application = ref<Application | null>(null);
const isLoading = ref(false);
const errorMessage = ref("");

function handleApplicationUpdate(updatedApplication: Application) {
  application.value = updatedApplication;
}

async function loadApplication() {
  isLoading.value = true;
  try {
    application.value = await Applications.getApplicationById(id);
  } catch (error) {
    errorMessage.value = "Une erreur est survenue lors de la récupération de l'application.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadApplication);
</script>

<template>
  <div>
    <DsfrBreadcrumb />
    <div v-if="isLoading">Chargement...</div>
    <div v-else-if="errorMessage">
      {{ errorMessage }}
    </div>
    <div v-else-if="application && application.data">
      <h2>{{ application.data.label }}</h2>
      <ReportIssue class="button-right" :application="application.data" />
      <ApplicationOverview :application="application.data" @update:application="handleApplicationUpdate" />
    </div>
  </div>
</template>

<style scoped></style>
