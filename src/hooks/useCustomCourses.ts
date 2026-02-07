import { useState, useEffect, useCallback } from 'react';

export interface CustomCourse {
  id: string;
  name: string;
  eco: string;
  color: 'white' | 'black';
  description: string;
  moves: string; // Starting position moves
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'openings4free_custom_courses';

export const useCustomCourses = () => {
  const [customCourses, setCustomCourses] = useState<CustomCourse[]>(() => {
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

  // Sync with localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomCourses(JSON.parse(stored));
      } catch {
        setCustomCourses([]);
      }
    }
  }, []);

  const saveToStorage = useCallback((courses: CustomCourse[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }, []);

  const addCourse = useCallback((course: Omit<CustomCourse, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCourse: CustomCourse = {
      ...course,
      id: `custom_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomCourses(prev => {
      const updated = [...prev, newCourse];
      saveToStorage(updated);
      return updated;
    });

    return newCourse;
  }, [saveToStorage]);

  const updateCourse = useCallback((id: string, updates: Partial<Omit<CustomCourse, 'id' | 'createdAt'>>) => {
    setCustomCourses(prev => {
      const updated = prev.map(course => {
        if (course.id === id) {
          return {
            ...course,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return course;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const deleteCourse = useCallback((id: string) => {
    setCustomCourses(prev => {
      const updated = prev.filter(course => course.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const getCourseById = useCallback((id: string) => {
    return customCourses.find(course => course.id === id);
  }, [customCourses]);

  return {
    customCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
  };
};

// Static function to get all custom courses
export const getAllCustomCourses = (): CustomCourse[] => {
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
