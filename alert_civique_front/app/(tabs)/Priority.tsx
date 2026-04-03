import { StyleSheet, View, Text } from 'react-native';

export default function PriorityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Priorité</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#dc2626',
  },
});
