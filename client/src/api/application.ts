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
};

export default Applications;
