import { courseLines } from './courseLines';
import { getAllCustomLines } from '@/hooks/useCustomLines';

/**
 * Get the actual number of lines for a course (built-in + custom)
 */
export const getLineCount = (courseId: string): number => {
  const builtInLines = courseLines[courseId] || [];
  
  // Get custom lines for this course
  let customLinesCount = 0;
  if (typeof window !== 'undefined') {
    const allCustomLines = getAllCustomLines();
    customLinesCount = allCustomLines.filter(l => l.id.startsWith(`${courseId}_`)).length;
  }
  
  return builtInLines.length + customLinesCount;
};

/**
 * Get the count of built-in lines only
 */
export const getBuiltInLineCount = (courseId: string): number => {
  return (courseLines[courseId] || []).length;
};
