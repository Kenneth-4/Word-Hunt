import React, { useState, useRef, useEffect } from 'react';
import { View, Dimensions, Pressable, StyleSheet, Animated, GestureResponderEvent } from 'react-native';
import { Text, Card } from '@ui-kitten/components';
import * as Haptics from 'expo-haptics';

// Define letter tile dimensions based on screen size
const { width } = Dimensions.get('window');
const GRID_SIZE = 10;
const TILE_MARGIN = 2;
const TILE_SIZE = (width - 40) / GRID_SIZE - TILE_MARGIN * 2;

// Game letters
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Directions for word placement
const DIRECTIONS = [
  { x: 1, y: 0 }, // right
  { x: 0, y: 1 }, // down
  { x: 1, y: 1 }, // diagonal down-right
  { x: -1, y: 0 }, // left
  { x: 0, y: -1 }, // up
  { x: -1, y: -1 }, // diagonal up-left
  { x: 1, y: -1 }, // diagonal up-right
  { x: -1, y: 1 }, // diagonal down-left
];

// Generate a board with target words placed in it
const generateBoard = (targetWords: string[]) => {
  // Initialize empty board
  const board: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
  const placedWords: string[] = [];
  const wordPlacements: { word: string, positions: Position[] }[] = [];

  // Shuffle the target words to randomize placement priority
  const shuffledWords = [...targetWords].sort(() => Math.random() - 0.5);
  
  // Sort words by length (longest first) to ensure they get placed
  const sortedWords = shuffledWords.sort((a, b) => b.length - a.length);

  // Try to place each word
  for (const word of sortedWords) {
    // Only try to place words that fit in the grid
    if (word.length <= GRID_SIZE) {
      const result = placeWord(word, board);
      if (result.success) {
        placedWords.push(word);
        wordPlacements.push({ word, positions: result.positions });
        
        // Apply the placement to the board
        result.positions.forEach((pos, index) => {
          board[pos.row][pos.col] = word.charAt(index);
        });
      }
    }
  }

  // Fill remaining empty spaces with random letters
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (board[i][j] === '') {
        board[i][j] = LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
      }
    }
  }

  return { board, wordPlacements };
};

// Try to place a word on the board
const placeWord = (word: string, board: string[][]) => {
  // Try 100 random positions and directions
  for (let attempt = 0; attempt < 100; attempt++) {
    const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const startRow = Math.floor(Math.random() * GRID_SIZE);
    const startCol = Math.floor(Math.random() * GRID_SIZE);

    // Check if word fits in this direction
    let fits = true;
    const positions: Position[] = [];

    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * direction.y;
      const col = startCol + i * direction.x;

      // Check if position is within bounds
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
        fits = false;
        break;
      }

      // Check if cell is empty or has the same letter
      if (board[row][col] !== '' && board[row][col] !== word.charAt(i)) {
        fits = false;
        break;
      }

      positions.push({ row, col });
    }

    if (fits) {
      return { success: true, positions };
    }
  }

  return { success: false, positions: [] };
};

type Position = {
  row: number;
  col: number;
};

type GameBoardProps = {
  onWordSubmit: (word: string) => void;
  wordStatus?: string;
  foundWords: string[];
  targetWords?: string[];
};

const GameBoard: React.FC<GameBoardProps> = ({ 
  onWordSubmit, 
  wordStatus, 
  foundWords,
  targetWords = [] 
}) => {
  const [boardData, setBoardData] = useState(() => generateBoard(targetWords));
  const [board, setBoard] = useState(boardData.board);
  const [wordPlacements, setWordPlacements] = useState(boardData.wordPlacements);
  const [selectedTiles, setSelectedTiles] = useState<Position[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [highlightedPositions, setHighlightedPositions] = useState<Position[][]>([]);
  const [lastValidWord, setLastValidWord] = useState<string | null>(null);
  const [wordSlideAnim] = useState(new Animated.Value(0));
  const [pendingWord, setPendingWord] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Animation references
  const tileScaleAnim = useRef<{[key: string]: Animated.Value}>({});
  const successAnim = useRef(new Animated.Value(0));
  
  // Regenerate board when target words change
  useEffect(() => {
    const newBoardData = generateBoard(targetWords);
    setBoardData(newBoardData);
    setBoard(newBoardData.board);
    setWordPlacements(newBoardData.wordPlacements);
    setHighlightedPositions([]);
  }, [targetWords]);
  
  // Effect to automatically check word when it's at least 3 letters
  useEffect(() => {
    if (currentWord.length >= 3) {
      // Create a sliding animation for the word
      const prevWord = currentWord;
      
      // Start the slide out animation
      wordSlideAnim.setValue(0);
      setPendingWord(prevWord);
      
      Animated.timing(wordSlideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        // Submit the word after animation completes
        const isValid = onWordSubmit(prevWord);
        
        // Add to highlighted positions if valid
        if (wordStatus === 'Valid word!' && 
            !highlightedPositions.some(positions => 
              positions.length === selectedTiles.length && 
              positions.every((pos, idx) => pos.row === selectedTiles[idx].row && pos.col === selectedTiles[idx].col)
            )) {
          setHighlightedPositions(prev => [...prev, [...selectedTiles]]);
        }
        
        // Reset selection
        setSelectedTiles([]);
        setCurrentWord('');
        setPendingWord('');
        wordSlideAnim.setValue(0);
        setIsDragging(false);
      });
    }
  }, [currentWord]);
  
  // Run success animation when a word is valid
  useEffect(() => {
    if ((wordStatus === 'Valid word!' || wordStatus === 'Target word found!') && pendingWord) {
      // Trigger haptic feedback for success
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Set the last valid word for the animation
      setLastValidWord(pendingWord);
      
      // Run the success animation
      successAnim.current.setValue(0);
      Animated.timing(successAnim.current, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {
        // Clear the last valid word after animation completes
        setTimeout(() => setLastValidWord(null), 500);
      });
    }
  }, [wordStatus, pendingWord]);
  
  // Check if a position is already selected
  const isSelected = (row: number, col: number) => {
    return selectedTiles.some(pos => pos.row === row && pos.col === col);
  };

  // Check if a position is in a successfully found word
  const isHighlighted = (row: number, col: number) => {
    return highlightedPositions.some(positions => 
      positions.some(pos => pos.row === row && pos.col === col)
    );
  };

  // Get the color for a highlighted position
  const getHighlightColor = (row: number, col: number) => {
    // Cycle through different colors for different words
    const colors = ['#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];
    
    for (let i = 0; i < highlightedPositions.length; i++) {
      if (highlightedPositions[i].some(pos => pos.row === row && pos.col === col)) {
        return colors[i % colors.length];
      }
    }
    return '#3b82f6'; // Default blue
  };

  // Check if a position is adjacent to the last selected tile
  const isAdjacent = (row: number, col: number) => {
    if (selectedTiles.length === 0) return true;
    
    const lastPos = selectedTiles[selectedTiles.length - 1];
    const rowDiff = Math.abs(row - lastPos.row);
    const colDiff = Math.abs(col - lastPos.col);
    
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  };

  // Handle press on a tile
  const handleTilePress = (row: number, col: number) => {
    // Don't allow selection if we're processing a word
    if (pendingWord) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate the tile
    animateTile(row, col);
    
    if (isSelected(row, col)) {
      // If it's the last selected tile, remove it
      if (selectedTiles.length > 0 && 
          selectedTiles[selectedTiles.length - 1].row === row && 
          selectedTiles[selectedTiles.length - 1].col === col) {
        setSelectedTiles(prev => prev.slice(0, -1));
        setCurrentWord(prev => prev.slice(0, -1));
      }
    } else if (isAdjacent(row, col)) {
      // Add new tile to selection
      setSelectedTiles(prev => [...prev, { row, col }]);
      setCurrentWord(prev => prev + board[row][col]);
    }
  };

  // Animate a tile
  const animateTile = (row: number, col: number) => {
    const tileKey = `${row}-${col}`;
    if (!tileScaleAnim.current[tileKey]) {
      tileScaleAnim.current[tileKey] = new Animated.Value(1);
    }
    
    Animated.sequence([
      Animated.timing(tileScaleAnim.current[tileKey], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(tileScaleAnim.current[tileKey], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Handle entering a tile during drag
  const handleTileEnter = (row: number, col: number) => {
    if (!isDragging || pendingWord) return;
    
    // Only proceed if this is a new, adjacent, unselected tile
    if (!isSelected(row, col) && isAdjacent(row, col)) {
      handleTilePress(row, col);
    }
  };

  // Start dragging
  const handleDragStart = (row: number, col: number) => {
    setIsDragging(true);
    handleTilePress(row, col);
  };

  // End dragging and potentially submit word
  const handleDragEnd = () => {
    setIsDragging(false);
    
    // If we have a word of at least 3 letters, let the useEffect submit it
    // otherwise just keep the selection
  };

  // Animation interpolations for success animation
  const successScale = successAnim.current.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1]
  });
  
  const successOpacity = successAnim.current.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0]
  });
  
  // Animation for word sliding
  const wordSlideX = wordSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width]
  });
  
  const wordOpacity = wordSlideAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0, 0]
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text category="h1" style={styles.titleText}>Word Hunt</Text>
        <Text category="s1" style={styles.subtitleText}>Connect letters to form words</Text>
      </View>
      
      {/* Success animation */}
      {lastValidWord && (
        <Animated.View style={[
          styles.successAnimation,
          {
            opacity: successOpacity,
            transform: [{ scale: successScale }]
          },
          wordStatus === 'Target word found!' ? styles.targetFoundAnimation : null
        ]}>
          <Text style={styles.successText}>{lastValidWord}</Text>
          <Text style={styles.successSubtext}>
            {wordStatus === 'Target word found!' ? 'Target word found!' : 'Valid word!'}
          </Text>
          <Text style={styles.successPoints}>
            +{Math.max(1, lastValidWord.length - 2)} points
            {targetWords.includes(lastValidWord) ? ` (+${lastValidWord.length} bonus)` : ''}
          </Text>
        </Animated.View>
      )}
      
      {/* Target words display */}
      {targetWords.length > 0 && (
        <Card style={styles.targetWordsCard}>
          <View style={styles.targetWordsHeader}>
            <Text category="s1" style={styles.targetWordsTitle}>Words to Find:</Text>
            <Text style={styles.targetHint}>All words are hidden in the grid!</Text>
          </View>
          <View style={styles.targetWordsContainer}>
            {targetWords.map((word, index) => (
              <View 
                key={word} 
                style={[
                  styles.targetWordBadge,
                  foundWords.includes(word) ? styles.foundWordBadge : styles.unfoundWordBadge
                ]}
              >
                <Text 
                  style={[
                    styles.targetWordText,
                    foundWords.includes(word) ? styles.foundWordText : styles.unfoundWordText
                  ]}
                >
                  {word}
                </Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.wordProgress}>
            {foundWords.filter(word => targetWords.includes(word)).length} of {targetWords.length} target words found
          </Text>
        </Card>
      )}
      
      {/* Game board */}
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((letter, colIndex) => {
              const tileKey = `${rowIndex}-${colIndex}`;
              const tileSelected = isSelected(rowIndex, colIndex);
              const tileHighlighted = isHighlighted(rowIndex, colIndex);
              
              if (!tileScaleAnim.current[tileKey]) {
                tileScaleAnim.current[tileKey] = new Animated.Value(1);
              }
              
              return (
                <Animated.View
                  key={`tile-container-${tileKey}`}
                  style={[
                    { transform: [{ scale: tileScaleAnim.current[tileKey] }] }
                  ]}
                >
                  <Pressable
                    key={`tile-${tileKey}`}
                    onPressIn={() => handleDragStart(rowIndex, colIndex)}
                    onPressOut={handleDragEnd}
                    onTouchMove={() => handleTileEnter(rowIndex, colIndex)}
                    style={[
                      styles.tile,
                      tileSelected ? styles.selectedTile : tileHighlighted ? { backgroundColor: getHighlightColor(rowIndex, colIndex) } : styles.unselectedTile,
                      { width: TILE_SIZE, height: TILE_SIZE }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.tileText,
                        (tileSelected || tileHighlighted) ? styles.selectedTileText : styles.unselectedTileText
                      ]}
                    >
                      {letter}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        ))}
      </View>
      
      {/* Hint text */}
      <Text style={styles.hintText}>
        Slide your finger across letters to form words - all target words are hidden in the grid!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
  },
  headerContainer: {
    marginBottom: 16,
  },
  titleText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitleText: {
    textAlign: 'center',
    marginTop: 4,
    color: '#4b5563',
  },
  targetWordsCard: {
    marginBottom: 16,
    width: '90%',
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  targetWordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  targetWordsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  targetWordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  targetWordBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  foundWordBadge: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  unfoundWordBadge: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    borderWidth: 1,
  },
  targetWordText: {
    fontWeight: 'bold',
  },
  foundWordText: {
    color: '#10b981',
    textDecorationLine: 'line-through',
  },
  unfoundWordText: {
    color: '#6b7280',
  },
  wordDisplay: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 60,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  wordContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    margin: TILE_MARGIN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedTile: {
    backgroundColor: '#3b82f6', // blue-500
  },
  unselectedTile: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tileText: {
    fontWeight: 'bold',
    fontSize: TILE_SIZE * 0.5,
  },
  selectedTileText: {
    color: 'white',
  },
  unselectedTileText: {
    color: '#1f2937',
  },
  hintText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  statusIndicator: {
    marginTop: 4,
    fontWeight: 'bold',
  },
  validIndicator: {
    color: '#10b981', // green-500
  },
  invalidIndicator: {
    color: '#ef4444', // red-500
  },
  targetIndicator: {
    color: '#10b981', // green-500
  },
  successAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.7)', // indigo with transparency
    zIndex: 10,
    borderRadius: 16,
  },
  successText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  successSubtext: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  successPoints: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  targetFoundAnimation: {
    backgroundColor: 'rgba(16, 185, 129, 0.8)', // Green with opacity
  },
  targetHint: {
    color: '#6b7280',
    fontSize: 14,
  },
  wordProgress: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 14,
  },
});

export default GameBoard; 