import { Button } from '@react-navigation/elements';
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

export default function Option() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button onPress={() => router.push("/views/OptionScreen")}>
        OK
      </Button>
    </View>
  );
}