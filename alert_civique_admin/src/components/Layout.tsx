import { ReactNode } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  LayoutDashboard, Flame, AlertTriangle, Video, Users, LogOut,
  Activity, MapPin, Bell
} from 'lucide-react';

interface LayoutProps { children: ReactNode }

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reports', label: 'Signalements', icon: Flame },
  { id: 'alerts', label: 'Alertes SOS', icon: AlertTriangle },
  { id: 'streams', label: 'Live Streams', icon: Video },
  { id: 'emergencies', label: 'Urgences terrain', icon: MapPin },
  { id: 'users', label: 'Utilisateurs', icon: Users },
];

export function Layout({ children }: LayoutProps) {
  const { section, navigate, logout, currentUser } = useApp();

  return (
    <div className="relative min-h-screen bg-black/40 font-mono">
      {/* Barre latérale fixe */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-black/70 backdrop-blur-md border-r border-cyan-900/60 shadow-2xl z-20">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-cyan-800/50">
            <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              FIRECONTROL
            </h1>
            <p className="text-xs text-cyan-500/70 mt-1">Incident Management System</p>
          </div>

          <nav className="flex-1 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id as any)}
                  className={`
                    w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-200
                    ${isActive
                      ? 'bg-cyan-900/40 border-l-4 border-cyan-400 text-cyan-200'
                      : 'text-gray-400 hover:bg-white/5 hover:text-cyan-300'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                  {isActive && <Activity size={14} className="ml-auto text-cyan-400 animate-pulse" />}
                </button>
              );
            })}
          </nav>

          <div className="p-6 border-t border-cyan-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-cyan-800/50 flex items-center justify-center">
                <Bell size={16} className="text-cyan-400" />
              </div>
              <div className="flex-1 text-xs">
                <p className="text-gray-400">{currentUser ? `${currentUser.firstname} ${currentUser.lastname}` : 'Officer'}</p>
                <p className="text-cyan-500">Role: Admin</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded border border-red-800/50 text-red-400 hover:bg-red-950/30 transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="ml-72 p-6 relative z-10 min-h-screen">
        <div className="backdrop-blur-sm bg-black/30 rounded-2xl border border-white/10 p-6 shadow-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
