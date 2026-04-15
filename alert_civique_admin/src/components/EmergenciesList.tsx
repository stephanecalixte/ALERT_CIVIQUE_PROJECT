import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';   // ← Import correct
import { api, fmtDate } from '../services/api';
import { MapPin, AlertTriangle, Trash2, RefreshCw, Mail } from 'lucide-react';
import type { AdminEmergency } from '../types';

export function EmergenciesList() {
  const { token, toast } = useApp();   // ← OK
  const [emergencies, setEmergencies] = useState<AdminEmergency[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getEmergencies(token);
      setEmergencies(data);
    } catch (err) {
      toast('Failed to load emergencies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const deleteEmergency = async (id: number) => {
    if (confirm('Resolve this emergency?')) {
      try {
        await api.deleteEmergency(id, token);
        toast('Emergency resolved', 'success');
        load();
      } catch {
        toast('Delete failed', 'error');
      }
    }
  };

  if (loading) return <div className="text-cyan-300">Loading emergencies...</div>;

  const getId = (e: AdminEmergency) => e.emergencyAlertId ?? 0;
  const getMessage = (e: AdminEmergency) => {
    if (e.messages && e.messages.length > 0) {
      const m = e.messages[0];
      return m.content ?? m.text ?? m.body ?? 'No description';
    }
    return 'No description';
  };
  const getDate = (e: AdminEmergency) => e.sentAt ?? null;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MapPin size={24} /> Field Emergencies
        </h2>
        <button onClick={load} className="p-2 rounded bg-cyan-900/50 hover:bg-cyan-800">
          <RefreshCw size={18} />
        </button>
      </div>

      {emergencies.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border border-dashed border-cyan-800 rounded">
          No active emergencies.
        </div>
      ) : (
        <div className="space-y-3">
          {emergencies.map((e) => (
            <div key={getId(e)} className="bg-black/40 border-l-4 border-red-600 rounded-lg p-4 flex justify-between items-start hover:bg-white/5 transition">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <AlertTriangle size={20} className="text-red-400" />
                  <span className="font-bold text-white">Emergency</span>
                  {e.email && (
                    <span className="text-xs flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded">
                      <Mail size={12} /> {e.email}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mt-2">{getMessage(e)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Reported: {fmtDate(getDate(e))}
                </p>
              </div>
              <button onClick={() => deleteEmergency(getId(e))} className="p-2 rounded bg-red-900/50 hover:bg-red-800 transition">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}