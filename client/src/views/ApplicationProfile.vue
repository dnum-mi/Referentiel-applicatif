<script setup lang="ts">
import { defineProps } from 'vue'

// Récupérer l'ID de l'application depuis les props
const props = defineProps<{ id: string }>()

// Vous pouvez utiliser l'ID pour récupérer les détails de l'application via une autre API ou service
</script>

<template>
  <div>
    <h1>Fiche de l'application</h1>
    <p>ID de l'application : {{ props.id }}</p>
    <!-- Affichez plus de détails ici -->
  </div>
</template>
