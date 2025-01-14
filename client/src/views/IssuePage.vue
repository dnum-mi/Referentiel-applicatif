<script setup lang="ts">
import Issues from "@/api/reportIssue";
import type { Application } from "@/models/Application";
import { onMounted, ref } from "vue";
import { routeNames } from "@/router/route-names";
import { formatDate } from "@/composables/use-date";

const props = defineProps<{ application: Application }>();

const title = "Liste des signalements";
const headers = ["Application", "Description", "Date"];

const rows = ref<(string | { component: string; [k: string]: unknown })[][]>([]);
const selection = ref<string[]>([]);
const currentPage = ref<number>(0);

const loadReports = async () => {
  try {
    const reportList = await Issues.getReportIssueByNotifierId();

    rows.value = reportList.map((report: any) => [
      {
        label: report.application?.label,
        to: { name: routeNames.PROFILEAPP, params: { id: report.application?.id } },
      },
      report.description,
      formatDate(report.createdAt)
    ]);

  } catch (error) {
    console.error("Une erreur est survenue lors du chargement des anomalies :", error);
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
        <template v-else>
          {{ cell }}
        </template>
      </template>
    </DsfrDataTable>
  <!--  IDs sélectionnées : {{ selection }} -->
  </div>
</template>


<style scoped>

</style>
