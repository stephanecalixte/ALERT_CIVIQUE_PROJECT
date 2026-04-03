import React, { useEffect, useRef } from "react";
import { Animated, Easing, StatusBar, StyleSheet, View } from "react-native";
import WebView from "react-native-webview";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

// ─── Son de démarrage via Web Audio API ───────────────────────────────────────
const STARTUP_SOUND_HTML = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body>
<script>
(function() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();

    function playNote(freq, startTime, duration, gain) {
      var osc  = ctx.createOscillator();
      var env  = ctx.createGain();
      osc.connect(env);
      env.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      env.gain.setValueAtTime(0, startTime);
      env.gain.linearRampToValueAtTime(gain, startTime + 0.03);
      env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    }

    var t = ctx.currentTime + 0.05;
    playNote(880,  t,        1.4, 0.18);
    playNote(1320, t + 0.05, 1.2, 0.12);
    playNote(1760, t + 0.10, 1.0, 0.07);
    playNote(2200, t + 0.15, 0.8, 0.04);
  } catch(e) {}
})();
</script>
</body>
</html>`;

// ─── Logo bouclier ────────────────────────────────────────────────────────────
function ShieldLogo({ size = 160 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 100 110">
      <Defs>
        <LinearGradient id="shieldG" x1="20%" y1="0%" x2="80%" y2="100%">
          <Stop offset="0%"   stopColor="#1A8FFF" />
          <Stop offset="100%" stopColor="#0044CC" />
        </LinearGradient>
      </Defs>
      <Path
        d="M50 4 C50 4 82 15 86 20 L86 54 Q86 82 50 98 Q14 82 14 54 L14 20 C18 15 50 4 50 4 Z"
        fill="url(#shieldG)"
      />
      <Path
        d="M50 6 C50 6 78 16 82 21 L82 36 Q66 30 50 28 Q34 30 18 36 L18 21 C22 16 50 6 50 6 Z"
        fill="white" fillOpacity={0.10}
      />
      <Rect x={36} y={62} width={28}  height={22} rx={7}   fill="white" fillOpacity={0.97} />
      <Rect x={36} y={38} width={6.5} height={26} rx={3.2} fill="white" fillOpacity={0.97} />
      <Rect x={44} y={33} width={6.5} height={31} rx={3.2} fill="white" fillOpacity={0.97} />
      <Rect x={52} y={34} width={6.5} height={30} rx={3.2} fill="white" fillOpacity={0.97} />
      <Rect x={60} y={40} width={6.5} height={24} rx={3.2} fill="white" fillOpacity={0.97} />
      <Rect x={27} y={55} width={9}   height={16} rx={4.5} fill="white" fillOpacity={0.97} />
      <Path d="M31 34 Q50 20 69 34" fill="none" stroke="#FF6600" strokeWidth={3.8} strokeLinecap="round" />
      <Path d="M38 34 Q50 25 62 34" fill="none" stroke="#FF8833" strokeWidth={2.6} strokeLinecap="round" strokeOpacity={0.72} />
      <Path d="M44 34 Q50 29 56 34" fill="none" stroke="#FFAA66" strokeWidth={2}   strokeLinecap="round" strokeOpacity={0.45} />
      <Circle cx={50} cy={36} r={3.2} fill="#FF6600" />
    </Svg>
  );
}

const APPLE_EASING = Easing.bezier(0.25, 0.1, 0.25, 1.0);

export default function LoadingPage() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.92)).current;
  const pulse   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: APPLE_EASING,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 700,
          easing: APPLE_EASING,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, {
              toValue: 1.05,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(pulse, {
              toValue: 1,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }, 120);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* WebView hors écran — son uniquement */}
      <WebView
        source={{ html: STARTUP_SOUND_HTML }}
        style={styles.hiddenWebView}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
        scrollEnabled={false}
      />

      {/* Logo centré */}
      <View style={styles.logoWrapper}>
        <Animated.View style={{ opacity, transform: [{ scale: Animated.multiply(scale, pulse) }] }}>
          <ShieldLogo size={170} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
  },
  logoWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  hiddenWebView: {
    position: "absolute",
    top: -500,
    left: -500,
    width: 100,
    height: 100,
  },
});
