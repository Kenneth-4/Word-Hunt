import React from 'react';
import { View } from 'react-native';
import { Text } from '@ui-kitten/components';

type ScoreBoardProps = {
  score: number;
  timeLeft: number;
  foundWords: string[];
};

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, timeLeft, foundWords }) => {
  // Format time to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-row justify-between px-4 py-2 bg-gray-100 rounded-b-xl">
      <View className="items-center">
        <Text category="s2">Score</Text>
        <Text category="h6">{score}</Text>
      </View>
      
      <View className="items-center">
        <Text category="s2">Time</Text>
        <Text 
          category="h6" 
          className={timeLeft < 10 ? 'text-red-500' : ''}
        >
          {formatTime(timeLeft)}
        </Text>
      </View>
      
      <View className="items-center">
        <Text category="s2">Words</Text>
        <Text category="h6">{foundWords.length}</Text>
      </View>
    </View>
  );
};

export default ScoreBoard; 