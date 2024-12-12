import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Remplacez par l'URL de votre application
    setupNodeEvents(on, config) {
      // Implémentez ici les écouteurs d'événements Node
      // Exemple : utiliser un plugin
      // require('cypress-plugin-snapshots/plugin')(on, config);
      return config;
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
  },

  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx,vue}",
    supportFile: "cypress/support/component.ts",
  },

  // Autres configurations globales si nécessaire
  retries: {
    runMode: 2,
    openMode: 0,
  },
});