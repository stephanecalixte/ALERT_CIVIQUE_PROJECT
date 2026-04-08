import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import LiveStreamScreen from '@/app/views/LiveStreamSreen';
import { useReportFlow, ReportFlowResult } from '@/hooks/useReportFlow';
import { useMessagesContext } from '@/contexts/MessagesContext';
import { useAlert } from '@/contexts/AlertContext';

function ConfirmationScreen({
  result,
  onContinue,
  onClose,
}: {
  result: ReportFlowResult;
  onContinue: () => void;
  onClose: () => void;
}) {
  const sentContacts = result.trustedContactsNotified.filter((c) => c.sent);
  const failedContacts = result.trustedContactsNotified.filter((c) => !c.sent);

  return (
    <View style={confirmStyles.container}>
      <ScrollView contentContainerStyle={confirmStyles.content}>
        <Text style={confirmStyles.title}>
          {result.offline ? '⚠️ Mode hors ligne' : '🚨 SOS envoyé'}
        </Text>

        {/* Signalement */}
        <View style={confirmStyles.row}>
          <Text style={confirmStyles.icon}>{result.reportId ? '✅' : '❌'}</Text>
          <Text style={confirmStyles.label}>
            {result.reportId
              ? `Signalement créé (#${result.reportId})`
              : result.offline
              ? 'Signalement sauvegardé hors ligne'
              : 'Signalement non créé'}
          </Text>
        </View>

        {/* Géolocalisation */}
        <View style={confirmStyles.row}>
          <Text style={confirmStyles.icon}>{result.geolocalisationId ? '✅' : '⚠️'}</Text>
          <Text style={confirmStyles.label}>
            {result.geolocalisationId
              ? 'Localisation transmise'
              : result.latitude
              ? 'Localisation non transmise'
              : 'GPS non disponible'}
          </Text>
        </View>

        {/* Notification push */}
        <View style={confirmStyles.row}>
          <Text style={confirmStyles.icon}>{result.pushNotificationSent ? '✅' : '⚠️'}</Text>
          <Text style={confirmStyles.label}>
            {result.pushNotificationSent
              ? 'Notification envoyée'
              : 'Notification non envoyée'}
          </Text>
        </View>

        {/* Autorités */}
        <View style={confirmStyles.row}>
          <Text style={confirmStyles.icon}>{result.authorityAlertSent ? '✅' : '⚠️'}</Text>
          <Text style={confirmStyles.label}>
            {result.authorityAlertSent
              ? 'Autorités alertées'
              : 'Alerte autorités non envoyée'}
          </Text>
        </View>

        {/* Contacts de confiance */}
        {result.trustedContactsNotified.length === 0 ? (
          <View style={confirmStyles.row}>
            <Text style={confirmStyles.icon}>ℹ️</Text>
            <Text style={confirmStyles.label}>Aucun contact de confiance enregistré</Text>
          </View>
        ) : (
          <>
            {sentContacts.map((c) => (
              <View style={confirmStyles.row} key={c.email}>
                <Text style={confirmStyles.icon}>✅</Text>
                <Text style={confirmStyles.label}>
                  Alerte envoyée à {c.name} ({c.email})
                </Text>
              </View>
            ))}
            {failedContacts.map((c) => (
              <View style={confirmStyles.row} key={c.email}>
                <Text style={confirmStyles.icon}>❌</Text>
                <Text style={confirmStyles.label}>
                  Échec pour {c.name} ({c.email})
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Boutons */}
        <TouchableOpacity style={confirmStyles.continueButton} onPress={onContinue}>
          <Text style={confirmStyles.continueText}>▶ Démarrer le stream</Text>
        </TouchableOpacity>

        <TouchableOpacity style={confirmStyles.closeButton} onPress={onClose}>
          <Text style={confirmStyles.closeText}>Fermer</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default function SosButton() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showStream, setShowStream] = useState(false);
  const { state, result, triggerSos, reset } = useReportFlow();
  const { sendAlertReport } = useMessagesContext();
  const { setAlertType } = useAlert();

  const handleSosPress = async () => {
    const flowResult = await triggerSos();
    if (flowResult.error === 'not_authenticated') {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour envoyer un SOS.',
        [{ text: 'OK' }]
      );
      return;
    }
    // Envoie la carte SOS dans le chat + met à jour la bannière incident
    setAlertType('sos');
    sendAlertReport('sos');
    setShowConfirmation(true);
  };

  const handleContinueToStream = () => {
    setShowConfirmation(false);
    setShowStream(true);
  };

  const handleClose = () => {
    setShowConfirmation(false);
    setShowStream(false);
    reset();
  };

  const isBusy = state === 'locating' || state === 'sending' || state === 'notifying';

  const busyLabel =
    state === 'locating'
      ? 'Localisation...'
      : state === 'sending'
      ? 'Envoi...'
      : state === 'notifying'
      ? 'Notification...'
      : '';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleSosPress}
        style={styles.sosButton}
        activeOpacity={0.8}
        disabled={isBusy}
      >
        <View style={styles.innerContainer}>
          {isBusy ? (
            <View style={styles.busyContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.busyText}>{busyLabel}</Text>
            </View>
          ) : (
            <Text style={styles.sosText}>SOS</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Écran de confirmation */}
      <Modal
        visible={showConfirmation}
        animationType="slide"
        onRequestClose={handleClose}
        presentationStyle="pageSheet"
      >
        {result && (
          <ConfirmationScreen
            result={result}
            onContinue={handleContinueToStream}
            onClose={handleClose}
          />
        )}
      </Modal>

      {/* Stream */}
      <Modal
        visible={showStream}
        animationType="slide"
        onRequestClose={handleClose}
        presentationStyle="pageSheet"
      >
        <LiveStreamScreen
          onClose={handleClose}
          autoStart
          reportId={result?.reportId ?? undefined}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButton: {
    backgroundColor: '#e8ecf0',
    width: '100%',
    height: '90%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#a3b1c6',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderBottomColor: '#c4cdd8',
    borderRightColor: '#c4cdd8',
  },
  innerContainer: {
    justifyContent: 'center',
    backgroundColor: 'red',
    borderRadius: 50,
    width: '90%',
    height: '90%',
    alignItems: 'center',
  },
  sosText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  busyContainer: {
    alignItems: 'center',
    gap: 8,
  },
  busyText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});

const confirmStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 28,
    paddingTop: 60,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: 12,
  },
  icon: {
    fontSize: 18,
    lineHeight: 22,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 22,
  },
  continueButton: {
    marginTop: 12,
    backgroundColor: '#e53935',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeText: {
    color: '#888',
    fontSize: 15,
  },
});
