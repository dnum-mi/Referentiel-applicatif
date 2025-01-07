<script setup lang="ts">
import reportIssue from "@/components/ReportIssue.vue";
import Issues from "@/api/reportIssue";
import type { Application } from "@/models/Application";
import { onMounted, ref } from "vue";

const props = defineProps<{ application: Application }>();

const title = "Liste des anomalies";
const headers = ["Application", "Description", "Date", "Statut", "Actions"];
const noCaption = true;

const rows = ref<(string | { component: string; [k: string]: unknown })[][]>([]);
const selection = ref<string[]>([]);
const currentPage = ref<number>(0);
const $id = "f15d1c13-8198-4ca5-a180-94656e20d568";

const loadReports = async () => {
  try {
    const reportList = await Issues.getReportIssue();
    console.log("Données reçues :", reportList);

    rows.value = reportList.map((report: any) => [
      report.application?.label,
      report.description,
      formatDate(report.createdAt), 
      getStatusLabel(report.status),
      {
        component: 'DsfrButton',
        label: 'Supprimer',
        id: report.id,
        onClick: () => Issues.deleteReportIssue(report.id),
      }
    ]);

  } catch (error) {
    console.error("Une erreur est survenue lors du chargement des anomalies :", error);
  }
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};


const getStatusLabel = (status: string): string => {
  switch (status) {
    case "in_pending":
      return "Non traité";
    case "in_progress":
      return "En cours";
    case "done":
      return "Fait";
    default:
      return "Non traité";
  }
};

onMounted(() => {
  loadReports();
});

</script>

<template>
  <div class="fr-container fr-my-2v w-[800px]">
    <DsfrDataTable
      v-model:selection="selection"
      v-model:current-page="currentPage"
      :headers-row="headers"
      :rows="rows"
      selectable-rows
      row-key="id"
      :title="title"
      pagination
      :rows-per-page="2"
      :pagination-options="[1, 2, 3]"
      bottom-action-bar-class="bottom-action-bar-class"
      pagination-wrapper-class="pagination-wrapper-class"
      sorted="id"
      :sortable-rows="['id']"
    >
      <template #cell="{ colKey, cell, rowIndex }">
        <template v-if="colKey === 'Actions'">
          <DsfrButton
            v-if="cell.component === 'DsfrButton'"
            :label="cell.label"
            :id="cell.id"
            @click="cell.onClick"
          />
        </template>
        <template v-else>
          {{ cell }}
        </template>
      </template>
    </DsfrDataTable>
    IDs sélectionnées : {{ selection }}
  </div>
</template>


<style scoped>
:deep(.en-cours) {
  color: var(--info-425-625);
  background-color: var(--info-950-100);
}

:deep(.non-traite) {
  color: var(--error-425-625);
  background-color: var(--error-950-100);
}

:deep(.fait) {
  color: var(--success-425-625);
  background-color: var(--success-950-100);
}

:deep(.default) {
  color: var(--error-425-625);
  background-color: var(--error-950-100);
}
</style>
