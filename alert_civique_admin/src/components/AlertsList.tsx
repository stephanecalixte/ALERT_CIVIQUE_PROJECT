import { useEffect, useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { api, ALERT_LABEL, fmtDate } from '../services/api'
import { Trash2, AlertOctagon, RefreshCw } from 'lucide-react'
import type { AdminAlert } from '../types'

const ALERT_EMOJI: Record<string, string> = {
  agression: '🚨', accident: '🚗', incendie: '🔥', sos: '🆘',
}

export function AlertsList() {
  const { token, toast } = useApp()
  const [alerts,  setAlerts]  = useState<AdminAlert[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!token) return
    setLoading(true)
    try { setAlerts(await api.getAlerts(token)) }
    catch { toast('Impossible de charger les alertes', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [token])

  const del = async (id: number) => {
    if (!confirm('Supprimer cette alerte ?')) return
    try { await api.deleteAlert(id, token); toast('Alerte supprimée', 'info'); load() }
    catch { toast('Échec de la suppression', 'error') }
  }

  return (
    <div>
      <div className="page-hdr">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertOctagon size={20} style={{ color: 'var(--red)' }} />
            Alertes SOS
          </h1>
          <p className="page-sub">Signalements d'urgence reçus par les citoyens</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={load}
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <RefreshCw size={12} /> Actualiser
        </button>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">
            <AlertOctagon size={14} style={{ color: 'var(--red)' }} />
            Alertes reçues
            {alerts.length > 0 && <span className="nav-badge">{alerts.length}</span>}
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /><p className="loading-txt">Chargement...</p></div>
        ) : alerts.length === 0 ? (
          <div className="empty"><div className="empty-icon">🚨</div><p>Aucune alerte SOS</p></div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th><th>Raison</th><th>Expéditeur</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(a => {
                  const type  = a.alertType?.toLowerCase() ?? ''
                  const emoji = ALERT_EMOJI[type] ?? '🚨'
                  return (
                    <tr key={a.reportMessageId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{emoji}</span>
                          <span className={`badge badge-${type}`}>
                            {ALERT_LABEL[type] || a.alertType}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--txt-md)' }}>{a.reason || '—'}</td>
                      <td className="mono" style={{ color: 'var(--txt-md)' }}>{a.senderName || '—'}</td>
                      <td className="mono text-primary">{fmtDate(a.createdAt)}</td>
                      <td>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => del(a.reportMessageId)}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
