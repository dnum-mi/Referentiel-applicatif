<script setup lang="ts">
import Issue from "@/api/reportIssue";
import type { Application } from "@/models/Application";
import { onMounted, ref } from "vue";
import { formatDate } from "@/composables/use-date";
import { statusDictionary, statusIconClasses, statusColors } from "@/composables/use-dictionary";
import useToaster from "@/composables/use-toaster";

const props = defineProps<{ application: Application }>();

const notifications = ref<any[]>([]);

const toaster = useToaster();

const statusText = ref("");
const opened = ref(false);
const statuses = Object.keys(statusDictionary);
const editingRow = ref<number | null>(null);

const rowsPerPage = ref(10);
const currentPage = ref(0);
const totalNotifications = computed(() => notifications.value.length);

const handleRowsPerPageChange = (value: number) => {
  rowsPerPage.value = value;
  currentPage.value = 0;
};
const handleEditClick = (rowId: number) => {
  editingRow.value = rowId;
};

const handleCancelClick = () => {
  editingRow.value = null;
};

const handleValidateClick = async (notificationId: string, newStatus: string) => {
  try {
    const response = await Issue.updateStatus(notificationId, newStatus);
    console.log(response);
    opened.value = false;
    editingRow.value = null;
    toaster.addSuccessMessage("Votre modification du statut à été enregistrée. ");
  } catch (error) {
    toaster.addErrorMessage(
      "Oops! Une erreur, veuillez contactez l'administrateur du référentiel des applications, si le problème persiste",
    );
  }
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

    notifications.value.forEach((notification) => {
      notification.statu = statuses[0];
    });
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
            <!--         <template v-if="editingRow === notification.id">
              <select v-model="notification.statu" class="fr-select">
                <option v-for="statu in statuses" :key="statu" :value="statu">
                  {{ statusDictionary[statu] }}
                </option>
              </select>
            </template>
            <template v-if="editingRow === notification.id">
              <div class="fr-buttons-container">
                <DsfrButton @click="handleValidateClick(notification.id, notification.statu)">Valider</DsfrButton>
                <DsfrButton @click="handleCancelClick">Annuler</DsfrButton>
              </div>
            </template>
            <template v-else>
              <div class="fr-buttons-container">
                <DsfrButton @click="handleEditClick(notification.id)">Modifier</DsfrButton>
              </div>
            </template> -->
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
  <div class="fr-flex-container">
    <DsfrPagination v-model:current-page="currentPage" :pages="pages" />
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
  max-height: 500px;
  overflow-y: auto;
}

.fr-list {
  max-height: 400px;
  overflow-y: auto;
}

.fr-flex-container {
  display: flex;
  justify-content: center;
  position: sticky;
  bottom: 0;
  padding: 1rem;
  z-index: 10;
  width: 100%;
}

.bg-contrast-grey {
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 1rem;
}

.fr-text--sm {
  font-size: 0.875rem;
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

.description-content {
  margin-top: 0.5rem;
  padding-left: 1rem;
  border-left: 3px solid #dcdcdc;
}

.fr-actions-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.5rem;
}

.fr-buttons-container {
  display: flex;
  gap: 0.5rem;
  min-height: 40px;
}

.fr-select {
  min-width: 150px;
}

.fr-grid-row--middle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
