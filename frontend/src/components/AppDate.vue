<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { format, parse, isValid } from "date-fns";

const props = defineProps<{
  modelValue: string | null;
  label?: string;
}>();

const emit = defineEmits<{ (e: "update:modelValue", value: string | null): void }>();

// On stocke la date au format ISO
const isoDate = ref<string | null>(props.modelValue);

function updateDateValue(value: string | null) {
  isoDate.value = value;
  emit("update:modelValue", value);
}

const nativeDate = computed<string>({
  get: () => {
    if (!isoDate.value) return "";
    try {
      const dateObj = new Date(isoDate.value);
      if (!isValid(dateObj)) return "";
      return format(dateObj, "yyyy-MM-dd");
    } catch (error) {
      console.error("Erreur lors du get du nativeDate", error);
      return "";
    }
  },
  set: (newNativeValue: string) => {
    if (!newNativeValue) {
      updateDateValue(null);
      return;
    }
    try {
      // Parse la valeur en respectant le format attendu
      const dateObj = parse(newNativeValue, "yyyy-MM-dd", new Date());
      if (!isValid(dateObj)) {
        console.error("La date sélectionnée est invalide:", newNativeValue);
        updateDateValue(null);
        return;
      }
      const iso = dateObj.toISOString();
      updateDateValue(iso);
    } catch (error) {
      console.error("Erreur lors du set de nativeDate", error);
      updateDateValue(null);
    }
  },
});

watch(
  () => props.modelValue,
  (newVal) => {
    updateDateValue(newVal);
  },
);
</script>

<template>
  <DsfrInput v-model="nativeDate" :label="label" label-visible type="date" />
</template>
