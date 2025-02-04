import type { ReportIssue } from "../models/ReportIssue";
import requests from "./xhr-client";

const reportIssue = {
  async createReportIssue(data: Promise<ReportIssue[]>) {
    return await requests.post<ReportIssue[]>("/anomaly-notifications", data);
  },
  async getReportIssue() {
    return await requests.get<ReportIssue[]>("/anomaly-notifications");
  },

  // Dans le fichier reportIssue.ts
  async getNotificationsByApplicationId(applicationId: string) {
    try {
      console.log("Requesting notifications for applicationId:", applicationId);
      const response = await requests.get<ReportIssue[]>(`/anomaly-notifications/${applicationId}`);
      console.log(response);
      return response;
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications :", error.response || error);
      throw error;
    }
  },

  async getReportIssueByNotifierId(): Promise<ReportIssue[]> {
    return await requests.get<ReportIssue[]>("/anomaly-notifications/user-notifications");
  },
  async updateStatus(id: string, status: string) {
    try {
      console.log(status);
      const response = await requests.put(`/anomaly-notifications/update/${id}`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },
  async deleteReportIssue(id: string) {
    return await requests.del(`/anomaly-notifications/${id}`);
  },
};

export default reportIssue;
