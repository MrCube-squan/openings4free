import { useState, useEffect, useCallback } from 'react';

export interface LearnedLineData {
  courseId: string;
  lineIndex: number;
  completedAt: string;
  accuracy: number;
}

const STORAGE_KEY = 'openings4free_learned_lines';

export const useLearnedLines = () => {
  const [learnedLines, setLearnedLines] = useState<LearnedLineData[]>(() => {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(learnedLines));
  }, [learnedLines]);

  const markLineAsLearned = useCallback((courseId: string, lineIndex: number, accuracy: number) => {
    // Only mark as learned if accuracy >= 80%
    if (accuracy < 80) return;

    setLearnedLines(prev => {
      // Check if already exists
      const existingIndex = prev.findIndex(
        l => l.courseId === courseId && l.lineIndex === lineIndex
      );

      const newEntry: LearnedLineData = {
        courseId,
        lineIndex,
        completedAt: new Date().toISOString(),
        accuracy,
      };

      if (existingIndex >= 0) {
        // Update existing entry if new accuracy is better
        if (accuracy > prev[existingIndex].accuracy) {
          const updated = [...prev];
          updated[existingIndex] = newEntry;
          return updated;
        }
        return prev;
      }

      return [...prev, newEntry];
    });
  }, []);

  const getLearnedLinesForCourse = useCallback((courseId: string): LearnedLineData[] => {
    return learnedLines.filter(l => l.courseId === courseId);
  }, [learnedLines]);

  const isLineLearned = useCallback((courseId: string, lineIndex: number): boolean => {
    return learnedLines.some(
      l => l.courseId === courseId && l.lineIndex === lineIndex
    );
  }, [learnedLines]);

  const getLearnedCount = useCallback((courseId: string): number => {
    return learnedLines.filter(l => l.courseId === courseId).length;
  }, [learnedLines]);

  return {
    learnedLines,
    markLineAsLearned,
    getLearnedLinesForCourse,
    isLineLearned,
    getLearnedCount,
  };
};
