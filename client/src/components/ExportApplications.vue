<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

const searchLabel = ref(""); // Champ de recherche lié au composant

async function exportToCsv() {
  try {
    const response = await axios.get("/applications/export", {
      responseType: "blob",
      params: {
        label: searchLabel.value, // Inclure le filtre de recherche si défini
      },
    });

    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "applications.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    alert("Une erreur est survenue lors de l'exportation. Veuillez réessayer.");
  }
}
</script>

<template>
  <div>
    <DsfrButton label="Exporter en CSV" icon="ri-download-line" @click="exportToCsv" />
  </div>
</template>
