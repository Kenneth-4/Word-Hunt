import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Modal, Card } from '@ui-kitten/components';
import GameBoard from './GameBoard';
// The ScoreBoard import uses GameController - let's define the component here to avoid circular dependency
// import ScoreBoard from './ScoreBoard';

// Inline ScoreBoard with StyleSheet instead of NativeWind
const ScoreBoard = ({ score, timeLeft, foundWords }: { score: number, timeLeft: number, foundWords: string[] }) => {
  // Format time to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.scoreContainer}>
      <View style={styles.scoreItem}>
        <Text category="s2">Score</Text>
        <Text category="h6">{score}</Text>
      </View>
      
      <View style={styles.scoreItem}>
        <Text category="s2">Time</Text>
        <Text 
          category="h6" 
          style={timeLeft < 10 ? styles.redText : null}
        >
          {formatTime(timeLeft)}
        </Text>
      </View>
      
      <View style={styles.scoreItem}>
        <Text category="s2">Words</Text>
        <Text category="h6">{foundWords.length}</Text>
      </View>
    </View>
  );
};

// Sample English dictionary (in a real game, you'd have a much larger dictionary)
const DICTIONARY = new Set([
  'ACE', 'AID', 'AIL', 'AIM', 'AIR', 'ALE', 'ALL', 'ALP', 'AMP', 'AND', 'ANT', 'APE', 'APT', 'ARC', 'ARK', 'ARM',
  'ART', 'ASH', 'ASK', 'ASP', 'BAD', 'BAG', 'BAN', 'BAR', 'BAT', 'BAY', 'BED', 'BEE', 'BEG', 'BET', 'BIB', 'BID',
  'BIG', 'BIN', 'BIT', 'BOA', 'BOB', 'BOG', 'BOW', 'BOX', 'BOY', 'BUD', 'BUG', 'BUM', 'BUN', 'BUS', 'BUT', 'BUY',
  'CAB', 'CAD', 'CAM', 'CAN', 'CAP', 'CAR', 'CAT', 'COD', 'COG', 'CON', 'COP', 'COT', 'COW', 'CRY', 'CUB', 'CUE',
  'CUP', 'CUT', 'DAD', 'DAM', 'DAN', 'DAY', 'DEN', 'DEW', 'DID', 'DIE', 'DIG', 'DIM', 'DIN', 'DIP', 'DOG', 'DOT',
  'DRY', 'DUB', 'DUE', 'DUG', 'DYE', 'EAR', 'EAT', 'EBB', 'EEL', 'EGG', 'EGO', 'ELF', 'ELK', 'ELM', 'END', 'ERA',
  'EVE', 'EWE', 'EYE', 'FAD', 'FAN', 'FAR', 'FAT', 'FED', 'FEE', 'FEN', 'FEW', 'FIB', 'FIG', 'FIN', 'FIR', 'FIT',
  'FIX', 'FLU', 'FLY', 'FOE', 'FOG', 'FOR', 'FOX', 'FRY', 'FUN', 'FUR', 'GAG', 'GAP', 'GAS', 'GEL', 'GEM', 'GET',
  'GAME', 'GATE', 'GOAL', 'GOOD', 'HAVE', 'HELP', 'HOME', 'HOPE', 'IDEA', 'INFO', 'JOIN', 'KEEP', 'KIND', 'KNOW',
  'LAND', 'LIFE', 'LINE', 'LINK', 'LIST', 'LIVE', 'LOVE', 'MAKE', 'MANY', 'MARK', 'MEET', 'MIND', 'MOVE', 'MUST',
  'NAME', 'NEED', 'NEWS', 'NEXT', 'NICE', 'NOTE', 'OPEN', 'PAGE', 'PAIR', 'PARK', 'PART', 'PASS', 'PAST', 'PATH',
  'PLAN', 'PLAY', 'POST', 'PULL', 'PUSH', 'QUIT', 'RACE', 'READ', 'REAL', 'REST', 'RISE', 'RISK', 'ROAD', 'ROCK',
  'ROLE', 'ROOM', 'RULE', 'RUNS', 'SAFE', 'SAVE', 'SEAT', 'SEES', 'SELF', 'SEND', 'SETS', 'SHIP', 'SHOP', 'SHOW',
  'SIDE', 'SIGN', 'SITE', 'SIZE', 'SKIN', 'SOME', 'SORT', 'SPOT', 'STAR', 'STAY', 'STEP', 'STOP', 'SUCH', 'SURE',
  'TAKE', 'TALK', 'TASK', 'TEAM', 'TELL', 'TERM', 'TEST', 'TEXT', 'THAN', 'THAT', 'THEM', 'THEN', 'THEY', 'THIS',
  'TIME', 'TINY', 'TOLD', 'TOOK', 'TOOL', 'TRUE', 'TURN', 'TYPE', 'UNIT', 'UPON', 'USED', 'USER', 'VERY', 'VIEW',
  'VOTE', 'WAIT', 'WALK', 'WANT', 'WARM', 'WASH', 'WAVE', 'WAYS', 'WEAK', 'WEAR', 'WEEK', 'WELL', 'WENT', 'WERE',
  'WEST', 'WHAT', 'WHEN', 'WHOM', 'WIDE', 'WIFE', 'WILD', 'WILL', 'WIND', 'WINE', 'WING', 'WIRE', 'WISE', 'WISH',
  'WITH', 'WOOD', 'WORD', 'WORK', 'YEAR', 'YOUR', 'ZERO', 'ZONE'
]);

type GameState = {
  score: number;
  timeLeft: number;
  foundWords: string[];
  gameOver: boolean;
};

const GAME_DURATION = 60; // 60 seconds

const GameController: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: GAME_DURATION,
    foundWords: [],
    gameOver: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [wordStatus, setWordStatus] = useState('');

  // Timer countdown
  useEffect(() => {
    if (gameState.timeLeft > 0 && !gameState.gameOver) {
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (gameState.timeLeft === 0) {
      setGameState(prev => ({ ...prev, gameOver: true }));
      setShowModal(true);
    }
  }, [gameState.timeLeft, gameState.gameOver]);

  // Validate word
  const validateWord = (word: string) => {
    // Word must be at least 3 letters
    if (word.length < 3) {
      setWordStatus('Too short');
      return false;
    }
    
    // Check if word already found
    if (gameState.foundWords.includes(word)) {
      setWordStatus('Already found');
      return false;
    }
    
    // Check if word is in dictionary
    if (DICTIONARY.has(word)) {
      // Calculate score (1 point per letter after 2 letters)
      const wordScore = Math.max(1, word.length - 2);
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + wordScore,
        foundWords: [...prev.foundWords, word]
      }));
      
      setWordStatus('Valid word!');
      return true;
    } else {
      setWordStatus('Not in dictionary');
      return false;
    }
  };

  // Restart game
  const restartGame = () => {
    setGameState({
      score: 0,
      timeLeft: GAME_DURATION,
      foundWords: [],
      gameOver: false,
    });
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <ScoreBoard 
        score={gameState.score} 
        timeLeft={gameState.timeLeft} 
        foundWords={gameState.foundWords}
      />
      
      <GameBoard 
        onWordSubmit={(word) => {
          setCurrentWord(word);
          validateWord(word);
        }}
      />
      
      {/* Status message */}
      {wordStatus && (
        <View style={styles.statusContainer}>
          <Text 
            style={[
              styles.statusText,
              wordStatus === 'Valid word!' ? styles.validText : styles.invalidText
            ]}
          >
            {wordStatus}
          </Text>
        </View>
      )}
      
      {/* Game over modal */}
      <Modal
        visible={showModal}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => {}}
      >
        <Card disabled={true} style={styles.modalCard}>
          <Text category="h4" style={styles.centerText}>Game Over!</Text>
          <Text category="s1" style={[styles.centerText, styles.marginBottom]}>Your score: {gameState.score}</Text>
          <Text category="s1" style={[styles.centerText, styles.marginBottom]}>Words found: {gameState.foundWords.length}</Text>
          
          <View style={[styles.wordsContainer, styles.marginBottom]}>
            <Text category="s2" style={styles.centerText}>Words:</Text>
            <Text style={styles.centerText}>{gameState.foundWords.join(', ')}</Text>
          </View>
          
          <Button onPress={restartGame}>Play Again</Button>
        </Card>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  scoreItem: {
    alignItems: 'center',
  },
  redText: {
    color: 'red',
  },
  statusContainer: {
    alignItems: 'center', 
    marginTop: 8,
  },
  statusText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  validText: {
    color: '#22c55e', // green-600
  },
  invalidText: {
    color: '#ef4444', // red-500
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: 300,
    padding: 16,
  },
  centerText: {
    textAlign: 'center',
  },
  marginBottom: {
    marginBottom: 16,
  },
  wordsContainer: {
    maxHeight: 160,
    overflow: 'scroll',
  },
});

export default GameController; 