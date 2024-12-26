<script setup lang="ts">
import { ref, defineProps } from "vue";
import { useReportIssueStore } from "../stores/reportIssue";
import useToaster from "@/composables/use-toaster";

const props = defineProps({
  application: {
    type: Object,
    required: true,
  },
});

const correctionText = ref("");
const toaster = useToaster();
const title = "Proposer une correction";
const opened = ref(false);

const hint = `Veuillez renseigner les anomalies détectées pour l'application "${props.application.data.label}"`;
const label = "Proposition";

const useReportIssue = useReportIssueStore();

const submitCorrection = async () => {
  try {
    const applicationId = props.application.data.id;
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
    <!-- Bouton pour ouvrir la modal -->
    <DsfrButton @click="opened = true">Proposer une correction</DsfrButton>

    <!-- Modal -->
    <DsfrModal v-model:opened="opened" :title="title" @close="opened = false">
      <template #default>
        <h2>{{ application.data.label }}</h2>
        <DsfrInput is-textarea v-model="correctionText" :hint="hint" :label="label" label-visible required />
        <div class="button-right">
          <DsfrButton @click="submitCorrection"> Soumettre ma proposition </DsfrButton>
        </div>
      </template>
    </DsfrModal>
  </div>
</template>
