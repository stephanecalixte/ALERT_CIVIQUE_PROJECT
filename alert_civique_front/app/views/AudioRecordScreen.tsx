import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useVideoUpload } from '@/hooks/useVideoUpload';

interface AudioRecordScreenProps {
  onClose?: () => void;
}

export default function AudioRecordScreen({ onClose }: AudioRecordScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [recording, setRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const cameraReady = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { uploadVideo } = useVideoUpload(undefined, undefined);

  // Pulse animation when recording
  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const onCameraReady = useCallback(() => {
    cameraReady.current = true;
  }, []);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current || !cameraReady.current) return;
    try {
      setRecording(true);
      const video = await cameraRef.current.recordAsync({ maxDuration: 300 });
      if (video?.uri) {
        setIsUploading(true);
        await uploadVideo(video.uri, 0);
        setIsUploading(false);
        onClose?.();
      }
    } catch (e) {
      console.error('❌ Audio recording error:', e);
      setRecording(false);
      setIsUploading(false);
    }
  }, [uploadVideo, onClose]);

  const stopRecording = useCallback(() => {
    cameraRef.current?.stopRecording();
    setRecording(false);
  }, []);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#007AFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Permission microphone requise</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Autoriser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isUploading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.uploadText}>Enregistrement audio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera hidden behind the UI — needed for recordAsync */}
      <View style={styles.hiddenCamera}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="front"
          mode="video"
          onCameraReady={onCameraReady}
        />
      </View>

      {/* Audio recorder UI */}
      <View style={styles.ui}>
        {onClose && !recording && (
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#555" />
          </TouchableOpacity>
        )}

        <Text style={styles.title}>Enregistrement audio</Text>

        <Animated.View style={[styles.micCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="mic" size={56} color={recording ? '#FF3B30' : '#007AFF'} />
        </Animated.View>

        {recording && (
          <Text style={styles.timer}>{formatTime(elapsed)}</Text>
        )}

        {recording ? (
          <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
            <View style={styles.stopSquare} />
            <Text style={styles.btnLabel}>Arrêter</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startBtn} onPress={startRecording}>
            <Ionicons name="mic" size={28} color="white" />
            <Text style={styles.startBtnText}>Commencer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  hiddenCamera: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  ui: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 28,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    gap: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8ecf0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#a3b1c6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.3,
  },
  micCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e8ecf0',
    justifyContent: 'center',
    alignItems: 'center',
    // Neumorphism
    shadowColor: '#a3b1c6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1.5,
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderBottomColor: '#c4cdd8',
    borderRightColor: '#c4cdd8',
  },
  timer: {
    fontSize: 42,
    fontWeight: '200',
    color: '#FF3B30',
    letterSpacing: 2,
  },
  startBtn: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  startBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  stopBtn: {
    alignItems: 'center',
    gap: 8,
  },
  stopSquare: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  btnLabel: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
  },
  permText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  permBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
});
