import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { api, ALERT_LABEL, fmtDate } from '../services/api';
import { Trash2, AlertOctagon, RefreshCw } from 'lucide-react';
import type { AdminAlert } from '../types';

export function AlertsList() {
  const { token, toast } = useApp();
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getAlerts(token);
      setAlerts(data);
    } catch {
      toast('Failed to load alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const del = async (id: number) => {
    if (confirm('Delete this alert?')) {
      try {
        await api.deleteAlert(id, token);
        toast('Alert deleted', 'info');
        load();
      } catch {
        toast('Delete failed', 'error');
      }
    }
  };

  if (loading) return <div className="text-cyan-300">Loading alerts...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex gap-2"><AlertOctagon /> SOS Alerts</h2>
        <button onClick={load} className="p-2 rounded bg-cyan-900/50 hover:bg-cyan-800">
          <RefreshCw size={18} />
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border border-dashed border-cyan-800 rounded">
          No alerts found.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(a => (
            <div key={a.reportMessageId} className="bg-black/40 border-l-4 border-red-600 p-4 rounded flex justify-between items-center hover:bg-white/5 transition">
              <div>
                <p className="font-bold">{ALERT_LABEL[a.alertType] || a.alertType}</p>
                <p className="text-sm text-gray-300">{a.reason || '—'}</p>
                <p className="text-xs text-gray-500">{a.senderName && `De : ${a.senderName} · `}{fmtDate(a.createdAt)}</p>
              </div>
              <button onClick={() => del(a.reportMessageId)} className="p-2 rounded bg-red-900/30 hover:bg-red-800">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
