import type { Application } from "@/models/Application";
import requests from "./xhr-client";
import axios from "axios";

const Applications = {
  async getAllApplicationBySearch(label?: string): Promise<Application[]> {
    try {
      return await requests.get<Application[]>("/applications/search", {
        params: label ? { label } : undefined,
      });
    } catch (error) {
      throw error;
    }
  },

  async getApplicationById(id: string): Promise<Application> {
    try {
      return await axios.get(`/applications/${id}`);
    } catch (error) {
      throw error;
    }
  },

  async patchApplication(app: Application): Promise<Application> {
    try {
      const payload = {
        label: app.label,
        shortName: app.shortName,
        description: app.description,
        purposes: app.purposes,
        tags: app.tags,
        lifecycle: app.lifecycle
          ? {
              status: app.lifecycle.status,
              firstProductionDate: app.lifecycle.firstProductionDate,
              plannedDecommissioningDate: app.lifecycle.plannedDecommissioningDate,
            }
          : null,
        compliances: app.compliances
          ? app.compliances.map((compliance) => ({
              id: compliance.id,
              type: compliance.type,
              name: compliance.name,
              status: compliance.status,
              validityStart: compliance.validityStart,
              validityEnd: compliance.validityEnd,
              scoreValue: compliance.scoreValue,
              scoreUnit: compliance.scoreUnit,
              notes: compliance.notes,
            }))
          : [],
        actors: app.actors
          ? app.actors.map((actor) => ({
              id: actor.id,
              role: actor.role,
              user: actor.user
                ? {
                    id: actor.user.id,
                    email: actor.user.email,
                  }
                : null,
            }))
          : [],
      };

      const response = await axios.patch<Application>(`/applications/${app.id}`, payload);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default Applications;
