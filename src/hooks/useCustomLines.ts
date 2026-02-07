import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { TrainingLine } from '@/lib/courseLines';

export interface CustomLineData extends TrainingLine {
  id: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export const useCustomLines = (courseId: string) => {
  const { user, isAuthenticated } = useAuth();
  const [customLines, setCustomLines] = useState<CustomLineData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch custom lines from database
  const fetchCustomLines = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCustomLines([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_lines')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (error) throw error;

      setCustomLines(
        (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          moves: row.moves,
          category: row.category,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching custom lines:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, courseId]);

  useEffect(() => {
    fetchCustomLines();
  }, [fetchCustomLines]);

  const addLine = useCallback(
    async (name: string, moves: string[], category: string = 'Custom') => {
      if (!isAuthenticated || !user) return null;

      try {
        const { data, error } = await supabase
          .from('custom_lines')
          .insert({
            user_id: user.id,
            course_id: courseId,
            name,
            moves,
            category,
          })
          .select()
          .single();

        if (error) throw error;

        const newLine: CustomLineData = {
          id: data.id,
          name: data.name,
          moves: data.moves,
          category: data.category,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setCustomLines((prev) => [...prev, newLine]);
        return newLine;
      } catch (error) {
        console.error('Error adding custom line:', error);
        return null;
      }
    },
    [user, isAuthenticated, courseId]
  );

  const updateLine = useCallback(
    async (
      id: string,
      updates: Partial<Pick<CustomLineData, 'name' | 'moves' | 'category'>>
    ) => {
      if (!isAuthenticated || !user) return;

      try {
        const { error } = await supabase
          .from('custom_lines')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        setCustomLines((prev) =>
          prev.map((line) =>
            line.id === id
              ? { ...line, ...updates, updatedAt: new Date().toISOString() }
              : line
          )
        );
      } catch (error) {
        console.error('Error updating custom line:', error);
      }
    },
    [user, isAuthenticated]
  );

  const deleteLine = useCallback(
    async (id: string) => {
      if (!isAuthenticated || !user) return;

      try {
        const { error } = await supabase
          .from('custom_lines')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        setCustomLines((prev) => prev.filter((line) => line.id !== id));
      } catch (error) {
        console.error('Error deleting custom line:', error);
      }
    },
    [user, isAuthenticated]
  );

  const getLineById = useCallback(
    (id: string) => {
      return customLines.find((line) => line.id === id);
    },
    [customLines]
  );

  return {
    customLines,
    loading,
    addLine,
    updateLine,
    deleteLine,
    getLineById,
  };
};

// Get all custom lines for all courses (for the current user)
export const useAllCustomLines = () => {
  const { user, isAuthenticated } = useAuth();
  const [customLines, setCustomLines] = useState<(CustomLineData & { courseId: string })[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!isAuthenticated || !user) {
        setCustomLines([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('custom_lines')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        setCustomLines(
          (data || []).map((row) => ({
            id: row.id,
            courseId: row.course_id,
            name: row.name,
            moves: row.moves,
            category: row.category,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }))
        );
      } catch (error) {
        console.error('Error fetching all custom lines:', error);
      }
    };

    fetchAll();
  }, [user, isAuthenticated]);

  return customLines;
};
