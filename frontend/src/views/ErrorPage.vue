<script lang="ts" setup>
const buttons = [
  {
    label: "Page d'accueil",
    name: "/recherche-application",
  },
];
</script>

<template>
  <DsfrErrorPage
    :buttons="buttons"
    description="La page que vous recherchez n’existe pas ou l’url est erronée."
    help="Bonne chance !"
    subtitle="Erreur 404 !"
    title="Page non trouvée, ne paniquez pas"
  />
</template>
