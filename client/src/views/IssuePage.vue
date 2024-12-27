<script setup lang="ts">
import reportIssue from "@/components/ReportIssue.vue";
import type { Application } from "@/models/Application";
import { onMounted, ref } from "vue";

const props = defineProps<{ application: Application }>();

const title = "Anomalies";
const headers = ["ID", "Description", "Date", "Statut"];
const noCaption = true;

const rows = ref<(string | { component: string; [k: string]: unknown })[][]>([]);
const currentPage = ref(1);
const resultsDisplayed = 5;

const loadReports = async () => {
  try {
    const reportList = await reportIssue.getReportIssue();
    rows.value = reportList.map((report: any) => [
      report.id,
      report.description,
      report.date,
      {
        component: "DsfrTag",
        label: report.status,
        class: report.status.toLowerCase(),
      },
    ]);
  } catch (error) {
    console.log("Une erreur est survenue lors du chargement des anomalies :", error);
  }
};

onMounted(() => {
  loadReports();
});
</script>

<template>
  <DsfrTable
    :title="title"
    :headers="headers"
    :rows="rows"
    :no-caption="noCaption"
    :current-page="currentPage"
    :results-displayed="resultsDisplayed"
  />
</template>

<style scoped>
:deep(.en-cours) {
  color: var(--info-425-625);
  background-color: var(--info-950-100);
}
:deep(.a-faire) {
  color: var(--error-425-625);
  background-color: var(--error-950-100);
}
:deep(.fait) {
  color: var(--success-425-625);
  background-color: var(--success-950-100);
}
</style>
