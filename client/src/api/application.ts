import type { Application } from '@/models/Application'
import requests from './xhr-client'

const Applications = {
  getAllApplicationBySearch: async (label: string): Promise<Application[]> => {
    try {
      // Utilisation du xhr-client pour faire la requête GET avec paramètres
      const applications = await requests.get<Application[]>('/applications/search', { label })

      return applications // Retourne les données des applications
    }
    catch (error) {
      console.error('Erreur lors de la récupération des applications:', error)
      throw error // Gestion de l'erreur
    }
  },

  getApplicationById: async (id: string): Promise<Application[]> => {
    try {
      const application = await requests.get<Application[]>(`/applications/${id}`)
      console.log(application)
      return application
    }
    catch (error) {
      console.error('erreur lors de la récupération de l\'application', error)
      throw error
    }
  }
}

export default Applications
