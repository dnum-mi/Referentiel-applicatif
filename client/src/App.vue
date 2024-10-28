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

const beforeMandatoryLinks = [{ label: 'Before', to: '/before' }]
const afterMandatoryLinks = [
  { label: 'After', to: '/after' },
  {
    label: 'Paramètres d’affichage',
    button: true,
    class: 'fr-icon-theme-fill fr-link--icon-left fr-px-2v',
    to: '/settings',
    onclick: changeTheme,
  },
]
const a11yCompliance = 'partiellement conforme'
const legalLink = '/mentions-legales'
const personalDataLink = '/donnees-personnelles'
const cookiesLink = '/cookies'
const a11yComplianceLink = '/a11y-conformite'
const descText = 'Description'
const homeLink = '/'
const licenceText = undefined
const licenceTo = undefined
const licenceName = undefined
const licenceLinkProps = undefined
const ecosystemLinks = [
  {
    label: 'legifrance.gouv.fr',
    href: 'https://legifrance.gouv.fr',
  },
  {
    label: 'info.gouv.fr',
    href: 'https://info.gouv.fr',
  },
  {
    label: 'service-public.fr',
    href: 'https://service-public.fr',
  },
  {
    label: 'data.gouv.fr',
    href: 'https://data.gouv.fr',
  },
]

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
    :before-mandatory-links="beforeMandatoryLinks"
    :after-mandatory-links="afterMandatoryLinks"
    :a11y-compliance="a11yCompliance"
    :logo-text="logoText"
    :legal-link="legalLink"
    :personal-data-link="personalDataLink"
    :cookies-link="cookiesLink"
    :a11y-compliance-link="a11yComplianceLink"
    :desc-text="descText"
    :home-link="homeLink"
    :licence-text="licenceText"
    :licence-to="licenceTo"
    :licence-name="licenceName"
    :licence-link-props="licenceLinkProps"
    :ecosystem-links="ecosystemLinks"
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
