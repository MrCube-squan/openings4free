import { TrainingLine } from './courseLines';

export interface CategorizedLine extends TrainingLine {
  index: number;
  category: string;
}

// Categorize lines by number ranges (1-10, 11-20, etc.)
export const categorizeLines = (lines: TrainingLine[]): Map<string, CategorizedLine[]> => {
  const categories = new Map<string, CategorizedLine[]>();
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const lowerBound = Math.floor((lineNumber - 1) / 10) * 10 + 1;
    const upperBound = lowerBound + 9;
    const category = `Lines ${lowerBound}–${upperBound}`;
    
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    
    categories.get(category)!.push({
      ...line,
      index,
      category,
    });
  });
  
  return categories;
};

// Get sorted category names in numerical order
export const getSortedCategories = (categories: Map<string, CategorizedLine[]>): string[] => {
  return Array.from(categories.keys()).sort((a, b) => {
    const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
    const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
    return aNum - bNum;
  });
};
