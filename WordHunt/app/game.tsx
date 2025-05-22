import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet, BackHandler } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Button, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import GameController from '../components/Game/GameController';
import { useFocusEffect } from '@react-navigation/native';

export default function GameScreen() {
  const router = useRouter();
  // Use a default difficulty of medium (1)
  const [difficulty] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Make sure component is fully loaded
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Handle back button press
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        router.replace('/');
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, [router])
  );

  const goBack = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <Button
          appearance="ghost"
          accessoryLeft={() => <Ionicons name="arrow-back" size={24} color="#4f46e5" />}
          onPress={goBack}
          style={styles.backButton}
        />
      </View>
      
      <View style={styles.content}>
        {isLoaded ? (
          <GameController difficulty={difficulty} />
        ) : (
          <View style={styles.loadingContainer}>
            <Text category="h4">Loading game...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    height: 56,
    justifyContent: 'center',
  },
  backButton: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 