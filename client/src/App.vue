<script setup lang="ts">
import { useRegisterSW } from "virtual:pwa-register/vue";
import { ref } from "vue";
import useToaster from "./composables/use-toaster";
import { routeNames } from "./router/route-names";
import { authentication } from "./services/authentication";

const authenticated = ref(false);
authentication.init({ onLoad: "check-sso" }).then((answer) => (authenticated.value = answer));

const toaster = useToaster();

const logoText = ["Ministère", "de l’intérieur"];
const serviceDescription = "Une application pour les réunir toutes";
const serviceTitle = "Référentiel des Applications";
const homeTo = "/applications";
const operatorTo = "/applications";
const ecosystemLinks = [
  { label: "CCT", href: "https://cct.sg.minint.fr/accueil/Accueil.html" },
  { label: "Code source", href: "http://github.com/dnum-mi/referentiel-applications" },
  { label: "Api du référentiel", href: `${import.meta.env.VITE_RDA_API_URL}` },
];
const mandatoryLinks = [
  { label: "Accessibilité : non conforme" },
  {
    label: "Contact",
    href: "https://www.tchap.gouv.fr/#/room/!ydoKqFOXRAQPQYFvqa:agent.interieur.tchap.gouv.fr?via=agent.interieur.tchap.gouv.fr",
  },
];

interface QuickLink {
  label: string;
  to: { name: string } | string;
  icon?: string;
  iconAttrs?: Record<string, string>;
}

const unauthenticatedQuickLinks = ref([]);

authentication.createLoginUrl({ redirectUri: window.location.href }).then((loginUrlLink) => {
  unauthenticatedQuickLinks.value = [
    {
      label: "Se connecter",
      to: loginUrlLink,
      icon: "ri-lock-line",
      iconAttrs: { title: "Se connecter" },
    },
  ];
});

const authenticatedQuickLinks: QuickLink[] = [
  {
    label: "Rechercher une application",
    to: { name: routeNames.SEARCHAPP },
  },
  {
    label: "Déconnexion",
    to: authentication.createLogoutUrl(),
    icon: "ri-logout-box-r-line",
    iconAttrs: { title: "Déconnexion" },
  },
];

const searchQuery = ref("");

const { setScheme, theme } = useScheme();

function changeTheme() {
  setScheme(theme.value === "light" ? "dark" : "light");
}

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();

function close() {
  offlineReady.value = false;
  needRefresh.value = false;
}
</script>

<template>
  <DsfrHeader
    v-model="searchQuery"
    :service-description="serviceDescription"
    :service-title="serviceTitle"
    :logo-text="logoText"
    :quick-links="authenticated ? authenticatedQuickLinks : unauthenticatedQuickLinks"
    show-beta
  />

  <div class="fr-container fr-mt-3w fr-mt-md-5w fr-mb-5w">
    <router-view />
  </div>

  <DsfrFooter :logo-text :home-to :ecosystem-links :mandatory-links :operator-to />

  <!-- <DsfrConsent>
    <p>
      Nous avons recours à plusieurs cookies afin d'améliorer votre
      expérience sur cette application. Vos données vous appartiennent
      et ce bandeau vous permet de sélectionner les cookies que vous
      souhaitez activer. Pour plus d'informations, consultez notre page
      <a href="/donnee">Données personnelles et cookies</a>.
    </p>
  </DsfrConsent> -->

  <ReloadPrompt :offline-ready="offlineReady" :need-refresh="needRefresh" @close="close" @update-service-worker="updateServiceWorker" />

  <AppToaster :messages="toaster.messages" @close-message="toaster.removeMessage($event)" />
</template>
