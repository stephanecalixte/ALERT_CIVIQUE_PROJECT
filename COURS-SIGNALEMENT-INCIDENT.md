# Fonctionnalité — Signalement d'incident
## Agression · Accident · Incendie

---

## Vue d'ensemble

Quand l'utilisateur appuie sur le bouton **⚠️** dans le topLayout :

```
Bouton ⚠️ pressé
  → AlertTypeModal s'ouvre (Agression / Accident / Incendie)
  → Utilisateur choisit un type
  → Marqueur de la carte change d'icône et de couleur
  → Carte de signalement envoyée dans le chat
  → Bouton affiche l'emoji du type sélectionné
  → Deuxième clic → réinitialise tout
```

---

## Architecture — comment les pièces communiquent

```
_layout.tsx
└─ AlertProvider  ← fournit alertType à toute l'app
   └─ AppContent
      └─ (tabs)/index.tsx
         ├─ AlertTypeModal    ← modal de choix
         ├─ MapScreen         ← lit alertType → change marqueur
         └─ useMessages       ← sendAlertReport → chat
```

Le `AlertContext` est le **pont** entre l'écran Home (carte) et le chat.
Aucune prop n'est passée manuellement entre composants distants.

---

## Fichier 1 — `contexts/AlertContext.tsx`

### Rôle
Stocker et partager le type d'alerte sélectionné dans toute l'application.

### Le type AlertType

```typescript
export type AlertType = 'agression' | 'accident' | 'incendie';
```

Un type union — la valeur ne peut être que l'une de ces 3 chaînes.
TypeScript vérifie statiquement qu'on ne peut pas écrire `'feu'` par erreur.

### La configuration ALERT_CONFIGS

```typescript
export const ALERT_CONFIGS: Record<AlertType, AlertConfig> = {
  agression: {
    label:     'Agression',
    emoji:     '🚨',
    color:     '#e53935',   // rouge — danger immédiat
    markerBg:  '#e53935',
    chatLabel: '🚨 AGRESSION signalée',
  },
  accident: {
    label:     'Accident',
    emoji:     '🚗',
    color:     '#FF6F00',   // orange — urgence modérée
    markerBg:  '#FF6F00',
    chatLabel: '🚗 ACCIDENT signalé',
  },
  incendie: {
    label:     'Incendie',
    emoji:     '🔥',
    color:     '#FF3D00',   // rouge-orange — feu
    markerBg:  '#FF3D00',
    chatLabel: '🔥 INCENDIE signalé',
  },
};
```

**Pourquoi `Record<AlertType, AlertConfig>` ?**

`Record<K, V>` est un type TypeScript qui signifie "un objet dont les clés
sont de type K et les valeurs de type V".

```typescript
Record<AlertType, AlertConfig>
// = { agression: AlertConfig; accident: AlertConfig; incendie: AlertConfig; }
```

Si on oublie d'ajouter une clé, TypeScript signale une erreur à la compilation.

### Le contexte

```typescript
interface AlertContextType {
  alertType: AlertType | null;    // null = pas d'alerte active
  setAlertType: (type: AlertType) => void;
  clearAlert: () => void;
}

export const AlertProvider = ({ children }) => {
  const [alertType, setAlertTypeState] = useState<AlertType | null>(null);

  return (
    <AlertContext.Provider value={{
      alertType,
      setAlertType: (type) => setAlertTypeState(type),
      clearAlert:   () => setAlertTypeState(null),
    }}>
      {children}
    </AlertContext.Provider>
  );
};
```

**Pourquoi `null` et pas une valeur par défaut ?**

`null` signifie explicitement "aucune alerte active".
C'est différent d'une string vide `''` qui pourrait être ambiguë.
Le composant peut tester `if (alertType)` pour savoir s'il y a une alerte.

---

## Fichier 2 — `components/AlertTypeModal.tsx`

### Rôle
Modal bottom sheet qui présente les 3 choix d'incident.

### Structure visuelle

```
┌────────────────────────────────┐
│   Type de signalement          │
│   Choisissez la nature...      │
│                                │
│  🔴 🚨  AGRESSION              │
│         Violence, attaque...   │
│                                │
│  🟠 🚗  ACCIDENT               │
│         Collision, blessés...  │
│                                │
│  🔴 🔥  INCENDIE               │
│         Feu, fumée...          │
│                                │
│         Annuler                │
└────────────────────────────────┘
```

### Comment fonctionne le fond semi-transparent

```typescript
<Pressable style={styles.overlay} onPress={onClose}>
  {/* Clic sur le fond → ferme le modal */}

  <Pressable style={styles.sheet} onPress={() => {}}>
    {/* Clic sur la feuille → ne se propage PAS vers l'overlay */}
    ...
  </Pressable>
</Pressable>
```

Le `onPress={() => {}}` vide sur la `sheet` intérieure **arrête la propagation**
de l'événement vers l'`overlay`. Ainsi :
- Clic sur le fond gris → ferme
- Clic sur la feuille blanche → ne ferme pas

### Génération dynamique des boutons

```typescript
const CHOICES: AlertType[] = ['agression', 'accident', 'incendie'];

{CHOICES.map((type) => {
  const cfg = ALERT_CONFIGS[type];  // récupère couleur, emoji, label
  return (
    <TouchableOpacity
      key={type}
      style={[styles.choice, { borderColor: cfg.color }]}
      onPress={() => {
        onSelect(type);   // informe le parent du choix
        onClose();        // ferme le modal
      }}
    >
      <View style={[styles.iconCircle, { backgroundColor: cfg.color }]}>
        <Text>{cfg.emoji}</Text>
      </View>
      <Text style={{ color: cfg.color }}>{cfg.label}</Text>
    </TouchableOpacity>
  );
})}
```

Au lieu d'écrire 3 boutons identiques, on itère sur un tableau.
Si on ajoute un 4ème type dans `ALERT_CONFIGS`, le bouton apparaît automatiquement.

---

## Fichier 3 — `components/MapScreen.tsx`

### Rôle
Afficher la carte Leaflet dans un WebView et transformer le marqueur
quand un type d'alerte est sélectionné.

### Communication React Native ↔ WebView

React Native et le WebView (qui fait tourner du JavaScript de navigateur)
sont deux environnements séparés. Pour communiquer :

```
React Native                      WebView (Leaflet)
────────────                      ─────────────────
webViewRef.postMessage(json)  →   window.addEventListener('message', ...)
                              ←   window.ReactNativeWebView.postMessage(json)
```

#### Côté React Native — envoi d'un message

```typescript
useEffect(() => {
  if (!webViewRef.current || !alertType) return;

  const cfg = ALERT_CONFIGS[alertType];
  const msg = JSON.stringify({
    type:      'SET_ALERT',
    alertType,
    emoji:     cfg.emoji,
    color:     cfg.markerBg,
    label:     cfg.label,
  });

  webViewRef.current.postMessage(msg);   // envoie au WebView
}, [alertType]);
// useEffect se déclenche chaque fois qu'alertType change
```

**Pourquoi `JSON.stringify` ?**
`postMessage` ne peut envoyer que des chaînes de caractères.
On convertit l'objet en JSON string, puis le WebView le re-parse.

#### Côté WebView — réception et mise à jour du marqueur

```javascript
// Dans le HTML injecté dans Leaflet :
document.addEventListener('message', handleRNMessage);
window.addEventListener('message', handleRNMessage);
// Les deux sont nécessaires pour compatibilité Android/iOS

function handleRNMessage(event) {
  var data = JSON.parse(event.data);   // string → objet JS

  if (data.type === 'SET_ALERT') {
    updateMarker(data.alertType, data.emoji, data.color, data.label);
  } else if (data.type === 'RESET_MARKER') {
    resetMarker();
  }
}
```

#### Création d'un marqueur personnalisé Leaflet

```javascript
function updateMarker(alertType, emoji, color, label) {

  // L.divIcon = marqueur HTML personnalisé (pas une image PNG)
  var icon = L.divIcon({
    html: '<div class="alert-marker" style="background:' + color + '">'
          + emoji + '</div>',
    className:   '',        // pas de classe CSS Leaflet par défaut
    iconSize:    [44, 44],  // taille en pixels
    iconAnchor:  [22, 22],  // point d'ancrage = centre de l'icône
    popupAnchor: [0, -24],  // popup s'ouvre au-dessus du marqueur
  });

  marker.setIcon(icon);    // remplace l'icône du marqueur existant
  marker.setPopupContent(...);
  marker.openPopup();
}
```

**L.divIcon vs L.Icon**

| | L.Icon (défaut) | L.divIcon |
|---|---|---|
| Rendu | Image PNG | HTML/CSS |
| Personnalisation | Limitée | Totale |
| Emoji | ❌ | ✅ |
| Couleur dynamique | ❌ | ✅ |

---

## Fichier 4 — `hooks/useMessages.ts` — `sendAlertReport`

### Rôle
Envoyer une carte de signalement dans le chat Socket.io.

### Le nouveau type de message

```typescript
export interface Message {
  id:        string;
  text:      string;
  sender:    string;
  senderId:  string;
  timestamp: string;
  type?:     'text' | 'alert' | 'system' | 'report';  // ← 'report' ajouté
  alertType?: AlertType;  // présent uniquement quand type === 'report'
}
```

### La fonction sendAlertReport

```typescript
const sendAlertReport = useCallback((type: AlertType) => {
  if (!socket || !user) return;

  const cfg = ALERT_CONFIGS[type];

  const message: Message = {
    id:        Date.now().toString(),   // ID unique basé sur le timestamp
    text:      cfg.chatLabel,           // ex: "🚨 AGRESSION signalée"
    sender:    user.name,
    senderId:  user.id,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit'
    }),
    type:      'report',
    alertType: type,                   // 'agression' | 'accident' | 'incendie'
  };

  // 1. Envoie au serveur Socket.io (→ tous les autres utilisateurs reçoivent)
  socket.emit('sendMessage', message);

  // 2. Ajoute localement immédiatement (pas besoin d'attendre le serveur)
  setMessages(prev => [...prev, message]);

  // 3. Scroll vers le bas
  setTimeout(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, 100);

}, [socket, user]);
```

**Mise à jour locale immédiate**

On ajoute le message localement AVANT que le serveur réponde.
C'est ce qu'on appelle une **mise à jour optimiste** :
- Interface réactive : le message apparaît instantanément
- Si le serveur confirme → pas de doublon car le message a déjà l'ID unique
- Si le serveur échoue → le message reste visible localement (acceptable pour une alerte)

---

## Fichier 5 — `app/(tabs)/Messages.tsx` — Carte de signalement

### Rendu conditionnel par type

```typescript
const renderMessage = ({ item }: { item: Message }) => {
  const isReport = item.type === 'report';

  // ── Cas spécial : carte de signalement ──────────────────────────────
  if (isReport && item.alertType) {
    const cfg = ALERT_CONFIGS[item.alertType];
    return (
      <View style={[styles.reportCard, { borderColor: cfg.color }]}>
        {/* Cercle coloré avec emoji */}
        <View style={[styles.reportIconCircle, { backgroundColor: cfg.color }]}>
          <Text style={styles.reportEmoji}>{cfg.emoji}</Text>
        </View>
        {/* Infos : type, auteur, heure */}
        <View style={styles.reportBody}>
          <Text style={[styles.reportLabel, { color: cfg.color }]}>
            {cfg.label.toUpperCase()}
          </Text>
          <Text style={styles.reportSender}>Signalé par {item.sender}</Text>
          <Text style={styles.reportTime}>{item.timestamp}</Text>
        </View>
      </View>
    );
  }

  // ── Cas normal : message texte ──────────────────────────────────────
  return ( /* ... bulle de message normale ... */ );
};
```

### Apparence de la carte dans le chat

```
┌──────────────────────────────────────────────┐ ← borderColor = cfg.color
│  🔴          AGRESSION                        │
│  (rouge)     Signalé par Jean Dupont          │
│              14:32                            │
└──────────────────────────────────────────────┘
```

---

## Fichier 6 — `app/(tabs)/index.tsx`

### Le bouton ⚠️ dans le topLayout

```typescript
const { alertType, setAlertType, clearAlert } = useAlert();
const { sendAlertReport } = useMessages();

const handleAlertSelect = (type: AlertType) => {
  setAlertType(type);      // met à jour le contexte → carte change
  sendAlertReport(type);   // envoie dans le chat
};

const handleAlertBtnPress = () => {
  if (alertType) {
    clearAlert();          // déjà actif → réinitialise
  } else {
    setModalOpen(true);    // pas actif → ouvre le modal
  }
};
```

**Comportement toggle :**
- 1er clic → modal s'ouvre
- Choix fait → marqueur change + message chat + bouton affiche l'emoji
- 2ème clic → tout est réinitialisé (marqueur par défaut, pas d'alerte)

### Style dynamique du bouton

```typescript
<TouchableOpacity
  style={[
    styles.alertTypeBtn,
    cfg ? { backgroundColor: cfg.color, borderColor: cfg.color } : null,
  ]}
  onPress={handleAlertBtnPress}
>
  <Text>{cfg ? cfg.emoji : '⚠️'}</Text>
  {cfg && <Text>{cfg.label}</Text>}
</TouchableOpacity>
```

Le style de base est gris neutre.
Quand un type est sélectionné, `cfg` est défini et le style couleur est appliqué.
`[styles.base, cfg ? styles.couleur : null]` → React Native fusionne les tableaux de styles.

---

## Schéma du flux complet

```
Utilisateur appuie sur ⚠️
       │
       ▼
AlertTypeModal s'ouvre
       │
Utilisateur choisit "Accident"
       │
       ├─── setAlertType('accident')
       │         │
       │         ▼
       │    AlertContext.alertType = 'accident'
       │         │
       │         ├─── MapScreen reçoit le changement (useEffect)
       │         │         │
       │         │         ▼
       │         │    webViewRef.postMessage({ type:'SET_ALERT', emoji:'🚗', color:'#FF6F00' })
       │         │         │
       │         │         ▼
       │         │    Leaflet : marker.setIcon(L.divIcon({ html:'<div>🚗</div>' }))
       │         │    Marqueur orange 🚗 s'affiche sur la carte ✅
       │         │
       │         └─── index.tsx re-render
       │                   │
       │                   ▼
       │              Bouton affiche 🚗 en orange ✅
       │
       └─── sendAlertReport('accident')
                 │
                 ▼
           socket.emit('sendMessage', { type:'report', alertType:'accident' })
                 │
                 ▼
           setMessages(prev => [...prev, reportMessage])
                 │
                 ▼
           Messages.tsx renderMessage → isReport === true
                 │
                 ▼
           Carte orange 🚗 ACCIDENT apparaît dans le chat ✅
```

---

## Points clés à retenir

| Concept | Explication |
|---|---|
| `AlertContext` | Partage l'état entre composants sans prop drilling |
| `postMessage` | Seul moyen de communiquer avec un WebView |
| `L.divIcon` | Marqueur Leaflet en HTML/CSS — supporte emoji et couleurs |
| `Record<K,V>` | TypeScript garantit qu'aucun type n'est oublié |
| Mise à jour optimiste | Message ajouté localement avant confirmation serveur |
| Toggle du bouton | 1er clic = ouvre modal / 2ème clic = réinitialise |
