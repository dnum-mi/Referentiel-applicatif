import type { Application } from "@/models/Application";
import requests from "./xhr-client";

const Applications = {
  async getAllApplicationBySearch(label: string): Promise<Application[]> {
    try {
      return await requests.get<Application[]>("/applications/search", { params: { label } });
    } catch (error) {
      console.error("Erreur lors de la recherche d'applications :", error);
      throw error;
    }
  },

  // Récupérer toutes les applications
  async getAllApplications(): Promise<Application[]> {
    try {
      return await requests.get<Application[]>("/applications");
    } catch (error) {
      console.error("Erreur lors de la récupération de toutes les applications :", error);
      throw error;
    }
  },
};

export default Applications;
