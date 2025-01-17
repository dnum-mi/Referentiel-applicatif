import { createRouter, createWebHistory } from "vue-router";
import { routeNames } from "./route-names";

const routes = [
  {
    name: routeNames.SEARCHAPP,
    path: "/recherche-application",
    component: () => import("@/views/GlobalSearch.vue"),
  },
  {
    path: "/",
    name: "accueil",
    component: () => import("@/views/AppHome.vue"),
  },
  {
    path: "/accessibilite",
    name: "accessibilite",
    component: () => import("@/views/Accessibility.vue"),
  },
  {
    name: routeNames.ISSUELIST,
    path: "/issue-list",
    component: () => import("@/views/IssuePage.vue"),
  },
  {
    name: routeNames.CREATEAPP,
    path: "/create-application",
    component: () => import("@/views/CreateApplication.vue"),
    props: true,
  },
  {
    name: routeNames.PROFILEAPP,
    path: "/applications/:id",
    component: () => import("@/views/ApplicationProfile.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env?.BASE_URL || ""),
  routes,
});

export default router;
