import { ReactNode } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  LayoutDashboard, Flame, AlertTriangle, Video, Users, LogOut,
  Activity, MapPin, Bell, MessageSquare
} from 'lucide-react';

interface LayoutProps { children: ReactNode }

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reports', label: 'Signalements', icon: Flame },
  { id: 'alerts', label: 'Alertes SOS', icon: AlertTriangle },
  { id: 'streams', label: 'Live Streams', icon: Video },
  { id: 'emergencies', label: 'Urgences terrain', icon: MapPin },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'chat', label: 'Chat en direct', icon: MessageSquare },
];

export function Layout({ children }: LayoutProps) {
  const { section, navigate, logout, currentUser } = useApp();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 2 }}>
      {/* Barre latérale fixe */}
      <aside className="sidebar" style={{ width: 220, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="hdr-logo" style={{ fontSize: 16, letterSpacing: 2 }}>ALERT CIVIQUE</div>
            <p style={{ fontSize: 10, fontFamily: 'Share Tech Mono', color: 'var(--txt-lo)', letterSpacing: 1, marginTop: 4 }}>
              Incident Management System
            </p>
          </div>

          <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id as any)}
                  className={`nav-item${isActive ? ' active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {isActive && <Activity size={12} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
                </button>
              );
            })}
          </nav>

          <div className="side-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={14} style={{ color: 'var(--primary)' }} />
              </div>
              <div style={{ fontSize: 11 }}>
                <div style={{ color: 'var(--txt-md)' }}>{currentUser ? `${currentUser.firstname} ${currentUser.lastname}` : 'Officer'}</div>
                <div style={{ color: 'var(--primary)', fontSize: 10 }}>Role: Admin</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="btn btn-danger"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Zone scrollable */}
        <div className="main page" style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>

        {/* Footer */}
        <footer style={{
          flexShrink: 0,
          padding: '10px 24px',
          borderTop: '1px solid var(--border)',
          background: 'rgba(3,9,18,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: 11,
          color: 'var(--txt-lo)',
          letterSpacing: 1,
        }}>
          <span style={{ textTransform: 'uppercase' }}>
            Alert Civique &copy; {new Date().getFullYear()} — Command Center v1.0
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', display: 'inline-block' }} />
            Tous systèmes opérationnels
          </span>
        </footer>
      </div>
    </div>
  );
}
