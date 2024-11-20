<script setup lang="ts">
import type { Application } from '@/models/Application'

const props = defineProps<{ application: Application }>()
</script>

<template>
  <div>
    <h3>Informations générales</h3>
    <p><strong>Identifiant unique :</strong> {{ application.id }}</p>
    <p><strong>Nom court :</strong> {{ application.label }}</p>
    <p><strong>Nom abrégé :</strong> {{ application.shortName }}</p>
    <p><strong>Logo :</strong> {{ application.logo }}</p>
  </div>
</template>
