import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReportService from '@/app/lib/services/ReportService';
import { Report } from '@/models/Report';
import { useAuth } from '@/contexts/AuthContext';
import { useReportFlow } from '@/hooks/useReportFlow';

const HIDDEN_REPORTS_KEY = '@hidden_report_ids';

// ── Couleur / icône selon le type d'alerte ────────────────────────────────────
type EventCfg = { label: string; color: string; icon: keyof typeof Ionicons.glyphMap };

function getEventConfig(alertType?: string): EventCfg {
  const t = (alertType ?? '').toLowerCase();
  if (t === 'sos')                       return { label: 'SOS',       color: '#e53935', icon: 'warning' };
  if (t === 'agression')                 return { label: 'Agression', color: '#b71c1c', icon: 'alert-circle' };
  if (t === 'incendie')                  return { label: 'Incendie',  color: '#e65100', icon: 'flame' };
  if (t === 'accident')                  return { label: 'Accident',  color: '#f57c00', icon: 'car' };
  if (t.includes('photo'))               return { label: 'Photo',     color: '#1565c0', icon: 'camera' };
  if (t.includes('video') || t.includes('live')) return { label: 'Vidéo', color: '#6a1b9a', icon: 'videocam' };
  if (t.includes('message') || t.includes('chat')) return { label: 'Message', color: '#2e7d32', icon: 'chatbubble-ellipses' };
  return                                   { label: 'Alerte',     color: '#1565c0', icon: 'alert-circle' };
}

// ── Formatage date ─────────────────────────────────────────────────────────────
function formatDate(raw?: any): string {
  if (!raw) return '—';
  try {
    let d: Date;
    // Java LocalDateTime serialisé en tableau [année, mois, jour, h, min, s, ns]
    if (Array.isArray(raw)) {
      d = new Date(raw[0], raw[1] - 1, raw[2], raw[3] ?? 0, raw[4] ?? 0, raw[5] ?? 0);
    } else {
      d = new Date(raw);
    }
    if (isNaN(d.getTime())) return '—';
    const now  = new Date();
    const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (days === 0) return `Aujourd'hui`;
    if (days === 1) return `Hier`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

// ── Carte alerte ───────────────────────────────────────────────────────────────
function AlertCard({ item, onDelete }: { item: Report; onDelete: (id: number) => void }) {
  const cfg = getEventConfig(item.alertType);

  const confirmDelete = () => {
    Alert.alert(
      'Supprimer ce signalement ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(item.reportId!) },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={[styles.cardStripe, { backgroundColor: cfg.color }]} />
      <View style={[styles.cardIconWrap, { backgroundColor: cfg.color + '18' }]}>
        <Ionicons name={cfg.icon} size={22} color={cfg.color} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={[styles.cardType, { color: cfg.color }]}>{cfg.label}</Text>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}
        {item.locationText ? (
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={11} color="#90a4ae" />
            <Text style={styles.locText} numberOfLines={1}>{item.locationText}</Text>
          </View>
        ) : null}
        <View style={styles.locRow}>
          <Ionicons name="person-outline" size={11} color="#90a4ae" />
          <Text style={styles.locText}>{item.anonymous ? 'Anonyme' : `Utilisateur #${item.userId ?? '?'}`}</Text>
        </View>
      </View>
      {item.reportId != null && (
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={18} color="#e53935" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Écran principal ────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const { token } = useAuth();
  const { retryOfflineQueue } = useReportFlow();
  const [items, setItems]         = useState<Report[]>([]);
  const [isLoading, setLoading]   = useState(false);
  const [isRefreshing, setRefresh]= useState(false);
  const [error, setError]         = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      await retryOfflineQueue();
      const [all, hiddenRaw] = await Promise.all([
        ReportService.getAll(token),
        AsyncStorage.getItem(HIDDEN_REPORTS_KEY),
      ]);
      const hidden: number[] = hiddenRaw ? JSON.parse(hiddenRaw) : [];
      const visible = all.filter(r => !hidden.includes(r.reportId!));
      console.log('📋 Historique — total reçu:', all.length, '| masqués:', hidden.length);
      const toMs = (raw: any): number => {
        if (!raw) return 0;
        if (Array.isArray(raw)) return new Date(raw[0], raw[1] - 1, raw[2], raw[3] ?? 0, raw[4] ?? 0, raw[5] ?? 0).getTime();
        return new Date(raw).getTime() || 0;
      };
      visible.sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
      setItems(visible);
    } catch (e: any) {
      setError(e?.message ?? 'Impossible de charger les alertes');
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }, [token, retryOfflineQueue]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(() => { setRefresh(true); load(true); }, [load]);

  const deleteItem = useCallback(async (id: number) => {
    const raw = await AsyncStorage.getItem(HIDDEN_REPORTS_KEY);
    const hidden: number[] = raw ? JSON.parse(raw) : [];
    if (!hidden.includes(id)) {
      await AsyncStorage.setItem(HIDDEN_REPORTS_KEY, JSON.stringify([...hidden, id]));
    }
    setItems(prev => prev.filter(r => r.reportId !== id));
  }, []);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Historique des alertes</Text>
          {!isLoading && items.length > 0 && (
            <Text style={styles.headerSub}>{items.length} alerte{items.length > 1 ? 's' : ''}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => load()} disabled={isLoading}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Légende */}
      <View style={styles.legend}>
        {[
          { label: 'SOS',     color: '#e53935' },
          { label: 'Photo',   color: '#1565c0' },
          { label: 'Vidéo',   color: '#6a1b9a' },
          { label: 'Audio',   color: '#e65100' },
          { label: 'Message', color: '#2e7d32' },
        ].map(t => (
          <View key={t.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: t.color }]} />
            <Text style={styles.legendText}>{t.label}</Text>
          </View>
        ))}
      </View>

      {/* Contenu */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a6fd4" size="large" />
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={48} color="#e53935" />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.reportId ?? Math.random())}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#1a6fd4']} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={56} color="#90a4ae" />
              <Text style={styles.emptyText}>Aucune alerte enregistrée</Text>
              <Text style={styles.emptyHint}>Les alertes SOS et incidents apparaîtront ici.</Text>
            </View>
          }
          renderItem={({ item }) => <AlertCard item={item} onDelete={deleteItem} />}
        />
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#e8ecf0' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1565c0', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 2, borderBottomColor: '#0d47a1',
    shadowColor: '#0a3a8a', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5, shadowRadius: 6, elevation: 8,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
  headerSub:   { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 1 },
  refreshBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#1a6fd4',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#4da3ff',
    shadowColor: '#0a3a8a', shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5, shadowRadius: 4, elevation: 5,
  },

  legend: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#dce6f7', borderBottomWidth: 1, borderBottomColor: '#c5d5ec',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#37474f', fontWeight: '600' },

  list: { padding: 14, gap: 10 },

  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#0a3a8a', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10, shadowRadius: 5, elevation: 4,
  },
  cardStripe:   { width: 4, alignSelf: 'stretch' },
  cardIconWrap: { width: 48, height: 48, borderRadius: 24, margin: 12, justifyContent: 'center', alignItems: 'center' },
  cardBody:     { flex: 1, paddingVertical: 12, paddingRight: 12 },
  cardRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  cardType:     { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardDate:     { fontSize: 11, color: '#90a4ae' },
  cardDesc:     { fontSize: 13, color: '#37474f', marginBottom: 4 },
  locRow:       { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  locText:      { fontSize: 11, color: '#90a4ae', flex: 1 },
  cardFooter:   { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  priority:     { fontSize: 11, color: '#f57c00', fontWeight: '700' },
  anon:         { fontSize: 11, color: '#78909c', fontStyle: 'italic' },

  deleteBtn: { padding: 12, justifyContent: 'center', alignItems: 'center' },

  badge:     { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  empty:     { alignItems: 'center', marginTop: 70, gap: 12, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#546e7a', textAlign: 'center' },
  emptyHint: { fontSize: 13, color: '#90a4ae', textAlign: 'center', lineHeight: 20 },
  retryBtn:  { marginTop: 8, backgroundColor: '#1a6fd4', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
