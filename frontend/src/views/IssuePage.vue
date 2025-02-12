<script setup lang="ts">
import Issues from "@/api/reportIssue";
import type { Application } from "@/models/Application";
import { onMounted, ref } from "vue";
import { routeNames } from "@/router/route-names";
import { formatDate } from "@/composables/use-date";
import { statusDictionary, statusIconClasses } from "@/composables/use-dictionary";

const title = "Liste de mes signalements";
const headers = ["Application", "Description", "Date", "Statut"];

const rows = ref<(string | { component: string; [k: string]: unknown })[][]>([]);
const selection = ref<string[]>([]);
const currentPage = ref<number>(0);

const dataLoaded = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");
const debounceTimeout = ref<NodeJS.Timeout | null>(null);

const skeletonRows = ref<Array<Array<any>>>(
  Array(5).fill([{ label: " ", to: "#" }, " ", " ", { component: "DsfrTag", label: " ", class: "skeleton-tag" }]),
);

const loadReports = async () => {
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value);
  }
  debounceTimeout.value = setTimeout(async () => {
    try {
      isLoading.value = true;
      errorMessage.value = "";
      dataLoaded.value = false;

      const reportList = await Issues.getReportIssueByNotifierId();
      rows.value = reportList.map((report: any) => [
        {
          label: report.application?.label,
          to: { name: routeNames.PROFILEAPP, params: { id: report.application?.id } },
        },
        report.description,
        formatDate(report.createdAt),
        {
          component: "DsfrTag",
          icon: statusIconClasses[report.status],
          label: statusDictionary[report.status],
          class: report.status,
        },
      ]);
    } catch (error) {
      errorMessage.value = "Une erreur est survenue lors du chargement des anomalies.";
      return [];
    } finally {
      isLoading.value = false;
      dataLoaded.value = true;
    }
  }, 300);
};

onMounted(() => {
  loadReports();
});
</script>
<template>
  <div class="fr-container fr-my-2v w-[800px]">
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-if="dataLoaded && rows.length === 0" class="text-center">
      <p>Aucun signalement recensé.</p>
    </div>

    <DsfrDataTable
      v-if="isLoading || rows.length > 0"
      v-model:selection="selection"
      v-model:current-page="currentPage"
      :headers-row="headers"
      :rows="isLoading ? skeletonRows : rows"
      selectable-rows
      row-key="id"
      :title="title"
      pagination
      :rows-per-page="10"
      :pagination-options="[10, 20, 30]"
      bottom-action-bar-class="bottom-action-bar-class"
      pagination-wrapper-class="pagination-wrapper-class"
      sorted="id"
      :sortable-rows="['id']"
    >
      <template #cell="{ colKey, cell }">
        <template v-if="isLoading">
          <div class="skeleton-cell"></div>
        </template>
        <template v-else-if="colKey === 'Application'">
          <router-link :to="cell.to">
            {{ cell.label }}
          </router-link>
        </template>
        <template v-else-if="colKey === 'Statut'">
          <DsfrTag :icon="cell.icon" :class="cell.class" :label="cell.label" />
        </template>
        <template v-else>
          {{ cell }}
        </template>
      </template>
    </DsfrDataTable>
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

.text-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #555;
  font-size: 1.2rem;
  font-weight: 500;
  background-color: #f9f9f9;
  border: 1px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
  margin: 20px auto;
  width: 80%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text-center p {
  margin: 0;
  text-align: center;
}

@keyframes skeleton-wave {
  0% {
    background-position: -200% 0;
    opacity: 0.6;
  }
  50% {
    background-position: 200% 0;
    opacity: 1;
  }
  100% {
    background-position: -200% 0;
    opacity: 0.6;
  }
}

@keyframes skeleton-offset {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(2px);
  }
}

.skeleton-cell {
  height: 20px;
  background: linear-gradient(90deg, #f6f6f6 25%, #eaeaea 50%, #f6f6f6 75%);
  background-size: 200% 100%;
  animation:
    skeleton-wave 1.8s infinite,
    skeleton-offset 1.8s infinite alternate;
  border-radius: 4px;
  margin-bottom: 10px;
}

.skeleton-tag {
  display: inline-block;
  width: 80px;
  height: 20px;
  background: linear-gradient(90deg, #f6f6f6 25%, #eaeaea 50%, #f6f6f6 75%);
  background-size: 200% 100%;
  animation:
    skeleton-wave 1.8s infinite,
    skeleton-offset 1.8s infinite alternate;
  border-radius: 4px;
}

.skeleton-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  animation: skeleton-offset 1.5s infinite alternate ease-in-out;
}

.skeleton-row div {
  width: 100%;
  height: 20px;
  background: linear-gradient(90deg, #f6f6f6 25%, #eaeaea 50%, #f6f6f6 75%);
  background-size: 200% 100%;
  animation:
    skeleton-wave 1.8s infinite,
    skeleton-offset 1.8s infinite alternate;
  border-radius: 4px;
  margin-bottom: 10px;
}
</style>
