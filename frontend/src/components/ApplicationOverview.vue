<script setup lang="ts">
import type { Application } from "@/models/Application";
import { ref } from "vue";
import InformationsGenerales from "./InformationsGenerales.vue";
import Acteurs from "./Acteurs.vue";
import NotificationsApplication from "./NotificationsApplication.vue";
import Links from "./Links.vue";

const props = defineProps<{ application: Application }>();

const activeTab = ref(0);

const tabListName = "Informations sur l’application";
const tabTitles = [
  { title: "Informations générales", icon: "ri-checkbox-circle-line", tabId: "tab-0", panelId: "tab-content-0" },
  {
    title: "Liens",
    icon: "ri-links-line",
    tabId: "tab-1",
    panelId: "tab-content-1",
  },
  {
    title: "Conformité",
    icon: "ri-shield-check-line",
    tabId: "tab-2",
    panelId: "tab-content-2",
  },
  {
    title: "Acteurs",
    icon: "ri-team-line",
    tabId: "tab-2",
    panelId: "tab-content-2",
  },
  { title: "Signalements", icon: "ri-alert-line", tabId: "tab-3", panelId: "tab-content-3" },
];
</script>

<template>
  <!-- DsfrTabs pour les onglets avec gestion de l'onglet actif -->
  <DsfrTabs v-model="activeTab" :tab-list-name="tabListName">
    <!-- Définir chaque onglet via DsfrTabItem -->
    <template #tab-items>
      <DsfrTabItem
        v-for="(tab, index) in tabTitles"
        :key="tab.tabId"
        :tab-id="tab.tabId"
        :panel-id="tab.panelId"
        :icon="tab.icon"
        @click="activeTab = index"
      >
        {{ tab.title }}
      </DsfrTabItem>
    </template>

    <!-- Contenu de chaque onglet -->
    <DsfrTabContent v-if="activeTab === 0" panel-id="tab-content-0" tab-id="tab-0">
      <InformationsGenerales :application="props.application" />
    </DsfrTabContent>

    <DsfrTabContent v-if="activeTab === 1" panel-id="tab-content-1" tab-id="tab-1">
      <Links :application="props.application" />
    </DsfrTabContent>

    <DsfrTabContent v-if="activeTab === 2" panel-id="tab-content-2" tab-id="tab-2">
      <Compliances :application="props.application" />
    </DsfrTabContent>

    <DsfrTabContent v-if="activeTab === 3" panel-id="tab-content-3" tab-id="tab-3">
      <Acteurs :application="props.application" />
    </DsfrTabContent>

    <DsfrTabContent v-if="activeTab === 4" panel-id="tab-content-4" tab-id="tab-4">
      <NotificationsApplication :application="props.application" />
      <!-- Composant Signalements -->
    </DsfrTabContent>
  </DsfrTabs>
</template>
