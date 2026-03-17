import sendData from "./SendData";
import type { Report } from '../../models/Report';

type ReportCreate = Omit<Report, 'reportId' | 'createdAt' | 'status' | 'mediaCount' | 'aiConfidenceScore'>;

export type ReportServiceProps = ReportCreate;

class ReportService {
  async sendReport(payload: ReportServiceProps) {
    try {
      const response = await sendData("/api/report", payload);
      return response;
    } catch (error) {
      console.error("Report error", error);
      return error;
    }
  }
}

export default new ReportService();

