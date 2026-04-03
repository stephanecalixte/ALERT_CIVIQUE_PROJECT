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
        <View style={styles.innerContainer}>
          <Text style={styles.sosText}>SOS</Text>
        </View>
        
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
});
