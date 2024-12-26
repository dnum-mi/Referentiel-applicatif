import type { ReportIssue } from "../models/ReportIssue";
import requests from "./xhr-client";

const reportIssue = {
  async createReportIssue(data: Promise<ReportIssue[]>) {
    try {
      const response = await requests.post<ReportIssue[]>("/anomaly-notifications", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default reportIssue;
