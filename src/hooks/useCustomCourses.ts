import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CustomCourse {
  id: string;
  name: string;
  eco: string;
  color: 'white' | 'black';
  description: string;
  moves: string;
  createdAt: string;
  updatedAt: string;
}

export const useCustomCourses = () => {
  const { user, isAuthenticated } = useAuth();
  const [customCourses, setCustomCourses] = useState<CustomCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch custom courses from database
  const fetchCustomCourses = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCustomCourses([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_courses')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setCustomCourses(
        (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          eco: row.eco,
          color: row.color as 'white' | 'black',
          description: row.description,
          moves: row.moves,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching custom courses:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchCustomCourses();
  }, [fetchCustomCourses]);

  const addCourse = useCallback(
    async (course: Omit<CustomCourse, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!isAuthenticated || !user) return null;

      try {
        const { data, error } = await supabase
          .from('custom_courses')
          .insert({
            user_id: user.id,
            name: course.name,
            eco: course.eco,
            color: course.color,
            description: course.description,
            moves: course.moves,
          })
          .select()
          .single();

        if (error) throw error;

        const newCourse: CustomCourse = {
          id: data.id,
          name: data.name,
          eco: data.eco,
          color: data.color as 'white' | 'black',
          description: data.description,
          moves: data.moves,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setCustomCourses((prev) => [...prev, newCourse]);
        return newCourse;
      } catch (error) {
        console.error('Error adding custom course:', error);
        return null;
      }
    },
    [user, isAuthenticated]
  );

  const updateCourse = useCallback(
    async (
      id: string,
      updates: Partial<Omit<CustomCourse, 'id' | 'createdAt'>>
    ) => {
      if (!isAuthenticated || !user) return;

      try {
        const { error } = await supabase
          .from('custom_courses')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        setCustomCourses((prev) =>
          prev.map((course) =>
            course.id === id
              ? { ...course, ...updates, updatedAt: new Date().toISOString() }
              : course
          )
        );
      } catch (error) {
        console.error('Error updating custom course:', error);
      }
    },
    [user, isAuthenticated]
  );

  const deleteCourse = useCallback(
    async (id: string) => {
      if (!isAuthenticated || !user) return;

      try {
        const { error } = await supabase
          .from('custom_courses')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        setCustomCourses((prev) => prev.filter((course) => course.id !== id));
      } catch (error) {
        console.error('Error deleting custom course:', error);
      }
    },
    [user, isAuthenticated]
  );

  const getCourseById = useCallback(
    (id: string) => {
      return customCourses.find((course) => course.id === id);
    },
    [customCourses]
  );

  return {
    customCourses,
    loading,
    addCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
  };
};
