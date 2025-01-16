<script setup lang="ts">
import type { Application } from "@/models/Application";
import Applications from "@/api/application";
// import ApplicationOverview from "@/components/ApplicationOverview.vue";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import ReportIssue from "@/components/ReportIssue.vue";

const route = useRoute();
const id = route.params.id as string;
let application = ref<Application | null>(null);
const isLoading = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  isLoading.value = true;
  try {
    application.value = await Applications.getApplicationById(id);
  } catch (error) {
    errorMessage.value = "Une erreur est survenue lors de la récupération de l'application.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <DsfrBreadcrumb />
    <div v-if="isLoading">Chargement...</div>
    <div v-else-if="errorMessage">
      {{ errorMessage }}
    </div>
    <div v-else-if="application">
      <h2>{{ application.data.label }}</h2>
      <ReportIssue class="button-right" :application="application" />
      <ApplicationOverview :application="application.data" />
    </div>
  </div>
</template>

<style scoped></style>
