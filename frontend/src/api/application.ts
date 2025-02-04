import type { Application } from "@/models/Application";
import requests from "./xhr-client";
import axios from "axios";

const Applications = {
  async getAllApplicationBySearch(searchParams?: string): Promise<Application[]> {
    let label = searchParams;
    let tag = [];
    let regex = /tag:([A-Za-z0-9]+)/gi;
    let match = null;

    while ((match = regex.exec(searchParams)) != null) {
      tag.push(match[1]);
      label = label.replace(match[0], "").trim();
    }

    return await requests.get<Application[]>("/applications/search", {
      params: {
        label: label ? label : undefined,
        tag: tag.length > 0 ? tag : [],
      },
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
      externalRessource: app.externalRessource
        ? app.externalRessource.map((externalRessource) => ({
            id: externalRessource.id,
            link: externalRessource.link,
            description: externalRessource.description,
            type: externalRessource.type,
          }))
        : [],
    };

    const response = await axios.patch<Application>(`/applications/${app.id}`, payload);

    return response.data;
  },
};

export default Applications;
