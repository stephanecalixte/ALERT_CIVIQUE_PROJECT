import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { api, fmtDate, ALERT_LABEL, STATUS_LABEL } from '../services/api';
import type { AdminReport } from '../types';
import { Flame, Users, Video, AlertTriangle, TrendingUp, MapPin, Clock, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Regroupe les signalements dans la même zone (~1 km, 2 décimales lat/lng)
function groupByZone(reports: AdminReport[]): AdminReport[][] {
  const groups = new Map<string, AdminReport[]>();
  for (const r of reports) {
    const key =
      r.latitude != null && r.longitude != null
        ? `${r.latitude.toFixed(2)}_${r.longitude.toFixed(2)}`
        : `solo_${r.reportId}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  return Array.from(groups.values());
}

const ALERT_COLOR: Record<string, string> = {
  agression: 'var(--red)',
  accident:  'var(--orange)',
  incendie:  '#ff6030',
  sos:       'var(--purple)',
};

function IncidentCard({ group }: { group: AdminReport[] }) {
  const main    = group[0];
  const type    = (main.alertType || '').toLowerCase();
  const color   = ALERT_COLOR[type] || 'var(--primary)';
  const cluster = group.length > 1;

  return (
    <div className="panel" style={{ marginBottom: 0, '--accent': color } as React.CSSProperties}>
      <div className="panel-head">
        <span className="panel-title" style={{ color }}>
          {ALERT_LABEL[type] || main.alertType || 'Incident'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {cluster && (
            <span className="badge" style={{ background: `${color}22`, color, borderColor: `${color}55` }}>
              {group.length} incidents
            </span>
          )}
          <span className={`badge badge-${main.status}`}>
            {STATUS_LABEL[main.status] || main.status}
          </span>
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {group.slice(0, cluster ? 3 : 1).map(r => (
          <div key={r.reportId} style={{ marginBottom: cluster ? '10px' : 0 }}>
            {cluster && (
              <div className="mono" style={{ fontSize: '10px', color: 'var(--txt-lo)', marginBottom: '3px' }}>
                #{r.reportId}
              </div>
            )}
            {r.description && (
              <div className="text-hi" style={{ fontSize: '13px', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.description}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--txt-lo)', flexWrap: 'wrap', alignItems: 'center' }}>
              {r.latitude != null && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={10} />
                  {r.latitude.toFixed(4)}, {r.longitude?.toFixed(4)}
                </span>
              )}
              {r.locationText && !r.latitude && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={10} /> {r.locationText}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={10} /> {fmtDate(r.createdAt)}
              </span>
            </div>
          </div>
        ))}
        {cluster && group.length > 3 && (
          <div style={{ fontSize: '11px', color: 'var(--txt-lo)', marginTop: '8px', fontStyle: 'italic' }}>
            +{group.length - 3} autres incidents dans cette zone
          </div>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { token, toast } = useApp();
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick]       = useState(0);

  const refresh = () => { setLoading(true); setTick(t => t + 1); };

  useEffect(() => {
    if (token) {
      api.getStats(token)
        .then(setStats)
        .catch(() => toast('Failed to load stats', 'error'))
        .finally(() => setLoading(false));
    }
  }, [token, toast, tick]);

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      <div className="loading-txt">Loading tactical data...</div>
    </div>
  );

  const summaryCards = [
    { label: 'Active Reports', value: stats?.totalReports || 0, icon: Flame,         accent: 'var(--orange)'  },
    { label: 'Users',          value: stats?.totalUsers   || 0, icon: Users,         accent: 'var(--primary)' },
    { label: 'Live Streams',   value: stats?.totalStreams  || 0, icon: Video,         accent: 'var(--purple)'  },
    { label: 'SOS Alerts',     value: stats?.totalAlerts  || 0, icon: AlertTriangle, accent: 'var(--red)'     },
  ];

  const statusData = [
    { name: 'Pending',   value: stats?.pending   || 0 },
    { name: 'In Review', value: stats?.inReview   || 0 },
    { name: 'Validated', value: stats?.validated  || 0 },
    { name: 'Resolved',  value: stats?.resolved   || 0 },
  ];

  const reports: AdminReport[]       = stats?.reports || [];
  const activeReports = reports.filter(r => !r.status || r.status === 'PENDING' || r.status === 'IN_REVIEW');
  const incidentGroups: AdminReport[][] = groupByZone(activeReports);

  return (
    <div>
      {/* En-tête */}
      <div className="page-hdr">
        <div>
          <h2 className="page-title">COMMAND DASHBOARD</h2>
          <p className="page-sub">Vue d'ensemble opérationnelle</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={refresh}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--card)', border: '1px solid var(--border-hi)', color: 'var(--txt-md)', borderRadius: '8px', padding: '6px 12px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '12px' }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Rafraîchir
          </button>
          <div className="conn-badge">
            <span className="dot online" />
            ALL SYSTEMS OPERATIONAL
          </div>
        </div>
      </div>
      <div style={styles.main}>
          <div style={styles.aside}>
                {/* Compteurs */}
                <div className="stats-grid">
                  {summaryCards.map((card, idx) => (
                    <div key={idx} className="stat-card" style={{ '--accent': card.accent } as React.CSSProperties}>
                      <div className="stat-val">{card.value}</div>
                      <div className="stat-lbl">{card.label}</div>
                      <div className="stat-icon"><card.icon size={28} /></div>
                    </div>
                  ))}
                </div>

                {/* Cartes incidents */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span className="panel-title"><AlertTriangle size={14} /> Signalements actifs</span>
                    {reports.length > 0 && (
                      <span className="badge badge-PENDING">{reports.length}</span>
                    )}
                  </div>

                  {incidentGroups.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                      {incidentGroups.map((group, idx) => (
                        <IncidentCard key={idx} group={group} />
                      ))}
                    </div>
                  ) : (
                    <div className="panel">
                      <div className="empty">
                        <div className="empty-icon">✓</div>
                        Aucun signalement actif
                      </div>
                    </div>
                  )}
                </div>

                {/* Graphiques */}
                <div className="charts-grid">
                  <div className="panel">
                    <div className="panel-head">
                      <span className="panel-title"><TrendingUp size={14} /> Statuts des incidents</span>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={statusData}>
                          <XAxis dataKey="name" stroke="var(--border)" tick={{ fill: 'var(--txt-md)', fontSize: 12 }} />
                          <YAxis stroke="var(--border)" tick={{ fill: 'var(--txt-md)', fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border-hi)', color: 'var(--txt-hi)' }} />
                          <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-head">
                      <span className="panel-title"><Clock size={14} /> Activité récente</span>
                    </div>
                    <div style={{ padding: '16px' }}>
                      {reports.slice(0, 5).map((r: AdminReport) => (
                        <div key={r.reportId} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '8px 0' }}>
                          <span className="text-hi">#{r.reportId} — {STATUS_LABEL[r.status] || r.status}</span>
                          <span className="text-primary mono">{fmtDate(r.createdAt)}</span>
                        </div>
                      ))}
                      {reports.length === 0 && <div className="empty">Aucune activité récente</div>}
                    </div>
                  </div>
                </div>

          </div>
              {/* Carte géographique - placeholder */}
          <div style={styles.mapPlaceholder}>
            <span>🗺️ Map Loading...</span>
          </div>

      </div>



    </div>
  );
}

const styles = {
  main: {  
   borderRadius: 12,
    border: '2px solid white',
    display: 'flex',
    gap: 8,
    padding: 12,
    
    
  },
  aside: {
    width: '40%',
    borderRadius: 12,
    border: '1px solid white',
    padding: 12,

  },
  mapPlaceholder: {
    width: '60%',
    borderRadius: 12,
    border: '1px solid white',

  },
};