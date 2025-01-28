import type { Application } from "@/models/Application";
import requests from "./xhr-client";
import axios from "axios";

const Applications = {
  async getAllApplicationBySearch(label?: string): Promise<Application[]> {
    return await requests.get<Application[]>("/applications/search", {
      params: label ? { label } : undefined,
    });
  },

  async getApplicationById(id: string): Promise<Application> {
    return await axios.get(`/applications/${id}`);
  },

  async patchApplication(app: Application): Promise<Application> {
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
                  keycloakId: actor.user.keycloakId,
                  email: actor.user.email,
                }
              : null,
          }))
        : [],
    };

    const response = await axios.patch<Application>(`/applications/${app.id}`, payload);

    return response.data;
  },
};

export default Applications;
