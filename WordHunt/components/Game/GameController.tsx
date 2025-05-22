import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Modal, Card } from '@ui-kitten/components';
import GameBoard from './GameBoard';
// The ScoreBoard import uses GameController - let's define the component here to avoid circular dependency
// import ScoreBoard from './ScoreBoard';

// Inline ScoreBoard with StyleSheet instead of NativeWind
const ScoreBoard = ({ score, foundWords }: { score: number, foundWords: string[] }) => {
  return (
    <View style={styles.scoreContainer}>
      <View style={styles.scoreItem}>
        <Text category="s2">Score</Text>
        <Text category="h6">{score}</Text>
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

// Generate a list of target words for the player to find
const generateTargetWords = (): string[] => {
  // Convert the dictionary to an array for easier filtering
  const dictionaryArray = Array.from(DICTIONARY) as string[];
  
  // Filter words that are at least 4 letters
  const validWords = dictionaryArray.filter(word => word.length >= 4);
  
  // Randomly select 10 words
  const targetWords: string[] = [];
  const targetCount = Math.min(10, validWords.length);
  
  while (targetWords.length < targetCount) {
    const randomIndex = Math.floor(Math.random() * validWords.length);
    const word = validWords[randomIndex];
    
    if (!targetWords.includes(word)) {
      targetWords.push(word);
    }
  }
  
  return targetWords;
};

type GameState = {
  score: number;
  timeLeft: number;
  foundWords: string[];
  targetWords: string[];
  gameOver: boolean;
};

// Game durations based on difficulty
const GAME_DURATIONS = {
  EASY: Infinity, // No time limit
  MEDIUM: Infinity, // No time limit
  HARD: Infinity // No time limit
};

interface GameControllerProps {
  difficulty?: number; // 0: Easy, 1: Medium, 2: Hard
}

const GameController: React.FC<GameControllerProps> = ({ difficulty = 1 }) => {
  // Determine game duration based on difficulty
  const getGameDuration = () => {
    // Always return infinite time
    return Infinity;
  };
  
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: getGameDuration(),
    foundWords: [],
    targetWords: generateTargetWords(),
    gameOver: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [wordStatus, setWordStatus] = useState('');

  // Timer is disabled since we have infinite time
  /* 
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
  */

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
    
    // Check if word is a target word first (priority)
    if (gameState.targetWords.includes(word)) {
      // Calculate score with bonus for target words
      const wordScore = Math.max(1, word.length - 2);
      const bonusPoints = word.length;
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + wordScore + bonusPoints,
        foundWords: [...prev.foundWords, word]
      }));
      
      setWordStatus('Target word found!');
      return true;
    }
    
    // Check if word is in dictionary
    else if (DICTIONARY.has(word)) {
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
      timeLeft: getGameDuration(),
      foundWords: [],
      targetWords: generateTargetWords(),
      gameOver: false,
    });
    setShowModal(false);
    setWordStatus('');
  };

  // End game manually
  const endGameManually = () => {
    setGameState(prev => ({ ...prev, gameOver: true }));
    setShowModal(true);
  };

  // Calculate progress - how many target words found
  const calculateProgress = () => {
    const foundTargets = gameState.targetWords.filter(word => 
      gameState.foundWords.includes(word)
    ).length;
    
    return {
      found: foundTargets,
      total: gameState.targetWords.length,
      percentage: Math.round((foundTargets / gameState.targetWords.length) * 100)
    };
  };

  const progress = calculateProgress();

  return (
    <View style={styles.container}>
      <ScoreBoard 
        score={gameState.score} 
        foundWords={gameState.foundWords}
      />
      
      {/* End Game Button */}
      <View style={styles.endGameButtonContainer}>
        <Button 
          status="danger" 
          size="small" 
          onPress={endGameManually}
          style={styles.endGameButton}
        >
          End Game
        </Button>
      </View>
      
      <GameBoard 
        onWordSubmit={(word) => {
          setCurrentWord(word);
          return validateWord(word);
        }}
        wordStatus={wordStatus}
        foundWords={gameState.foundWords}
        targetWords={gameState.targetWords}
      />
      
      {/* Status message */}
      <View style={styles.statusContainer}>
        <Text 
          style={[
            styles.statusText,
            wordStatus === 'Valid word!' ? styles.validText : styles.invalidText
          ]}
        >
          {currentWord && wordStatus ? `${currentWord}: ${wordStatus}` : ''}
        </Text>
      </View>
      
      {/* Game over modal */}
      <Modal
        visible={showModal}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => {}}
      >
        <Card disabled={true} style={styles.modalCard}>
          <Text category="h4" style={styles.centerText}>Game Complete!</Text>
          <Text category="s1" style={[styles.centerText, styles.marginBottom]}>Your score: {gameState.score}</Text>
          <Text category="s1" style={[styles.centerText, styles.marginBottom]}>
            Target words found: {progress.found}/{progress.total} ({progress.percentage}%)
          </Text>
          <Text category="s1" style={[styles.centerText, styles.marginBottom]}>
            Total words found: {gameState.foundWords.length}
          </Text>
          
          <View style={[styles.wordsContainer, styles.marginBottom]}>
            <Text category="s2" style={styles.sectionTitle}>Target Words:</Text>
            <View style={styles.wordsGrid}>
              {gameState.targetWords.map(word => (
                <Text 
                  key={word}
                  style={[
                    styles.wordItem,
                    gameState.foundWords.includes(word) ? styles.foundTargetWord : styles.missedTargetWord
                  ]}
                >
                  {word}
                </Text>
              ))}
            </View>
            
            <Text category="s2" style={[styles.sectionTitle, styles.marginTop]}>All Found Words:</Text>
            <Text style={styles.centerText}>{gameState.foundWords.join(', ')}</Text>
          </View>
          
          <View style={styles.buttonRow}>
            <Button onPress={restartGame} style={styles.playAgainButton}>
              New Game
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
    backgroundColor: '#f9fafb',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  scoreItem: {
    alignItems: 'center',
  },
  redText: {
    color: '#ef4444',
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
    color: '#10b981', // green-500
  },
  invalidText: {
    color: '#ef4444', // red-500
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: 340,
    padding: 20,
    borderRadius: 16,
  },
  centerText: {
    textAlign: 'center',
  },
  marginBottom: {
    marginBottom: 16,
  },
  marginTop: {
    marginTop: 16,
  },
  wordsContainer: {
    maxHeight: 240,
    overflow: 'scroll',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  wordItem: {
    margin: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '500',
  },
  foundTargetWord: {
    backgroundColor: '#d1fae5',
    color: '#10b981',
  },
  missedTargetWord: {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
  },
  playAgainButton: {
    borderRadius: 24,
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  endGameButtonContainer: {
    alignItems: 'flex-end',
    padding: 12,
  },
  endGameButton: {
    borderRadius: 24,
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});

export default GameController; 