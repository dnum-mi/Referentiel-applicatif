<script setup lang="ts">
import Issues from "@/api/reportIssue";
import type { Application } from "@/models/Application";
import { onMounted, ref } from "vue";
import { routeNames } from "@/router/route-names";
import { formatDate } from "@/composables/use-date";

const props = defineProps<{ application: Application }>();

const title = "Liste des anomalies";
const headers = ["Application", "Description", "Date", "Statut", "Actions"];

const rows = ref<(string | { component: string; [k: string]: unknown })[][]>([]);
const selection = ref<string[]>([]);
const currentPage = ref<number>(0);

const loadReports = async () => {
  try {
    const reportList = await Issues.getReportIssue();
    console.log("Données reçues :", reportList);

    rows.value = reportList.map((report: any) => [
      {
        label: report.application?.label,
        to: { name: routeNames.PROFILEAPP, params: { id: report.application?.id } },
      },
      report.description,
      formatDate(report.createdAt), 
      {
        component: 'DsfrTag',
        label: getStatusLabel(report.status),
        class: report.status,
      },
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
      <template #cell="{ colKey, cell }">
        <template v-if="colKey === 'Application'">
          <router-link 
            :to= "cell.to">
            {{ cell.label }}
          </router-link>
        </template>
        <template v-else-if="colKey === 'Statut'">
          <DsfrTag 
            :class="cell.class"
            :label="cell.label"
          />
        </template>
        <template v-else-if="colKey === 'Actions'">
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
  <!--  IDs sélectionnées : {{ selection }} -->
  </div>
</template>


<style scoped>
:deep(.in_progress) {
  color: var(--info-425-625);
  background-color: var(--info-950-100);
}

:deep(.in_pending) {
  color: var(--error-425-625);
  background-color: var(--error-950-100);
}

:deep(.done) {
  color: var(--success-425-625);
  background-color: var(--success-950-100);
}
</style>
