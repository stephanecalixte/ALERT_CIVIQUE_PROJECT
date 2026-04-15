import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { Flame, Users, Video, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { token, toast } = useApp();   // ← Plus d'erreur
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getStats(token)
        .then(setStats)
        .catch(() => toast('Failed to load stats', 'error'))
        .finally(() => setLoading(false));
    }
  }, [token, toast]);

  if (loading) return <div className="text-cyan-300">Loading tactical data...</div>;

  const cards = [
    { label: 'Active Reports', value: stats?.totalReports || 0, icon: Flame, color: 'orange' },
    { label: 'Users', value: stats?.totalUsers || 0, icon: Users, color: 'blue' },
    { label: 'Live Streams', value: stats?.totalStreams || 0, icon: Video, color: 'purple' },
    { label: 'SOS Alerts', value: stats?.totalAlerts || 0, icon: AlertTriangle, color: 'red' },
  ];

  const statusData = [
    { name: 'Pending', value: stats?.pending || 0 },
    { name: 'In Review', value: stats?.inReview || 0 },
    { name: 'Validated', value: stats?.validated || 0 },
    { name: 'Resolved', value: stats?.resolved || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white tracking-wider">COMMAND DASHBOARD</h2>
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          ALL SYSTEMS OPERATIONAL
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-black/50 border border-cyan-900/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
              </div>
              <card.icon className={`text-${card.color}-400`} size={32} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-black/50 border border-cyan-900/50 rounded-xl p-4">
          <h3 className="text-cyan-300 font-semibold mb-4 flex items-center gap-2"><TrendingUp size={16} /> Incident status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" stroke="#4a5568" />
              <YAxis stroke="#4a5568" />
              <Tooltip contentStyle={{ backgroundColor: '#0a0f1a', borderColor: '#1e3a5f' }} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-black/50 border border-cyan-900/50 rounded-xl p-4">
          <h3 className="text-cyan-300 font-semibold mb-4 flex items-center gap-2"><Clock size={16} /> Recent activity</h3>
          <div className="space-y-3">
            {stats?.reports?.slice(0, 5).map((r: any) => (
              <div key={r.reportId} className="flex justify-between text-sm border-b border-gray-800 pb-2">
                <span className="text-gray-300">#{r.reportId} - {r.status}</span>
                <span className="text-cyan-500">{fmtDateShort(r.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function fmtDateShort(v: any) {
  if (!v) return '—';
  const d = new Date(v);
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`;
}