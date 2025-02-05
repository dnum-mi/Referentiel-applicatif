<script setup lang="ts">
import { ref, computed } from "vue";
import Applications from "@/api/application";
import type { Application, Actor } from "@/models/Application";
import useToaster from "@/composables/use-toaster";

const toaster = useToaster();

const props = defineProps({
  application: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:application"]);
const loading = ref(false);
const editingActor = ref<Actor | null>(null);
const isModalOpen = ref(false);
const isNewActor = ref(false);
const actorToDelete = ref<Actor | null>(null);
const isDeleteModalOpen = ref(false);

const actorTypeMapping: Record<string, string> = {
  Responsable: "Responsable",
  Exploitation: "Exploitation",
  ResponsableAutre: "Autre responsable",
  Hebergement: "Hébergement",
  ArchitecteApplicatif: "Architecte Applicatif",
  ArchitecteInfra: "Architecte Infra",
  RepresentantSSI: "Représentant SSI",
  Autre: "Autre",
};

const actorTypeOptions = computed(() => {
  return Object.entries(actorTypeMapping).map(([key, label]) => ({
    value: key,
    text: label,
  }));
});

const actors = computed(() => {
  return Array.isArray(props.application.actors) ? props.application.actors : [];
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// const openModal = (actor: Actor | null = null, isNew = false) => {
//   editingActor.value = actor ? { ...actor } : { email: "", actorType: "", applicationId: props.application.id };
//   isNewActor.value = isNew;
//   isModalOpen.value = true;
// };

// const closeModal = () => {
//   isModalOpen.value = false;
//   editingActor.value = null;
//   isNewActor.value = false;
// };

// async function saveActor() {
//   if (!editingActor.value || !isValidEmail(editingActor.value.email)) {
//     toaster.addErrorMessage("Veuillez entrer une adresse email valide");
//     return;
//   }

//   loading.value = true;
//   try {
//     const updatedActors = isNewActor.value
//       ? [...actors.value, editingActor.value]
//       : actors.value.map(a => a.id === editingActor.value?.id ? editingActor.value : a);

//     const updatedApplication = await Applications.patchApplication({
//       ...props.application,
//       actors: updatedActors,
//     });

//     emit('update:application', updatedApplication);
//     toaster.addSuccessMessage(isNewActor.value ? "Acteur ajouté avec succès !" : "Acteur modifié avec succès !");
//     closeModal();
//   } catch (error) {
//     console.error("Erreur API:", error);
//     toaster.addErrorMessage("Erreur lors de l'enregistrement de l'acteur.");
//   } finally {
//     loading.value = false;
//   }
// }

// const openDeleteModal = (actor: Actor) => {
//   actorToDelete.value = actor;
//   isDeleteModalOpen.value = true;
// };

// const closeDeleteModal = () => {
//   isDeleteModalOpen.value = false;
//   actorToDelete.value = null;
// };

// async function confirmDelete() {
//   if (!actorToDelete.value) return;

//   loading.value = true;
//   try {
//     const updatedActors = actors.value.filter(a => a.id !== actorToDelete.value?.id);
//     const updatedApplication = await Applications.patchApplication({
//       ...props.application,
//       actors: updatedActors,
//     });
//     emit('update:application', updatedApplication);
//     toaster.addSuccessMessage("Acteur supprimé avec succès !");
//     closeDeleteModal();
//   } catch (error) {
//     toaster.addErrorMessage("Erreur lors de la suppression de l'acteur.");
//     console.error("Erreur:", error);
//   } finally {
//     loading.value = false;
//   }
// }
</script>

<template>
  <div>
    <div class="header">
      <h2>Gestion des acteurs</h2>
      <!-- <DsfrButton secondary @click="openModal(null, true)">Ajouter un acteur</DsfrButton> -->
    </div>

    <div class="actors-table">
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Type d'acteur</th>
            <!-- <th>Actions</th> -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="actor in actors" :key="actor.email">
            <td>{{ actor.email }}</td>
            <td>{{ actorTypeMapping[actor.actorType] || actor.actorType }}</td>
            <!-- <td>
              <div class="action-buttons">
                <DsfrButton 
                  icon="ri-pencil-fill"
                  secondary
                  size="small"
                  @click="openModal(actor)"
                >
                  Modifier
                </DsfrButton>
                <DsfrButton
                  icon="ri-delete-bin-line"
                  tertiary
                  size="small"
                  @click="openDeleteModal(actor)"
                >
                  Supprimer
                </DsfrButton>
              </div>
            </td> -->
          </tr>
        </tbody>
      </table>
    </div>

    <!-- <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2>{{ isNewActor ? "Ajouter un acteur" : "Modifier un acteur" }}</h2>
        <div v-if="editingActor">
          <div class="form-group">
            <label>Email</label>
            <DsfrInput type="email" v-model="editingActor.email" :disabled="!isNewActor" />
          </div>
          <DsfrSelect
            v-model="editingActor.actorType"
            label="Type d'acteur"
            required
            :options="actorTypeOptions"
          />
        </div>
        <div class="modal-footer">
          <DsfrButton @click="closeModal" :disabled="loading">Annuler</DsfrButton>
          <DsfrButton @click="saveActor" :disabled="loading || !editingActor?.email" primary>
            {{ loading ? "Enregistrement..." : "Enregistrer" }}
          </DsfrButton>
        </div>
      </div>
    </div>

    <div v-if="isDeleteModalOpen" class="modal">
      <div class="modal-content">
        <h2>Supprimer l'acteur</h2>
        <p>
          Êtes-vous sûr de vouloir supprimer l'acteur <strong>{{ actorToDelete?.email }}</strong> ?
        </p>
        <div class="modal-footer">
          <DsfrButton @click="closeDeleteModal" :disabled="loading">Annuler</DsfrButton>
          <DsfrButton @click="confirmDelete" :disabled="loading" tertiary>
            {{ loading ? "Suppression..." : "Supprimer" }}
          </DsfrButton>
        </div>
      </div>
    </div> -->
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.actors-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background-color: #f8fafc;
  font-weight: 600;
}

tr:hover {
  background-color: #f8fafc;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
  align-items: center;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.modal-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
