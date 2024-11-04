<script setup lang="ts">
import type { Application } from '@/models/Application'
import { ref } from 'vue'
import Description from './Description.vue'
import InformationsGenerales from './InformationsGenerales.vue'
import Objectifs from './Objectifs.vue'
import Tags from './Tags.vue'

const props = defineProps<{ application: Application }>()

const activeTab = ref(0)

const tabListName = 'Informations sur l’application'
const tabTitles = [
  { title: 'Informations générales', icon: 'ri-checkbox-circle-line', tabId: 'tab-0', panelId: 'tab-content-0' },
  { title: 'Description', icon: 'ri-checkbox-circle-line', tabId: 'tab-1', panelId: 'tab-content-1' },
  { title: 'Objectifs', icon: 'ri-checkbox-circle-line', tabId: 'tab-2', panelId: 'tab-content-2' },
  { title: 'Tags', icon: 'ri-checkbox-circle-line', tabId: 'tab-3', panelId: 'tab-content-3' }
]
</script>

<template>
  <div class="fr-container fr-my-2w">
    <!-- DsfrTabs pour les onglets avec gestion de l'onglet actif -->
    <DsfrTabs
      v-model="activeTab"
      :tab-list-name="tabListName"
    >
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
      <DsfrTabContent
        v-if="activeTab === 0"
        panel-id="tab-content-0"
        tab-id="tab-0"
      >
        <InformationsGenerales :application="props.application" />
      </DsfrTabContent>

      <DsfrTabContent
        v-if="activeTab === 1"
        panel-id="tab-content-1"
        tab-id="tab-1"
      >
        <Description :application="props.application" />
      </DsfrTabContent>

      <DsfrTabContent
        v-if="activeTab === 2"
        panel-id="tab-content-2"
        tab-id="tab-2"
      >
        <Objectifs :application="props.application" />
      </DsfrTabContent>

      <DsfrTabContent
        v-if="activeTab === 3"
        panel-id="tab-content-3"
        tab-id="tab-3"
      >
        <Tags :application="props.application" />
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>
