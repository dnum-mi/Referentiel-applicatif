import type { Application } from "@/models/Application";
import requests from "./xhr-client";
import axios from "axios";
import { authentication } from "@/services/authentication";

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

  async getApplicationById(id: string) {
    try {
      const application = await axios.get(`/applications/${id}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${authentication.token}`
        }});
      
      return application;
    } catch (error) {
      throw error;
    }
  },
};

export default Applications;
