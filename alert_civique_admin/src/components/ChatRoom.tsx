import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useApp } from '../contexts/AppContext'
import { Send, Users, Wifi, WifiOff, AlertTriangle, Shield, Radio, Trash2, MapPin } from 'lucide-react'

const SOCKET_URL = 'http://localhost:9091'
const ROOM       = 'global'

/* ── Types ───────────────────────────────────────────────────────── */
interface ChatMessage {
  id:        string
  text:      string
  sender:    string
  senderId:  string
  timestamp: string
  type?:     'text' | 'alert' | 'system' | 'report'
  alertType?: string
  room?:     string
  address?:  string | null
}

const ALERT_COLOR: Record<string, string> = {
  agression: 'var(--red)',
  accident:  'var(--orange)',
  incendie:  '#ff6030',
  sos:       'var(--purple)',
}

/* ── Bulle de message ────────────────────────────────────────────── */
function Bubble({ msg, isAdmin }: { msg: ChatMessage; isAdmin: boolean }) {
  const isAlert  = msg.type === 'alert'
  const isSystem = msg.type === 'system'
  const alertColor = msg.alertType ? ALERT_COLOR[msg.alertType.toLowerCase()] : 'var(--red)'

  /* Message système centré */
  if (isSystem) return (
    <div style={{ textAlign: 'center', padding: '4px 0' }}>
      <span style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 10, letterSpacing: '0.12em', color: 'var(--txt-lo)',
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 10, padding: '2px 10px',
      }}>{msg.text}</span>
    </div>
  )

  /* Message d'alerte */
  if (isAlert) return (
    <div style={{
      margin: '6px 0',
      background: `rgba(255,59,48,.1)`,
      border: `1px solid ${alertColor}`,
      borderLeft: `3px solid ${alertColor}`,
      borderRadius: 6, padding: '8px 12px',
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <AlertTriangle size={14} style={{ color: alertColor, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: alertColor, letterSpacing: '0.1em', marginBottom: 2 }}>
          ALERTE · {msg.alertType?.toUpperCase() ?? 'URGENCE'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--txt-hi)', lineHeight: 1.4 }}>{msg.text}</div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: 'var(--txt-lo)', marginTop: 4 }}>
          {msg.sender} · {msg.timestamp}
        </div>
      </div>
    </div>
  )

  const location = !isAdmin ? (msg.address || msg.room || 'global') : null

  /* Message normal (admin ou citoyen) */
  return (
    <div style={{
      display: 'flex',
      flexDirection: isAdmin ? 'row-reverse' : 'row',
      alignItems: 'flex-end', gap: 8, margin: '4px 0',
    }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: isAdmin
          ? 'linear-gradient(135deg, var(--primary-lo), var(--border-hi))'
          : 'linear-gradient(135deg, #1a2a3a, #0e1a28)',
        border: `1px solid ${isAdmin ? 'var(--primary-lo)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isAdmin
          ? <Shield size={12} style={{ color: 'var(--primary)' }} />
          : <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: 'var(--txt-lo)' }}>
              {msg.sender?.[0]?.toUpperCase() ?? '?'}
            </span>
        }
      </div>

      {/* Bulle */}
      <div style={{ maxWidth: '72%' }}>
        {!isAdmin && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 3,
          }}>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: 'var(--txt-lo)', letterSpacing: '0.1em' }}>
              {msg.sender}
            </span>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 8,
              color: location === 'global' ? 'var(--txt-lo)' : 'var(--primary)',
              background: location === 'global' ? 'rgba(255,255,255,.04)' : 'rgba(0,180,255,.1)',
              border: `1px solid ${location === 'global' ? 'var(--border)' : 'rgba(0,180,255,.2)'}`,
              borderRadius: 4, padding: '1px 5px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              <MapPin size={7} />
              {location}
            </span>
          </div>
        )}
        <div style={{
          padding: '8px 12px',
          borderRadius: isAdmin ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
          background: isAdmin
            ? 'linear-gradient(135deg, rgba(0,100,180,.35), rgba(0,180,255,.18))'
            : 'var(--card)',
          border: `1px solid ${isAdmin ? 'var(--border-hi)' : 'var(--border)'}`,
          boxShadow: isAdmin ? '0 0 12px rgba(0,180,255,.08)' : 'none',
        }}>
          <div style={{ fontSize: 13, color: 'var(--txt-hi)', lineHeight: 1.5 }}>
            {msg.text}
          </div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 9, color: 'var(--txt-lo)', marginTop: 4,
            textAlign: isAdmin ? 'right' : 'left',
          }}>{msg.timestamp}</div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════════════════════ */
export function ChatRoom() {
  const { currentUser } = useApp()
  const socketRef   = useRef<Socket | null>(null)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLInputElement>(null)

  const [messages,   setMessages]   = useState<ChatMessage[]>([])
  const [input,      setInput]      = useState('')
  const [status,     setStatus]     = useState<'connecting' | 'online' | 'offline'>('connecting')
  const [userCount,  setUserCount]  = useState(0)
  const [newCount,   setNewCount]   = useState(0)    // messages non lus
  const [_userList,  setUserList]   = useState<string[]>([])

  const adminName = currentUser
    ? `${currentUser.firstname} ${currentUser.lastname} (Admin)`
    : 'Admin'
  const adminId   = `admin_${currentUser?.userId ?? '0'}`

  /* ── Vider le chat ── */
  const clearChat = useCallback(() => {
    socketRef.current?.emit('clearChat')
    setMessages([])
  }, [])

  /* ── Auto-scroll ── */
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages])

  /* ── Connexion Socket.IO ── */
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports:         ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay:  1000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setStatus('connecting')
      socket.emit('userConnect', {
        userId:   adminId,
        userName: adminName,
        region:   ROOM,
      })
    })

    socket.on('userInfo', () => {
      setStatus('online')
      socket.emit('getMessageHistory')
    })

    socket.on('messageHistory', (history: ChatMessage[]) => {
      setMessages(history)
    })

    socket.on('newMessage', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg])
      if (msg.senderId !== adminId) setNewCount(c => c + 1)
    })

    socket.on('alertMessage', (data: { text: string; priority?: string }) => {
      const alertMsg: ChatMessage = {
        id:        Date.now().toString(),
        text:      data.text,
        sender:    'Système d\'alerte',
        senderId:  'alert_system',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type:      'alert',
      }
      setMessages(prev => [...prev, alertMsg])
    })

    socket.on('userConnected', (user: { id: string; name: string }) => {
      setUserList(prev => [...prev.filter(u => u !== user.name), user.name])
      setUserCount(c => c + 1)
      setMessages(prev => [...prev, {
        id: Date.now().toString(), text: `${user.name} a rejoint la salle`,
        sender: 'Système', senderId: 'system',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type: 'system',
      }])
    })

    socket.on('userDisconnected', (user: { id: string; name: string }) => {
      setUserList(prev => prev.filter(u => u !== user.name))
      setUserCount(c => Math.max(0, c - 1))
      setMessages(prev => [...prev, {
        id: Date.now().toString(), text: `${user.name} a quitté la salle`,
        sender: 'Système', senderId: 'system',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type: 'system',
      }])
    })

    socket.on('chatCleared', () => setMessages([]))
    socket.on('disconnect', () => setStatus('offline'))
    socket.on('connect_error', () => setStatus('offline'))

    return () => { socket.disconnect() }
  }, [adminId, adminName])

  /* ── Envoi de message ── */
  const sendMessage = () => {
    const text = input.trim()
    if (!text || status !== 'online') return
    const socket = socketRef.current
    if (!socket) return

    const msg: ChatMessage = {
      id:        Date.now().toString(),
      text,
      sender:    adminName,
      senderId:  adminId,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type:      'text',
    }
    socket.emit('sendMessage', msg)
    setInput('')
    setNewCount(0)
    inputRef.current?.focus()
  }

  /* ── Envoi d'alerte ── */
  const sendAlert = () => {
    const text = input.trim()
    if (!text || status !== 'online') return
    socketRef.current?.emit('sendAlert', { text, priority: 'high' })
    setInput('')
    inputRef.current?.focus()
  }

  /* ── Statut visuel ── */
  const statusColor = status === 'online' ? 'var(--green)' : status === 'connecting' ? 'var(--yellow)' : 'var(--red)'
  const statusLabel = status === 'online' ? 'EN LIGNE' : status === 'connecting' ? 'CONNEXION...' : 'HORS LIGNE'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', minHeight: 520,
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 8, overflow: 'hidden',
    }}>

      {/* ══ EN-TÊTE ══ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 16px',
        background: 'rgba(0,180,255,.033)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Radio size={15} style={{ color: 'var(--primary)', opacity: .8 }} />
          <div>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 14, fontWeight: 700, letterSpacing: 1,
              textTransform: 'uppercase', color: 'var(--txt-hi)',
            }}>Chat temps réel</div>
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 9, color: 'var(--txt-lo)', letterSpacing: '0.1em',
            }}>SALLE : {ROOM.toUpperCase()}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Vider le chat */}
          <button
            onClick={clearChat}
            className="btn btn-danger btn-sm"
            title="Vider le chat pour tous"
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <Trash2 size={12} /> Vider
          </button>

          {/* Utilisateurs connectés */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Users size={12} style={{ color: 'var(--txt-lo)' }} />
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10, color: 'var(--txt-md)',
            }}>{userCount + 1}</span>
          </div>

          {/* Badge nouveaux messages */}
          {newCount > 0 && (
            <div style={{
              background: 'var(--red)', color: '#fff',
              borderRadius: 10, padding: '1px 7px',
              fontSize: 10, fontWeight: 700, minWidth: 18, textAlign: 'center',
            }}>{newCount}</div>
          )}

          {/* Statut connexion */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {status === 'online'
              ? <Wifi size={13} style={{ color: statusColor }} />
              : <WifiOff size={13} style={{ color: statusColor }} />
            }
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 9, letterSpacing: '0.15em', color: statusColor,
              animation: status === 'connecting' ? 'blink 1s ease-in-out infinite' : 'none',
            }}>{statusLabel}</span>
          </div>
        </div>
      </div>

      {/* ══ MESSAGES ══ */}
      <div
        style={{
          flex: 1, overflowY: 'auto', padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}
        onClick={() => setNewCount(0)}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--txt-lo)' }}>
            <Radio size={28} style={{ margin: '0 auto 10px', opacity: .3 }} />
            <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: '0.2em' }}>
              {status === 'connecting' ? 'CONNEXION EN COURS...' : 'AUCUN MESSAGE'}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <Bubble
              key={msg.id ?? i}
              msg={msg}
              isAdmin={msg.senderId === adminId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ══ SAISIE ══ */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--border)',
        background: 'var(--panel)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder={status === 'online' ? 'Écrire un message...' : 'Hors ligne — reconnexion en cours...'}
            disabled={status !== 'online'}
            style={{
              flex: 1,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--txt-hi)',
              padding: '9px 13px',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 13,
              outline: 'none',
              opacity: status !== 'online' ? .5 : 1,
              transition: 'border-color .2s',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--border-hi)'
              setNewCount(0)
            }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
          />

          {/* Bouton envoyer */}
          <button
            onClick={sendMessage}
            disabled={!input.trim() || status !== 'online'}
            className="btn btn-primary btn-sm"
            title="Envoyer (Entrée)"
            style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
          >
            <Send size={13} />
            <span>Envoyer</span>
          </button>

          {/* Bouton alerte */}
          <button
            onClick={sendAlert}
            disabled={!input.trim() || status !== 'online'}
            className="btn btn-danger btn-sm"
            title="Diffuser comme alerte"
            style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
          >
            <AlertTriangle size={13} />
            <span>Alerte</span>
          </button>
        </div>

        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 9, color: 'var(--txt-lo)', marginTop: 5, letterSpacing: '0.1em',
        }}>
          Entrée pour envoyer · Connecté en tant que <span style={{ color: 'var(--primary)' }}>{adminName}</span>
        </div>
      </div>
    </div>
  )
}
