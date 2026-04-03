#!/usr/bin/env bash
# Lance Expo sur un vrai appareil Android connecté en USB ou via WiFi

ADB="$HOME/AppData/Local/Android/Sdk/platform-tools/adb.exe"

echo ""
echo "=== Alert Civique — Démarrage sur appareil réel ==="
echo ""

# Vérifier que ADB existe
if [ ! -f "$ADB" ]; then
  echo "ERREUR : adb.exe introuvable."
  echo "Installe Android Studio : https://developer.android.com/studio"
  exit 1
fi

# Lister les appareils connectés
DEVICES=$("$ADB" devices | grep -v "List of" | grep "device$")

if [ -z "$DEVICES" ]; then
  echo "Aucun appareil détecté."
  echo ""
  echo "Options :"
  echo "  1) Branche ton téléphone en USB et accepte le débogage USB"
  echo "  2) Connexion WiFi : entre l'IP affichée dans Paramètres → Options développeur → Débogage sans fil"
  echo ""
  read -p "IP:PORT du téléphone (laisser vide pour annuler) : " WIFI_ADDR
  if [ -n "$WIFI_ADDR" ]; then
    "$ADB" connect "$WIFI_ADDR"
    sleep 2
    DEVICES=$("$ADB" devices | grep -v "List of" | grep "device$")
  fi
fi

if [ -z "$DEVICES" ]; then
  echo ""
  echo "Toujours aucun appareil. Vérifie :"
  echo "  - Débogage USB activé (Paramètres → Options développeur)"
  echo "  - Câble USB branché + popup 'Autoriser' acceptée sur le téléphone"
  exit 1
fi

echo "Appareil(s) détecté(s) :"
echo "$DEVICES"
echo ""
echo "Démarrage du serveur Node.js en arrière-plan..."
cd "$(dirname "$0")/server" && node server.js &
SERVER_PID=$!
echo "Serveur Node.js PID: $SERVER_PID"
cd "$(dirname "$0")"

echo ""
echo "Lancement d'Expo..."
npx expo start --android
