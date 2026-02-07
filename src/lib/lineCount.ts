import { courseLines } from './courseLines';

/**
 * Get the count of built-in lines only
 * Note: For total count including custom lines, use the hooks directly
 */
export const getLineCount = (courseId: string): number => {
  const builtInLines = courseLines[courseId] || [];
  return builtInLines.length;
};

/**
 * Get the count of built-in lines only
 */
export const getBuiltInLineCount = (courseId: string): number => {
  return (courseLines[courseId] || []).length;
};
