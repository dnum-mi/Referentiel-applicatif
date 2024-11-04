<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { computed, ref, watch } from 'vue'
import useToaster from './composables/use-toaster' // Assurez-vous d'importer `watch`
import router from './router' // Assurez-vous que ce composable est correctement importé
import { routeNames } from './router/route-names'

const toaster = useToaster()
const authStore = useAuthStore()

const logoText = ['Ministère', 'de l’intérieur']
const serviceDescription = 'Une application pour les réunir toutes'
const isLoggedIn = computed(() => authStore.isAuthenticated)
const serviceTitle = 'Référentiel des Applications'
const homeTo = '/applications'
const operatorTo = '/applications'
const ecosystemLinks = [
  { label: 'Grist', href: 'https://grist.numerique.gouv.fr/' },
  { label: 'CCT', href: 'https://cct.sg.minint.fr/accueil/Accueil.html' },
  { label: 'Code source', href: 'http://github.com/dnum-mi/referentiel-applications' },
  { label: 'Api du referenciel', href: `${import.meta.env.VITE_RDA_API_URL}` }
]
const mandatoryLinks = [
  { label: 'Accessibilité : non conforme' },
  { label: 'Contact', href: 'https://tchap.gouv.fr/#/room/!ydoKqFOXRAQPQYFvqa:agent.interieur.tchap.gouv.fr?via=agent.interieur.tchap.gouv.fr'}
]

// const AcceptAllCookies = () => {}
// const RefuseAllCookies = () => {}
// const CustomizeCookies = () => {}

interface QuickLink {
  label: string
  to: { name: string } | string
  icon?: string
  iconAttrs?: Record<string, string>
}

const quickLinks = ref<QuickLink[]>([])

const unauthenticatedQuickLinks: QuickLink[] = [
  {
    label: 'Se connecter',
    to: { name: routeNames.SIGNIN },
    icon: 'ri-lock-line',
    iconAttrs: { title: 'Se connecter' },
  },
  {
    label: 'S’enregistrer',
    to: '/signin',
    icon: 'ri-account-circle-line',
  }
]
const authenticatedQuickLinksDefault: QuickLink[] = [
  // {
  //   label: 'Créer une application',
  //   to: { name: routeNames.CREATEAPP },
  //   icon: 'ri-add-circle-line',
  // },
  {
    label: 'Rechercher une application',
    to: { name: routeNames.SEARCHAPP },
    // icon: '',
  },
  {
    label: 'Déconnexion',
    to: { name: routeNames.LOGOUT },
    icon: 'ri-logout-box-r-line',
    iconAttrs: { title: 'Déconnexion' },
  },
]

// Correction de la fonction `watch` :
watch(
  [isLoggedIn, () => router.currentRoute.value],
  async ([loggedIn, currentRoute]) => {
    await router.isReady()

    if (loggedIn) {
      quickLinks.value = [
        ...authenticatedQuickLinksDefault,
      ]
    }
    else {
      const isCurrentRoute = ({ to }: QuickLink) => {
        if (typeof to === 'string') {
          return to !== currentRoute.path
        }
        return to.name !== currentRoute.name
      }
      quickLinks.value = unauthenticatedQuickLinks.filter(isCurrentRoute)
    }
  }
)

const searchQuery = ref('')

const { setScheme, theme } = useScheme()

function changeTheme () {
  setScheme(theme.value === 'light' ? 'dark' : 'light')
}

const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW()

function close () {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <DsfrHeader
    v-model="searchQuery"
    :service-description="serviceDescription"
    :service-title="serviceTitle"
    :logo-text="logoText"
    :quick-links="quickLinks"
    show-beta
  />

  <div class="fr-container fr-mt-3w fr-mt-md-5w fr-mb-5w">
    <router-view />
  </div>

  <DsfrFooter
    :logo-text
    :homeTo
    :ecosystemLinks
    :mandatoryLinks
    :operatorTo
  />

  <!-- <DsfrConsent>
    <p>
      Nous avons recours à plusieurs cookies afin d'améliorer votre
      expérience sur cette application. Vos données vous appartiennent
      et ce bandeau vous permet de sélectionner les cookies que vous
      souhaitez activer. Pour plus d'informations, consultez notre page
      <a href="/donnee">Données personnelles et cookies</a>.
    </p>
  </DsfrConsent> -->

  <ReloadPrompt
    :offline-ready="offlineReady"
    :need-refresh="needRefresh"
    @close="close"
    @update-service-worker="updateServiceWorker"
  />

  <AppToaster
    :messages="toaster.messages"
    @close-message="toaster.removeMessage($event)"
  />
</template>
