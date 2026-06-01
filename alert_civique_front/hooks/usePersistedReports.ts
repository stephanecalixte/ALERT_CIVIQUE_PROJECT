import { useCallback } from 'react';
import { JAVA_BASE_URL } from '@/lib/config';
import { AlertType, ALERT_CONFIGS } from '@/contexts/AlertContext';
import type { Message } from '@/contexts/MessagesContext';

function formatDate(createdAt: string | number[] | undefined): string {
  if (!createdAt) return '--:--';
  try {
    const d = Array.isArray(createdAt)
      ? new Date((createdAt as number[])[0], (createdAt as number[])[1] - 1, (createdAt as number[])[2])
      : new Date(createdAt as string);
    return d.toLocaleDateString('fr-FR');
  } catch { return '--:--'; }
}

/**
 * Gère la persistance des signalements d'incidents côté Java API :
 * - Chargement initial des ReportMessages et Reports persistés
 * - Sauvegarde d'un nouveau signalement
 */
export function usePersistedReports() {

  /**
   * Charge les cartes de signalement depuis le backend Java.
   * Fusionne ReportMessages (alertType non null) + Reports PENDING/IN_REVIEW sans message lié.
   */
  const loadPersistedReports = useCallback(async (): Promise<Message[]> => {
    const [msgRes, rptRes] = await Promise.allSettled([
      fetch(`${JAVA_BASE_URL}/api/reportMessages/chat`),
      fetch(`${JAVA_BASE_URL}/api/report`),
    ]);

    let msgCards: Message[] = [];
    const linkedReportIds = new Set<number>();

    if (msgRes.status === 'fulfilled' && msgRes.value.ok) {
      try {
        const data: Array<{
          reportMessageId: number;
          alertType: string;
          senderName: string;
          createdAt: string | number[];
          reportId?: number;
        }> = await msgRes.value.json();

        msgCards = data
          .filter(r => r.alertType)
          .map(r => {
            if (r.reportId) linkedReportIds.add(r.reportId);
            const at = r.alertType.toLowerCase() as AlertType;
            return {
              id:        `report_${r.reportMessageId}`,
              text:      ALERT_CONFIGS[at]?.chatLabel ?? r.alertType,
              sender:    r.senderName ?? 'Citoyen',
              senderId:  `persisted_${r.reportMessageId}`,
              timestamp: formatDate(r.createdAt),
              type:      'report' as const,
              alertType: at,
            };
          });
      } catch { /* ignore */ }
    }

    let rptCards: Message[] = [];
    const ACTIVE_STATUSES = new Set(['PENDING', 'IN_REVIEW', 'VALIDATED']);

    if (rptRes.status === 'fulfilled' && rptRes.value.ok) {
      try {
        const reports: Array<{
          reportId: number;
          alertType: string | null;
          description: string;
          status: string;
          createdAt: string | number[];
          senderName: string | null;
        }> = await rptRes.value.json();

        rptCards = reports
          .filter(r =>
            r.alertType &&
            ACTIVE_STATUSES.has(r.status?.toUpperCase()) &&
            !linkedReportIds.has(r.reportId)
          )
          .map(r => {
            const at = r.alertType!.toLowerCase() as AlertType;
            return {
              id:        `report_r_${r.reportId}`,
              text:      ALERT_CONFIGS[at]?.chatLabel ?? r.alertType!,
              sender:    r.senderName ?? 'Citoyen',
              senderId:  `report_${r.reportId}`,
              timestamp: formatDate(r.createdAt),
              type:      'report' as const,
              alertType: at,
            };
          });
      } catch { /* ignore */ }
    }

    return [...msgCards, ...rptCards];
  }, []);

  /** Persiste un nouveau signalement dans le backend Java. */
  const persistReportToBackend = useCallback(async (type: AlertType, senderName: string) => {
    try {
      await fetch(`${JAVA_BASE_URL}/api/reportMessages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertType:  type,
          senderName: senderName,
          reason:     ALERT_CONFIGS[type].chatLabel,
          createdAt:  new Date().toISOString().split('T')[0],
        }),
      });
    } catch {
      // Erreur réseau ignorée — le signalement est quand même diffusé via socket
    }
  }, []);

  return { loadPersistedReports, persistReportToBackend };
}
