import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { api, STATUS_LABEL, NEXT_STATUS, fmtDate } from '../services/api';
import { CheckCircle, XCircle, Archive, RefreshCw } from 'lucide-react';

export function ReportsList() {
  const { token, toast } = useApp();   // ← OK
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    try {
      const data = await api.getReports(token);
      setReports(data);
    } catch (err) {
      toast('Failed to load reports', 'error');
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
    if (confirm('Delete this report?')) {
      await api.deleteReport(id, token);
      toast('Report deleted', 'info');
      load();
    }
  };

  if (loading) return <div className="text-cyan-300">Loading reports...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-white">🔥 Fire Reports</h2>
        <button onClick={load} className="p-2 rounded bg-cyan-900/50 hover:bg-cyan-800"><RefreshCw size={18} /></button>
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