<script setup lang="ts">
import type { Application } from '@/models/Application'

const props = defineProps<{ application: Application }>()
</script>

<template>
  <div>
    <h3>Description</h3>
    <p><strong>Description :</strong> {{ props.application.description }}</p>
    <p><strong>URL :</strong> {{ props.application.url }}</p>
    <p><strong>URI :</strong> {{ props.application.uri }}</p>
  </div>
</template>
