import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LearnedLineData {
  id?: string;
  courseId: string;
  lineIndex: number;
  completedAt: string;
  accuracy: number;
}

const LOCAL_STORAGE_KEY = 'openings4free_learned_lines';

const getLocalLearnedLines = (): LearnedLineData[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setLocalLearnedLines = (lines: LearnedLineData[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lines));
};

export const useLearnedLines = () => {
  const { user, isAuthenticated } = useAuth();
  const [learnedLines, setLearnedLines] = useState<LearnedLineData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch learned lines from database or localStorage
  const fetchLearnedLines = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        const { data, error } = await supabase
          .from('learned_lines')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        setLearnedLines(
          (data || []).map((row) => ({
            id: row.id,
            courseId: row.course_id,
            lineIndex: row.line_index,
            completedAt: row.completed_at,
            accuracy: Number(row.accuracy),
          }))
        );
      } catch (error) {
        console.error('Error fetching learned lines:', error);
      }
    } else {
      // Use localStorage for non-authenticated users
      setLearnedLines(getLocalLearnedLines());
    }
    setLoading(false);
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchLearnedLines();
  }, [fetchLearnedLines]);

  const markLineAsLearned = useCallback(
    async (courseId: string, lineIndex: number, accuracy: number) => {
      if (isAuthenticated && user) {
        try {
          const existing = learnedLines.find(
            (l) => l.courseId === courseId && l.lineIndex === lineIndex
          );

          if (existing) {
            if (accuracy > existing.accuracy) {
              const { error } = await supabase
                .from('learned_lines')
                .update({
                  accuracy,
                  completed_at: new Date().toISOString(),
                })
                .eq('id', existing.id);

              if (error) throw error;

              setLearnedLines((prev) =>
                prev.map((l) =>
                  l.id === existing.id
                    ? { ...l, accuracy, completedAt: new Date().toISOString() }
                    : l
                )
              );
            }
          } else {
            const { data, error } = await supabase
              .from('learned_lines')
              .insert({
                user_id: user.id,
                course_id: courseId,
                line_index: lineIndex,
                accuracy,
              })
              .select()
              .single();

            if (error) throw error;

            setLearnedLines((prev) => [
              ...prev,
              {
                id: data.id,
                courseId: data.course_id,
                lineIndex: data.line_index,
                completedAt: data.completed_at,
                accuracy: Number(data.accuracy),
              },
            ]);
          }
        } catch (error) {
          console.error('Error marking line as learned:', error);
        }
      } else {
        // localStorage fallback for non-authenticated users
        const existing = learnedLines.find(
          (l) => l.courseId === courseId && l.lineIndex === lineIndex
        );

        let updated: LearnedLineData[];
        if (existing) {
          if (accuracy > existing.accuracy) {
            updated = learnedLines.map((l) =>
              l.courseId === courseId && l.lineIndex === lineIndex
                ? { ...l, accuracy, completedAt: new Date().toISOString() }
                : l
            );
          } else {
            return;
          }
        } else {
          updated = [
            ...learnedLines,
            {
              id: `local-${Date.now()}`,
              courseId,
              lineIndex,
              completedAt: new Date().toISOString(),
              accuracy,
            },
          ];
        }
        setLearnedLines(updated);
        setLocalLearnedLines(updated);
      }
    },
    [user, isAuthenticated, learnedLines]
  );

  const getLearnedLinesForCourse = useCallback(
    (courseId: string): LearnedLineData[] => {
      return learnedLines.filter((l) => l.courseId === courseId);
    },
    [learnedLines]
  );

  const isLineLearned = useCallback(
    (courseId: string, lineIndex: number): boolean => {
      return learnedLines.some(
        (l) => l.courseId === courseId && l.lineIndex === lineIndex
      );
    },
    [learnedLines]
  );

  const getLearnedCount = useCallback(
    (courseId: string): number => {
      return learnedLines.filter((l) => l.courseId === courseId).length;
    },
    [learnedLines]
  );

  return {
    learnedLines,
    loading,
    markLineAsLearned,
    getLearnedLinesForCourse,
    isLineLearned,
    getLearnedCount,
  };
};
