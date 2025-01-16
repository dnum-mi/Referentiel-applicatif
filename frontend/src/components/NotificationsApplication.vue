<script setup lang="ts">
import Issue from "@/api/reportIssue";
import type { Application } from "@/models/Application";
import { onMounted, ref } from "vue";
import { formatDate } from "@/composables/use-date";

const props = defineProps<{ application: Application }>();

const notifications = ref<any[]>([]);

const statusDictionary = {
  in_pending: "En attente",
  in_progress: "En cours",
  done: "Terminé",
};

const statusIconClasses = {
  in_pending: "ri-time-line",
  in_progress: "ri-loader-2-line",
  done: "ri-check-line",
};

const statusColors = {
  in_pending: "bg-warning",
  in_progress: "bg-info",
  done: "bg-success",
};

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
        <li v-for="(notification, index) in notifications" :key="index" class="bg-contrast-grey fr-mt-2w">
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
