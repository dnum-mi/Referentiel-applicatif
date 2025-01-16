<script setup lang="ts">
import { ref } from "vue";
import type { Application } from "@/models/Application";
import useToaster from "@/composables/use-toaster";
import Applications from "@/api/application";

const props = defineProps<{ application: Application }>();
const loading = ref(false);
const toaster = useToaster();

async function patchActors() {
  loading.value = true;
  try {
    await Applications.patchApplication(props.application);
    toaster.addSuccessMessage("Acteurs mis à jour avec succès !");
  } catch (error) {
    toaster.addErrorMessage("Erreur lors de la mise à jour des acteurs");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="actor-section">
    <h2 class="actor-section-title">Acteurs de l’application</h2>

    <div v-if="props.application.actors && props.application.actors.length" class="actor-cards-container">
      <div v-for="(actor, index) in props.application.actors" :key="actor.id" class="actor-card">
        <header class="actor-card-header">
          <h3>Acteur #{{ index + 1 }}</h3>
          <p class="actor-card-subtitle">
            {{ actor.user && actor.user.email ? actor.user.email : "Email non défini" }}
          </p>
        </header>
        <div class="actor-card-body">
          <DsfrInput v-model="actor.role" label="Rôle" label-visible />
          <DsfrInput v-model="actor.user.email" label="Email de l'utilisateur" label-visible />
        </div>
      </div>
    </div>
    <div v-else class="no-actor">
      <p>Aucun acteur n'est disponible pour cette application.</p>
    </div>

    <div class="actor-actions">
      <DsfrButton label="Sauvegarder acteurs" :disabled="loading" @click="patchActors" />
    </div>
  </div>
</template>

<style scoped>
.actor-section {
  padding: 1.5rem;
  background-color: #f3f7fb;
  border-radius: 8px;
}

.actor-section-title {
  text-align: center;
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.actor-cards-container {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  margin-bottom: 1.5rem;
}

.actor-card {
  background: #fff;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  padding: 1rem;
}

.actor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
}

.actor-card-header {
  border-bottom: 1px solid #e0e6ed;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  text-align: center;
}

.actor-card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #0072ce;
}

.actor-card-subtitle {
  margin: 0;
  color: #555;
  font-size: 0.9rem;
}

.actor-card-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actor-actions {
  text-align: center;
  margin-top: 1rem;
}

.no-actor {
  text-align: center;
  font-style: italic;
  color: #888;
}
</style>
