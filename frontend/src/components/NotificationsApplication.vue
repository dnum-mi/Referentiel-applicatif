<script setup lang="ts">
import Issue from "@/api/reportIssue";
import type { Application } from "@/models/Application";
import { onMounted, ref } from "vue";
import { formatDate } from "@/composables/use-date";
import { statusDictionary, statusIconClasses, statusColors } from "@/composables/use-dictionnary";

const props = defineProps<{ application: Application }>();

const notifications = ref<any[]>([]);

const rowsPerPage = ref(2); // à dynamiser
const currentPage = ref(0);

const paginatedNotifications = computed(() => {
  const start = currentPage.value * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return notifications.value.slice(start, end);
});

const totalNotifications = computed(() => notifications.value.length);

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
              <DsfrTag
                :label="statusDictionary[notification.status]"
                :icon="statusIconClasses[notification.status]"
                :class="statusColors[notification.status]"
              />
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
  <DsfrPagination v-model:current-page="currentPage" :pages="pages" :rows-per-page="rowsPerPage" />
</template>

<style scoped>
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
</style>
