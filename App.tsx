import React from 'react';
import { StyleSheet } from 'react-native';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <DashboardScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default App;
