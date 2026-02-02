import { useState, useEffect, useCallback } from 'react';
import { TrainingLine } from '@/lib/courseLines';

export interface CustomLineData extends TrainingLine {
  id: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'openings4free_custom_lines';

export const useCustomLines = (courseId: string) => {
  const [customLines, setCustomLines] = useState<CustomLineData[]>(() => {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const allLines: CustomLineData[] = JSON.parse(stored);
        return allLines.filter(l => l.id.startsWith(`${courseId}_`));
      } catch {
        return [];
      }
    }
    return [];
  });

  // Reload when courseId changes
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const allLines: CustomLineData[] = JSON.parse(stored);
        setCustomLines(allLines.filter(l => l.id.startsWith(`${courseId}_`)));
      } catch {
        setCustomLines([]);
      }
    } else {
      setCustomLines([]);
    }
  }, [courseId]);

  const saveToStorage = useCallback((lines: CustomLineData[]) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let allLines: CustomLineData[] = [];
    
    if (stored) {
      try {
        allLines = JSON.parse(stored);
        // Remove lines for this course
        allLines = allLines.filter(l => !l.id.startsWith(`${courseId}_`));
      } catch {
        allLines = [];
      }
    }
    
    // Add updated lines for this course
    allLines = [...allLines, ...lines];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLines));
  }, [courseId]);

  const addLine = useCallback((name: string, moves: string[], category: string = 'Custom') => {
    const newLine: CustomLineData = {
      id: `${courseId}_${Date.now()}`,
      name,
      moves,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomLines(prev => {
      const updated = [...prev, newLine];
      saveToStorage(updated);
      return updated;
    });

    return newLine;
  }, [courseId, saveToStorage]);

  const updateLine = useCallback((id: string, updates: Partial<Pick<CustomLineData, 'name' | 'moves' | 'category'>>) => {
    setCustomLines(prev => {
      const updated = prev.map(line => {
        if (line.id === id) {
          return {
            ...line,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return line;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const deleteLine = useCallback((id: string) => {
    setCustomLines(prev => {
      const updated = prev.filter(line => line.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const getLineById = useCallback((id: string) => {
    return customLines.find(line => line.id === id);
  }, [customLines]);

  return {
    customLines,
    addLine,
    updateLine,
    deleteLine,
    getLineById,
  };
};

// Get all custom lines for all courses
export const getAllCustomLines = (): CustomLineData[] => {
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
};
