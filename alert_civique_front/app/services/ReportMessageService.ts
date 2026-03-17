import sendData from "./SendData";
import type { ReportMessage } from '../../models/ReportMessage';

type ReportMessageCreate = Omit<ReportMessage, 'reportMessageId' | 'createdAt'>;

export type ReportMessageProps = ReportMessageCreate;

class ReportMessageService {
  async sendReportMessage(payload: ReportMessageProps) {
    try {
      const response = await sendData("/api/reportMessages", payload);
      return response;
    } catch (error) {
      console.error("Report-message error", error);
      return error;
    }
  }
}

export default new ReportMessageService();

