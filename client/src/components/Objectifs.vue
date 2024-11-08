<script setup lang="ts">
import type { Application } from '@/models/Application'

const props = defineProps<{ application: Application }>()
</script>

<template>
  <div>
    <h3>Objectifs</h3>
    <ul>
      <li v-for="(purpose, index) in application.purposes" :key="index">{{ purpose }}</li>
    </ul>
  </div>
</template>
