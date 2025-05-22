import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Platform, BackHandler } from 'react-native';
import { Text, Button, ButtonGroup, Card, Modal } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

const HomeScreen = () => {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState(1); // 0: Easy, 1: Medium, 2: Hard
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Exit the app (Android only)
  const handleExit = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  };

  // Play haptic feedback on button press
  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const startGame = () => {
    handleButtonPress();
    // Use a more reliable navigation approach
    router.replace('/game');
  };

  // Add a simple direct navigation option
  const handlePlayNow = () => {
    console.log('Play button pressed');
    handleButtonPress();
    // Try direct navigation
    router.replace('/game');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text category="h1" style={styles.title}>Word Hunt</Text>
        <Text category="s1" style={styles.subtitle}>Find words, score points!</Text>
      </View>
      
      <View style={styles.gameCard}>
        <View style={styles.logoContainer}>
          <Text category="h1" style={styles.logoText}>W</Text>
          <Text category="h1" style={[styles.logoText, styles.logoAccent]}>H</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.playButtonTouchable}
          onPress={handlePlayNow}
          activeOpacity={0.7}
        >
          <Text style={styles.playButtonText}>PLAY NOW</Text>
        </TouchableOpacity>
        
        <View style={styles.difficultyContainer}>
          <Text category="s1" style={styles.difficultyLabel}>Difficulty:</Text>
          <ButtonGroup style={styles.difficultyButtons} appearance="outline">
            <Button 
              onPress={() => setDifficulty(0)}
              status={difficulty === 0 ? 'primary' : 'basic'}
            >
              Easy
            </Button>
            <Button 
              onPress={() => setDifficulty(1)}
              status={difficulty === 1 ? 'primary' : 'basic'}
            >
              Medium
            </Button>
            <Button 
              onPress={() => setDifficulty(2)}
              status={difficulty === 2 ? 'primary' : 'basic'}
            >
              Hard
            </Button>
          </ButtonGroup>
        </View>
      </View>
      
      <View style={styles.bottomButtons}>
        <Button 
          appearance="ghost" 
          style={styles.menuButton}
          onPress={() => {
            handleButtonPress();
            setShowSettingsModal(true);
          }}
        >
          Settings
        </Button>
        
        <Button 
          appearance="ghost" 
          status="danger" 
          style={styles.menuButton}
          onPress={() => {
            handleButtonPress();
            setShowExitModal(true);
          }}
        >
          Exit
        </Button>
      </View>
      
      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setShowSettingsModal(false)}
      >
        <Card style={styles.modal}>
          <Text category="h5" style={styles.modalTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <Text category="s1">Sound Effects</Text>
            <Button appearance="outline" size="small">ON</Button>
          </View>
          
          <View style={styles.settingItem}>
            <Text category="s1">Music</Text>
            <Button appearance="outline" size="small">ON</Button>
          </View>
          
          <View style={styles.settingItem}>
            <Text category="s1">Vibration</Text>
            <Button appearance="outline" size="small">ON</Button>
          </View>
          
          <Button 
            onPress={() => setShowSettingsModal(false)}
            style={styles.modalButton}
          >
            CLOSE
          </Button>
        </Card>
      </Modal>
      
      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitModal}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setShowExitModal(false)}
      >
        <Card style={styles.modal}>
          <Text category="h5" style={styles.modalTitle}>Exit Game?</Text>
          <Text style={styles.modalText}>Are you sure you want to exit Word Hunt?</Text>
          
          <View style={styles.modalButtons}>
            <Button 
              appearance="outline" 
              status="basic"
              style={styles.modalButtonHalf}
              onPress={() => setShowExitModal(false)}
            >
              CANCEL
            </Button>
            
            <Button 
              status="danger"
              style={styles.modalButtonHalf}
              onPress={handleExit}
            >
              EXIT
            </Button>
          </View>
        </Card>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 16,
  },
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 128,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  logoAccent: {
    color: '#4f46e5',
  },
  playButtonTouchable: {
    borderRadius: 16,
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#4f46e5',
    padding: 16,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  difficultyContainer: {
    width: '100%',
  },
  difficultyLabel: {
    marginBottom: 8,
    color: '#4b5563',
  },
  difficultyButtons: {
    width: '100%',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  menuButton: {
    marginHorizontal: 8,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    width: 300,
    padding: 16,
    borderRadius: 16,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#4b5563',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalButton: {
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButtonHalf: {
    width: '48%',
  },
});

export default HomeScreen;
