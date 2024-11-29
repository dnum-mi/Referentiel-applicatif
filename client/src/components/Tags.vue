<script setup lang="ts">
import type { Application } from "@/models/Application";

const props = defineProps<{ application: Application }>();
</script>

<template>
  <div>
    <h3>Tags</h3>
    <ul>
      <li v-for="(tag, index) in application.tags" :key="index">
        {{ tag }}
      </li>
    </ul>
  </div>
</template>
