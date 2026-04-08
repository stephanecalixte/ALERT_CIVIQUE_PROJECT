import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Platform,
} from 'react-native';
import { AdminService, AdminReport } from '@/app/lib/services/AdminService';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';

type Section = 'dashboard' | 'reports' | 'users' | 'streams' | 'emergencies' | 'database';

const STATUS_COLORS: Record<string, string> = {
  PENDING:   '#FF6F00',
  IN_REVIEW: '#1565c0',
  VALIDATED: '#2e7d32',
  REJECTED:  '#c62828',
  RESOLVED:  '#4a148c',
  ARCHIVED:  '#546e7a',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:   'En attente',
  IN_REVIEW: 'En cours',
  VALIDATED: 'Validé',
  REJECTED:  'Rejeté',
  RESOLVED:  'Résolu',
  ARCHIVED:  'Archivé',
};

const NEXT_STATUS: Record<string, string[]> = {
  PENDING:   ['IN_REVIEW', 'REJECTED'],
  IN_REVIEW: ['VALIDATED', 'REJECTED'],
  VALIDATED: ['RESOLVED', 'ARCHIVED'],
  RESOLVED:  ['ARCHIVED'],
  REJECTED:  ['ARCHIVED'],
  ARCHIVED:  [],
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ token }: { token: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setStats(await AdminService.getStats(token)); }
    catch (e) { console.error('Admin stats error:', e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1565c0" />;

  return (
    <ScrollView style={styles.section} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <Text style={styles.sectionTitle}>Tableau de bord</Text>
      <View style={styles.statsGrid}>
        <StatCard label="Signalements"  value={stats?.totalReports ?? 0} color="#1565c0" />
        <StatCard label="Utilisateurs"  value={stats?.totalUsers   ?? 0} color="#2e7d32" />
        <StatCard label="Live Streams"  value={stats?.totalStreams  ?? 0} color="#6a1b9a" />
        <StatCard label="En attente"    value={stats?.pending       ?? 0} color="#FF6F00" />
        <StatCard label="En cours"      value={stats?.inReview      ?? 0} color="#1565c0" />
        <StatCard label="Résolus"       value={stats?.resolved      ?? 0} color="#2e7d32" />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Rôle Admin</Text>
        <Text style={styles.infoText}>
          Gérez les signalements, utilisateurs, live streams et urgences.{'\n'}
          Résoudre un incident efface la bannière alerte active.
        </Text>
      </View>
    </ScrollView>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────
function Reports({ token }: { token: string }) {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [filter, setFilter]   = useState<string>('ALL');
  const { clearAlert } = useAlert();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setReports(await AdminService.getReports(token)); }
    catch (e: any) {
      const msg = e?.message ?? 'Erreur réseau';
      setError(msg);
      console.error('Admin getReports:', msg);
    }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (report: AdminReport, newStatus: string) => {
    try {
      await AdminService.updateReportStatus(report.reportId, newStatus, token);
      if (newStatus === 'RESOLVED' || newStatus === 'ARCHIVED') clearAlert();
      load();
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut.');
    }
  };

  const handleDelete = (report: AdminReport) => {
    Alert.alert(
      'Supprimer le signalement',
      `Supprimer le signalement #${report.reportId} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            try {
              await AdminService.deleteReport(report.reportId, token);
              clearAlert();
              load();
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer.');
            }
          },
        },
      ]
    );
  };

  const filters = ['ALL', 'PENDING', 'IN_REVIEW', 'VALIDATED', 'RESOLVED', 'REJECTED'];
  const visible = filter === 'ALL' ? reports : reports.filter(r => r.status === filter);

  return (
    <View style={styles.section}>
      {/* Filtres */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={load}><Text style={styles.errorBannerText}>↻ Réessayer</Text></TouchableOpacity>
        </View>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === 'ALL' ? 'Tous' : STATUS_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        {visible.length === 0 && !loading && (
          <Text style={styles.emptyText}>Aucun signalement</Text>
        )}
        {visible.map(r => (
          <View key={r.reportId} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportId}>#{r.reportId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[r.status] ?? '#546e7a' }]}>
                <Text style={styles.statusText}>{STATUS_LABELS[r.status] ?? r.status}</Text>
              </View>
            </View>

            <Text style={styles.reportDesc} numberOfLines={2}>
              {r.description || 'Aucune description'}
            </Text>

            {r.locationText && (
              <Text style={styles.reportMeta}>📍 {r.locationText}</Text>
            )}
            {r.createdAt && (
              <Text style={styles.reportMeta}>🕐 {new Date(r.createdAt).toLocaleString('fr-FR')}</Text>
            )}
            {r.userId && (
              <Text style={styles.reportMeta}>👤 Utilisateur #{r.userId}</Text>
            )}

            {/* Actions de statut */}
            {(NEXT_STATUS[r.status] ?? []).length > 0 && (
              <View style={styles.actionRow}>
                {(NEXT_STATUS[r.status] ?? []).map(ns => (
                  <TouchableOpacity
                    key={ns}
                    style={[styles.actionBtn, { backgroundColor: STATUS_COLORS[ns] ?? '#546e7a' }]}
                    onPress={() => handleStatus(r, ns)}
                  >
                    <Text style={styles.actionBtnText}>{STATUS_LABELS[ns] ?? ns}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#c62828' }]}
                  onPress={() => handleDelete(r)}
                >
                  <Text style={styles.actionBtnText}>🗑 Supprimer</Text>
                </TouchableOpacity>
              </View>
            )}
            {(NEXT_STATUS[r.status] ?? []).length === 0 && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#c62828', marginTop: 8 }]}
                onPress={() => handleDelete(r)}
              >
                <Text style={styles.actionBtnText}>🗑 Supprimer</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Users ─────────────────────────────────────────────────────────────────────
function Users({ token }: { token: string }) {
  const [users, setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await AdminService.getUsers(token)); }
    catch { /* silencieux */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (user: any) => {
    Alert.alert(
      'Supprimer utilisateur',
      `Supprimer ${user.firstname} ${user.lastname} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            try { await AdminService.deleteUser(user.id, token); load(); }
            catch { Alert.alert('Erreur', 'Impossible de supprimer.'); }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.section} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <Text style={styles.sectionTitle}>{users.length} utilisateur{users.length > 1 ? 's' : ''}</Text>
      {users.map(u => (
        <View key={u.id} style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{u.firstname} {u.lastname}</Text>
            <Text style={styles.userEmail}>{u.email}</Text>
            <View style={styles.rolesRow}>
              {(u.roles ?? []).map((r: any) => (
                <View key={r.roleId ?? r.name} style={styles.roleBadge}>
                  <Text style={styles.roleText}>{r.name}</Text>
                </View>
              ))}
              <View style={[styles.roleBadge, { backgroundColor: u.active ? '#2e7d32' : '#c62828' }]}>
                <Text style={styles.roleText}>{u.active ? 'Actif' : 'Inactif'}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(u)}>
            <Text style={styles.deleteBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Streams ───────────────────────────────────────────────────────────────────
function Streams({ token }: { token: string }) {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setStreams(await AdminService.getLiveStreams(token)); }
    catch { /* silencieux */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (s: any) => {
    Alert.alert('Supprimer stream', `Supprimer le stream #${s.livestreamId} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try { await AdminService.deleteLiveStream(s.livestreamId, token); load(); }
          catch { Alert.alert('Erreur', 'Impossible de supprimer.'); }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.section} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <Text style={styles.sectionTitle}>{streams.length} stream{streams.length > 1 ? 's' : ''}</Text>
      {streams.map(s => (
        <View key={s.livestreamId} style={styles.streamCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.streamId}>Stream #{s.livestreamId}</Text>
            <Text style={styles.streamMeta}>👤 Utilisateur {s.userId}</Text>
            <Text style={styles.streamMeta}>
              🔴 {s.status} — {s.duration ? `${s.duration}s` : 'En cours'}
            </Text>
            {s.startedAt && (
              <Text style={styles.streamMeta}>🕐 {new Date(s.startedAt).toLocaleString('fr-FR')}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(s)}>
            <Text style={styles.deleteBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Emergencies ───────────────────────────────────────────────────────────────
function Emergencies({ token }: { token: string }) {
  const [list, setList]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await AdminService.getEmergencies(token)); }
    catch { /* silencieux */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (e: any) => {
    Alert.alert('Supprimer alerte', `Supprimer l'alerte #${e.emergencyAlertId} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try { await AdminService.deleteEmergency(e.emergencyAlertId, token); load(); }
          catch { Alert.alert('Erreur', 'Impossible de supprimer.'); }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.section} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <Text style={styles.sectionTitle}>{list.length} alerte urgence{list.length > 1 ? 's' : ''}</Text>
      {list.map(e => (
        <View key={e.emergencyAlertId} style={styles.emergencyCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyEmail}>✉️ {e.email}</Text>
            {e.sentAt && (
              <Text style={styles.streamMeta}>🕐 {new Date(e.sentAt).toLocaleString('fr-FR')}</Text>
            )}
            {(e.messages ?? []).length > 0 && (
              <Text style={styles.streamMeta}>💬 {e.messages.length} message(s)</Text>
            )}
          </View>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(e)}>
            <Text style={styles.deleteBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Database browser ─────────────────────────────────────────────────────────
const DB_TABLES: { key: string; label: string; endpoint: string }[] = [
  { key: 'users',       label: '👥 Utilisateurs',   endpoint: '/api/users' },
  { key: 'reports',     label: '🚨 Signalements',    endpoint: '/api/report' },
  { key: 'contacts',    label: '📞 Contacts conf.', endpoint: '/api/trusted-contacts' },
  { key: 'streams',     label: '📹 Live Streams',   endpoint: '/api/livestream' },
  { key: 'medias',      label: '🎞️ Médias',          endpoint: '/api/media' },
  { key: 'geolocations',label: '📍 Géolocalisations',endpoint: '/api/geolocations' },
  { key: 'emergencies', label: '🏛️ Urgences',        endpoint: '/api/emergencies' },
  { key: 'notifs',      label: '🔔 Notifications',  endpoint: '/api/push-notifications/user/0' },
  { key: 'history',     label: '📜 Historique',     endpoint: '/api/history' },
  { key: 'roles',       label: '🔑 Rôles',           endpoint: '/api/roles' },
];

function Database({ token }: { token: string }) {
  const [activeTable, setActiveTable] = useState(DB_TABLES[0].key);
  const [rows, setRows]               = useState<any[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const loadTable = useCallback(async (endpoint: string) => {
    setLoading(true);
    setError(null);
    setRows([]);
    try {
      const res = await fetch(`${require('@/lib/config').JAVA_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${endpoint}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : [data]);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur réseau');
      console.error('DB browser:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const t = DB_TABLES.find(t => t.key === activeTable);
    if (t) loadTable(t.endpoint);
  }, [activeTable, loadTable]);

  const table = DB_TABLES.find(t => t.key === activeTable)!;

  // Colonnes : union de toutes les clés des objets
  const columns = rows.length > 0
    ? Array.from(new Set(rows.flatMap(r => Object.keys(r)))).slice(0, 8)
    : [];

  return (
    <View style={styles.section}>
      {/* Sélecteur de table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {DB_TABLES.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.filterChip, activeTable === t.key && styles.filterChipActive]}
            onPress={() => setActiveTable(t.key)}
          >
            <Text style={[styles.filterChipText, activeTable === t.key && styles.filterChipTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dbHeader}>
        <Text style={styles.sectionTitle}>{table.label} — {rows.length} ligne(s)</Text>
        <TouchableOpacity onPress={() => loadTable(table.endpoint)}>
          <Text style={styles.refreshBtn}>↻ Rafraîchir</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
        </View>
      )}

      {loading && <ActivityIndicator style={{ marginTop: 20 }} color="#1565c0" />}

      {/* Tableau scrollable */}
      {!loading && rows.length > 0 && (
        <ScrollView horizontal>
          <View>
            {/* En-têtes */}
            <View style={styles.tableRow}>
              {columns.map(col => (
                <Text key={col} style={styles.tableHeader}>{col}</Text>
              ))}
            </View>
            {/* Lignes */}
            <ScrollView>
              {rows.map((row, i) => (
                <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}>
                  {columns.map(col => (
                    <Text key={col} style={styles.tableCell} numberOfLines={1}>
                      {row[col] === null || row[col] === undefined
                        ? '—'
                        : typeof row[col] === 'object'
                        ? JSON.stringify(row[col]).slice(0, 30)
                        : String(row[col]).slice(0, 30)}
                    </Text>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      )}

      {!loading && rows.length === 0 && !error && (
        <Text style={styles.emptyText}>Table vide</Text>
      )}
    </View>
  );
}

// ── Main Admin Screen ─────────────────────────────────────────────────────────
export default function AdminScreen() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const { token, user } = useAuth();

  if (!token) {
    return (
      <View style={styles.noAuth}>
        <Text style={styles.noAuthText}>🔒 Accès réservé aux administrateurs</Text>
      </View>
    );
  }

  const tabs: { key: Section; label: string; emoji: string }[] = [
    { key: 'dashboard',   label: 'Tableau',      emoji: '📊' },
    { key: 'reports',     label: 'Signalements', emoji: '🚨' },
    { key: 'users',       label: 'Utilisateurs', emoji: '👥' },
    { key: 'streams',     label: 'Streams',      emoji: '📹' },
    { key: 'emergencies', label: 'Urgences',     emoji: '🏛️' },
    { key: 'database',    label: 'Base de données', emoji: '🗄️' },
  ];

  return (
    <View style={styles.container}>
      {/* Header admin */}
      <View style={styles.adminHeader}>
        <Text style={styles.adminTitle}>🛡️ Administration</Text>
        <Text style={styles.adminSubtitle}>Connecté : {user?.name ?? user?.email ?? '—'}</Text>
      </View>

      {/* Onglets de navigation admin */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.adminTab, activeSection === t.key && styles.adminTabActive]}
            onPress={() => setActiveSection(t.key)}
          >
            <Text style={styles.adminTabEmoji}>{t.emoji}</Text>
            <Text style={[styles.adminTabLabel, activeSection === t.key && styles.adminTabLabelActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Contenu */}
      <View style={styles.content}>
        {activeSection === 'dashboard'   && <Dashboard   token={token} />}
        {activeSection === 'reports'     && <Reports     token={token} />}
        {activeSection === 'users'       && <Users       token={token} />}
        {activeSection === 'streams'     && <Streams     token={token} />}
        {activeSection === 'emergencies' && <Emergencies token={token} />}
        {activeSection === 'database'    && <Database    token={token} />}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },

  noAuth: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noAuthText: { fontSize: 16, color: '#546e7a', textAlign: 'center', padding: 20 },

  adminHeader: {
    backgroundColor: '#1565c0',
    paddingTop: Platform.OS === 'ios' ? 0 : 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  adminTitle:    { color: '#fff', fontSize: 20, fontWeight: '800' },
  adminSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },

  tabsRow: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  adminTab: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  adminTabActive: { backgroundColor: '#fff' },
  adminTabEmoji:  { fontSize: 16 },
  adminTabLabel:  { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 2, fontWeight: '600' },
  adminTabLabelActive: { color: '#1565c0' },

  content: { flex: 1 },
  section: { flex: 1, padding: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1565c0', marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },

  // Stats
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16,
  },
  statCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderLeftWidth: 4, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#546e7a', marginTop: 2 },

  infoBox: {
    backgroundColor: '#e3f2fd', borderRadius: 12, padding: 14,
    borderLeftWidth: 4, borderLeftColor: '#1565c0',
  },
  infoTitle: { fontWeight: '700', color: '#1565c0', marginBottom: 4 },
  infoText:  { color: '#37474f', fontSize: 13, lineHeight: 20 },

  // Filtres
  filterRow: { marginBottom: 10 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#e0e0e0', marginRight: 6,
  },
  filterChipActive:     { backgroundColor: '#1565c0' },
  filterChipText:       { color: '#546e7a', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },

  // Report card
  reportCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reportId:     { fontSize: 14, fontWeight: '700', color: '#333' },
  statusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText:   { color: '#fff', fontSize: 11, fontWeight: '700' },
  reportDesc:   { fontSize: 13, color: '#546e7a', marginBottom: 6 },
  reportMeta:   { fontSize: 11, color: '#90a4ae', marginBottom: 2 },
  actionRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  actionBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  actionBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // User card
  userCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  userInfo:  { flex: 1 },
  userName:  { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  userEmail: { fontSize: 12, color: '#546e7a', marginTop: 2 },
  rolesRow:  { flexDirection: 'row', gap: 6, marginTop: 6 },
  roleBadge: {
    backgroundColor: '#1565c0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  roleText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Stream / emergency card
  streamCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  streamId:   { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  streamMeta: { fontSize: 11, color: '#90a4ae', marginBottom: 2 },

  emergencyCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
    borderLeftWidth: 4, borderLeftColor: '#c62828',
  },
  emergencyEmail: { fontSize: 14, fontWeight: '700', color: '#c62828', marginBottom: 4 },

  deleteBtn:     { padding: 8 },
  deleteBtnText: { fontSize: 20 },

  // Erreur
  errorBanner: {
    backgroundColor: '#ffebee', borderRadius: 8, padding: 10, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between',
    borderLeftWidth: 4, borderLeftColor: '#c62828',
  },
  errorBannerText: { color: '#c62828', fontSize: 12, fontWeight: '600' },

  // Database
  dbHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  refreshBtn: { color: '#1565c0', fontWeight: '700', fontSize: 14 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tableRowEven: { backgroundColor: '#f5f7fa' },
  tableHeader: {
    width: 120, padding: 8, fontWeight: '700', fontSize: 11,
    color: '#fff', backgroundColor: '#1565c0',
    borderRightWidth: 1, borderRightColor: '#0d47a1',
  },
  tableCell: {
    width: 120, padding: 8, fontSize: 11, color: '#333',
    borderRightWidth: 1, borderRightColor: '#e0e0e0',
  },
});
