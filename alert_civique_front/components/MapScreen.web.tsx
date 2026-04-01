import { StyleSheet, View, Text } from 'react-native';

type MapScreenProps = {
  onMapReady: () => void;
};

export default function MapScreen({ onMapReady }: MapScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Carte non disponible sur web</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    color: '#888',
    fontSize: 16,
  },
});
