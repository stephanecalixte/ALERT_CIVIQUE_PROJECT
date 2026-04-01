import { StyleSheet, View, Text } from 'react-native';

const NativeMap = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Carte non disponible sur web</Text>
    </View>
  );
};

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

export default NativeMap;
