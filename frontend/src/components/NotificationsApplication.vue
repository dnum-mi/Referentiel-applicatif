<script setup lang="ts">
import Issue from "@/api/reportIssue";
import type { Application } from "@/models/Application";
import { onMounted, ref } from "vue";
import { formatDate } from "@/composables/use-date";
import { statusDictionary, statusIconClasses, statusColors } from "@/composables/use-dictionary";

const props = defineProps<{ application: Application }>();

const notifications = ref<any[]>([]);

const rowsPerPage = ref(10);
const currentPage = ref(0);
const totalNotifications = computed(() => notifications.value.length);

const handleRowsPerPageChange = (value: number) => {
  rowsPerPage.value = value;
  currentPage.value = 0;
};

const paginatedNotifications = computed(() => {
  const start = currentPage.value * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return notifications.value.slice(start, end);
});

const pages = computed(() => {
  const totalPages = Math.max(1, Math.ceil(totalNotifications.value / rowsPerPage.value));
  return Array.from({ length: totalPages }, (_, i) => ({
    title: `${i + 1}`,
    href: `#${i + 1}`,
    label: `${i + 1}`,
  }));
});

const loadNotifications = async () => {
  try {
    const notificationList = await Issue.getNotificationsByApplicationId(props.application.id);
    console.log("Notifications récupérées:", notificationList);
    notifications.value = notificationList;
  } catch (error) {
    console.error("Une erreur est survenue lors du chargement des notifications :", error);
  }
};

onMounted(() => {
  loadNotifications();
});
</script>

<template>
  <section class="fr-container fr-my-2v">
    <div v-if="notifications && notifications.length > 0">
      <ul class="fr-list fr-list--unstyled">
        <li v-for="(notification, index) in paginatedNotifications" :key="index" class="bg-contrast-grey fr-mt-2w">
          <header class="fr-grid-row fr-grid-row--middle fr-px-3w no-wrap">
            <div class="fr-text--sm text-grey-380">
              <strong>Notifié par:</strong> <span class="fr-text--bold">{{ notification.notifier.email }}</span>
            </div>
            <p class="fr-text--sm text-grey-380">
              <DsfrTag :label="statusDictionary[notification.status]" :icon="statusIconClasses[notification.status]"
                :class="statusColors[notification.status]" />
            </p>
            <p class="fr-text--sm"><strong>Date de création:</strong> {{ formatDate(notification.createdAt) }}</p>
          </header>
          <div class="description-content">
            <p class="">{{ notification.description }}</p>
          </div>
        </li>
      </ul>
    </div>

    <div v-else>
      <p>Aucune notification disponible.</p>
    </div>
  </section>
  <div class="fr-flex-container fr-mb-2w">
    <div class="fr-select">
      <label for="rowsPerPage">Résultats par page :</label>
      <select id="rowsPerPage" v-model="rowsPerPage" @change="handleRowsPerPageChange($event.target.value)">
        <option :value="10">10</option>
        <option :value="30">30</option>
        <option :value="50">50</option>
      </select>
    </div>
    <div class="fr-pagination">
      <DsfrPagination v-model:current-page="currentPage" :pages="pages" />
    </div>
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

.fr-container {
  padding: 1em;
  margin: 1em;
  background-color: #f9f9f9;
}

.bg-contrast-grey {
  background-color: #f0f0f0;
}

.fr-text--sm {
  font-size: 0.875rem;
}

.fr-grid-row--middle {
  display: flex;
  align-items: center;
  justify-content: start;
  margin-bottom: -2em;
}

.fr-col-auto {
  flex: 0 0 auto;
}

.text-grey-380 {
  color: #6c757d;
}

.fr-list--unstyled {
  list-style: none;
  padding-left: 0;
}

.fr-text--bold {
  font-weight: bold;
}

.text-align-right {
  text-align: right;
}

.description-content {
  margin: 1em 0em 1em 2em;
}

.fr-flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fr-select {
  max-width: 200px;
}

.fr-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  max-width: 200px;
}

.fr-select label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a4a4a;
}

.fr-select select {
  padding: 0.5rem;
  font-size: 0.9rem;
  color: #333;
  border: 1px solid #dcdcdc;
  border-radius: 0.375rem;
  background-color: #fff;
  transition:
    border-color 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
}

.fr-select select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.fr-select select:hover {
  border-color: #007bff;
  cursor: pointer;
}
</style>
