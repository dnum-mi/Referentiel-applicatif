<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const authStore = useAuthStore()
const username = ref<string>('')
const password = ref<string>('')
const errorMessage = ref<string>('')

async function handleLogin () {
  const success = await authStore.login(username.value, password.value)
  if (success) {
    // Rediriger l'utilisateur après un login réussi
    await router.push({ name: 'recherche-application' })
  }
}
</script>

<template>
  <div class="fr-container fr-container--fluid fr-mb-md-14v">
    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
      <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
        <div class="fr-container fr-px-md-0 fr-py-10v fr-py-md-14v">
          <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
            <div class="fr-col-12 fr-col-md-9 fr-col-lg-8">
              <div class="title-center">
                <h3>Connexion</h3>
              </div>

              <!-- Formulaire de connexion -->
              <form @submit.prevent="handleLogin">
                <DsfrFieldset aria-labelledby="login-1760-fieldset-legend login-1760-fieldset-messages">
                  <!-- Identifiant -->
                  <div class="fr-fieldset__element">
                    <DsfrFieldset
                      id="credentials"
                      aria-labelledby="credentials-messages"
                    >
                      <div class="fr-fieldset__element">
                        <span class="fr-hint-text">Sauf mention contraire, tous les champs sont obligatoires.</span>
                      </div>
                      <div class="fr-fieldset__element">
                        <div class="fr-input-group">
                          <label
                            class="fr-label"
                            for="username"
                          >Identifiant</label>
                          <DsfrInput
                            id="username"
                            v-model="username"
                            class="fr-input"
                            placeholder="identifiant"
                            aria-required="true"
                            required
                          />
                        </div>
                      </div>

                      <div class="fr-fieldset__element">
                        <div
                          id="password"
                          class="fr-password"
                        >
                          <label
                            class="fr-label"
                            for="password-input"
                          >Mot de passe</label>
                          <div class="fr-input-wrap">
                            <DsfrInput
                              id="password-input"
                              v-model="password"
                              class="fr-password__input fr-input"
                              type="password"
                              placeholder="Mot de passe"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </DsfrFieldset>
                  </div>

                  <!-- Se souvenir de moi -->
                  <div class="fr-fieldset__element">
                    <div class="fr-checkbox-group fr-checkbox-group--sm">
                      <DsfrInput
                        id="remember"
                        name="remember"
                        type="checkbox"
                      />
                      <label
                        class="fr-label"
                        for="remember"
                      >Se souvenir de moi</label>
                    </div>
                  </div>

                  <!-- Bouton Se connecter -->
                  <div class="fr-fieldset__element">
                    <ul class="fr-btns-group">
                      <li>
                        <DsfrButton class="fr-btn">
                          Se connecter
                        </DsfrButton>
                      </li>
                    </ul>
                  </div>
                </DsfrFieldset>

                <!-- Message d'erreur -->
                <p
                  v-if="errorMessage"
                  class="error-message"
                >
                  {{ errorMessage }}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-message {
  color: red;
  margin-top: 1rem;
}

.title-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
