import type { ReportIssue } from "../models/ReportIssue";
import requests from "./xhr-client";
import axios from "axios";

const reportIssue = {
  async createReportIssue(data: Promise<ReportIssue[]>) {
    try {
      const response = await requests.post<ReportIssue[]>("/anomaly-notifications", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  async getReportIssue() {
    try {
      const response = await requests.get<ReportIssue[]>("/anomaly-notifications");
      return response;
    } catch (error) {
      throw error;
    }
  },/*
  async getAllIssueByNotifierId(notifierId?: string): Promise<ReportIssue[]> {
    try {
      return await axios.get(`/anomaly-notification/${notifierId}`);
    } catch (error) {
      throw error;
    }
  },*/
  async getReportIssueByNotifierId(): Promise<ReportIssue[]> {
    try {
      return await requests.get<ReportIssue[]>("/anomaly-notifications/user-notifications");
    } catch (error) {
      throw error;
    }
  },
  async deleteReportIssue(id: string) {
    try {
      const response = await requests.del(`/anomaly-notifications/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default reportIssue;
