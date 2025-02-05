<script setup lang="ts">
defineProps({
  actor: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["edit", "delete"]);

function onEdit() {
  emit("edit");
}
function onDelete() {
  emit("delete");
}
</script>
<template>
  <div class="action-buttons">
    <DsfrButton @click="onEdit" icon="ri-pencil-line">Éditer</DsfrButton>
    <DsfrButton @click="onDelete" icon="ri-delete-bin-line">Supprimer</DsfrButton>
  </div>
</template>
<style scoped>
.action-buttons {
  display: flex;
  gap: 0.5rem;
}
</style>
