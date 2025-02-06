<script setup lang="ts">
import { ref, defineProps } from "vue";
import { useReportIssueStore } from "../stores/reportIssue";
import useToaster from "@/composables/use-toaster";
import type { Application } from "@/models/Application";

const props = defineProps({
  application: {
    type: Object,
    required: true,
  },
});
const application = ref<Application>(props.application);
const correctionText = ref("");
const toaster = useToaster();
const title = "Proposer une correction";
const opened = ref(false);

const hint = `Veuillez renseigner votre signalement détecté pour l'application "${application.value?.label || ""}"`;
const label = "Proposition";

const useReportIssue = useReportIssueStore();

const submitCorrection = async () => {
  try {
    const applicationId = application.value?.id;
    if (!applicationId) throw new Error("Application ID is undefined");
    const response = await useReportIssue.proposeCorrection(applicationId, correctionText.value);
    console.log(response);
    opened.value = false;
    toaster.addSuccessMessage("Votre proposition sera pris en compte prochainement. ");
  } catch (error) {
    toaster.addErrorMessage(
      "Oops! Une erreur, veuillez contactez l'administrateur du référentiel des applications, si le problème persiste",
    );
  }
};
</script>

<template>
  <div class="fr-container fr-my-2v">
    <DsfrButton @click="opened = true">Proposer une correction</DsfrButton>

    <DsfrModal v-model:opened="opened" :title="title" @close="opened = false">
      <template #default>
        <h2>{{ application?.label }}</h2>
        <DsfrInput is-textarea v-model="correctionText" :hint="hint" :label="label" label-visible required />
        <div class="button-right">
          <DsfrButton @click="submitCorrection"> Soumettre ma proposition </DsfrButton>
        </div>
      </template>
    </DsfrModal>
  </div>
</template>
