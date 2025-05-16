import React, { useState } from 'react';
import { View, Dimensions, Pressable, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import * as Haptics from 'expo-haptics';

// Define letter tile dimensions based on screen size
const { width } = Dimensions.get('window');
const GRID_SIZE = 4;
const TILE_MARGIN = 4;
const TILE_SIZE = (width - 40) / GRID_SIZE - TILE_MARGIN * 2;

// Game letters
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Generate random board
const generateBoard = () => {
  const board = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    const row = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      row.push(LETTERS.charAt(Math.floor(Math.random() * LETTERS.length)));
    }
    board.push(row);
  }
  return board;
};

type Position = {
  row: number;
  col: number;
};

type GameBoardProps = {
  onWordSubmit: (word: string) => void;
};

const GameBoard: React.FC<GameBoardProps> = ({ onWordSubmit }) => {
  const [board, setBoard] = useState(generateBoard());
  const [selectedTiles, setSelectedTiles] = useState<Position[]>([]);
  const [currentWord, setCurrentWord] = useState('');

  // Check if a position is already selected
  const isSelected = (row: number, col: number) => {
    return selectedTiles.some(pos => pos.row === row && pos.col === col);
  };

  // Check if a position is adjacent to the last selected tile
  const isAdjacent = (row: number, col: number) => {
    if (selectedTiles.length === 0) return true;
    
    const lastPos = selectedTiles[selectedTiles.length - 1];
    const rowDiff = Math.abs(row - lastPos.row);
    const colDiff = Math.abs(col - lastPos.col);
    
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  };

  // Handle tile selection
  const handleTilePress = (row: number, col: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
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

  // Reset the game
  const resetSelection = () => {
    if (currentWord.length >= 3) {
      onWordSubmit(currentWord);
    }
    setSelectedTiles([]);
    setCurrentWord('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text category="h1" style={styles.titleText}>Word Hunt</Text>
        <Text category="s1" style={styles.subtitleText}>Swipe to connect letters</Text>
      </View>
      
      {/* Current word display */}
      <View style={styles.wordDisplay}>
        <Text category="h5">{currentWord || 'Select letters'}</Text>
      </View>
      
      {/* Game board */}
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((letter, colIndex) => {
              const tileSelected = isSelected(rowIndex, colIndex);
              return (
                <Pressable
                  key={`tile-${rowIndex}-${colIndex}`}
                  onPress={() => handleTilePress(rowIndex, colIndex)}
                  style={[
                    styles.tile,
                    tileSelected ? styles.selectedTile : styles.unselectedTile,
                    { width: TILE_SIZE, height: TILE_SIZE }
                  ]}
                >
                  <Text 
                    category="h4" 
                    style={[
                      styles.tileText,
                      tileSelected ? styles.selectedTileText : styles.unselectedTileText
                    ]}
                  >
                    {letter}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      
      {/* Submit button */}
      <View style={styles.buttonContainer}>
        <Pressable 
          style={[
            styles.submitButton,
            currentWord.length >= 3 ? styles.enabledButton : styles.disabledButton
          ]}
          onPress={resetSelection}
          disabled={currentWord.length < 3}
        >
          <Text style={styles.buttonText}>
            {currentWord.length >= 3 ? 'Submit Word' : 'Select at least 3 letters'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  titleText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitleText: {
    textAlign: 'center',
    marginTop: 8,
  },
  wordDisplay: {
    backgroundColor: '#dbeafe', // blue-100
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 24,
    minHeight: 48,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    backgroundColor: '#f8f9fa', // gray-100
    padding: 16,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  selectedTile: {
    backgroundColor: '#3b82f6', // blue-500
  },
  unselectedTile: {
    backgroundColor: 'white',
  },
  tileText: {
    fontWeight: 'bold',
  },
  selectedTileText: {
    color: 'white',
  },
  unselectedTileText: {
    color: 'black',
  },
  buttonContainer: {
    marginTop: 32,
    width: '80%',
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  enabledButton: {
    backgroundColor: '#22c55e', // green-500
  },
  disabledButton: {
    backgroundColor: '#d1d5db', // gray-300
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GameBoard; 