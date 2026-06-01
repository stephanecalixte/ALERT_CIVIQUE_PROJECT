import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { api, STATUS_LABEL, NEXT_STATUS, fmtDate } from '../services/api';
import { CheckCircle, XCircle, Archive, RefreshCw } from 'lucide-react';
import type { AdminReport } from '../types';

export function ReportsList() {
  const { token, toast } = useApp();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getReports(token);
      setReports(data);
    } catch {
      toast('Impossible de charger les signalements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await api.updateReport(id, newStatus, token);
      toast(`Status updated to ${STATUS_LABEL[newStatus]}`, 'success');
      load();
    } catch {
      toast('Update failed', 'error');
    }
  };

  const deleteReport = async (id: number) => {
    if (!confirm('Supprimer ce signalement ?')) return;
    try {
      await api.deleteReport(id, token);
      toast('Signalement supprimé', 'info');
      load();
    } catch {
      toast('Échec de la suppression', 'error');
    }
  };

  if (loading) return <div className="text-cyan-300">Loading reports...</div>;

  return (
    <div>
      <div className="page-hdr">
        <div>
          <h2 className="page-title">Signalements</h2>
          <p className="page-sub">Gestion des incidents déclarés</p>
        </div>
        <button onClick={load} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-cyan-800">
            <tr className="text-left text-gray-400">
              <th className="pb-2">ID</th><th>Location</th><th>Status</th><th>Reported</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.reportId} className="border-b border-gray-800/50 hover:bg-white/5">
                <td className="py-3 font-mono">#{r.reportId}</td>
                <td>{r.locationText || '—'}</td>
                <td><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  r.status === 'PENDING' ? 'bg-red-900/50 text-red-300' :
                  r.status === 'RESOLVED' ? 'bg-green-900/50 text-green-300' :
                  'bg-cyan-900/50 text-cyan-300'
                }`}>{STATUS_LABEL[r.status]}</span></td>
                <td>{fmtDate(r.createdAt)}</td>
                <td className="flex gap-2">
                  {NEXT_STATUS[r.status]?.map(s => (
                    <button key={s} onClick={() => updateStatus(r.reportId, s)} className="p-1 rounded bg-gray-800 hover:bg-cyan-700">
                      {s === 'VALIDATED' && <CheckCircle size={14}/>}
                      {s === 'REJECTED' && <XCircle size={14}/>}
                      {s === 'ARCHIVED' && <Archive size={14}/>}
                      {!['VALIDATED','REJECTED','ARCHIVED'].includes(s) && <RefreshCw size={14}/>}
                    </button>
                  ))}
                  <button onClick={() => deleteReport(r.reportId)} className="p-1 rounded bg-red-900/50 hover:bg-red-800"><XCircle size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}