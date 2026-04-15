import { AppProvider } from './contexts/AppContext'
import { useApp } from './contexts/AppContext'
import { Layout } from './components/Layout'
import { LoginPage } from './components/LoginPage'
import { Dashboard } from './components/DashBoard'
import { ReportsList } from './components/ReportsList'
import { AlertsList } from './components/AlertsList'
import { StreamsList } from './components/StreamsList'
import { EmergenciesList } from './components/EmergenciesList'
import { UsersList } from './components/UsersList'
import Starfield from './components/Starfield'

function AppContent() {
  const { section, token, toasts } = useApp()

  // Si pas authentifié → page de login
  if (!token) {
    return (
      <>
        <Starfield />
        <LoginPage />
      </>
    )
  }

  const renderSection = () => {
    switch (section) {
      case 'dashboard':   return <Dashboard />
      case 'reports':     return <ReportsList />
      case 'alerts':      return <AlertsList />
      case 'streams':     return <StreamsList />
      case 'emergencies': return <EmergenciesList />
      case 'users':       return <UsersList />
      default:            return <Dashboard />
    }
  }

  return (
    <div className="relative">
      <Starfield />
      <Layout>
        {renderSection()}
      </Layout>

      {/* Notifications toast */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`
              border px-4 py-2 rounded text-sm font-mono tracking-wide shadow-lg
              ${t.type === 'success' ? 'bg-green-950/90 border-green-700 text-green-300' : ''}
              ${t.type === 'error'   ? 'bg-red-950/90   border-red-700   text-red-300'   : ''}
              ${t.type === 'info'    ? 'bg-black/90      border-cyan-700  text-cyan-300'  : ''}
            `}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
