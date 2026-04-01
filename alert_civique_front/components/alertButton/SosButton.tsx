import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function SosButton() {
  const router = useRouter();

  const launchSOSLiveStream = () => {
    console.log('=== 🚨 SOS ACTIVATED - LIVE STREAM START ===');
    router.push({ pathname: '/LiveStream', params: { autoStart: 'true' } });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={launchSOSLiveStream}
        style={styles.sosButton}
        activeOpacity={0.8}
      >
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
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
    backgroundColor: '#FF0000',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  sosText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
