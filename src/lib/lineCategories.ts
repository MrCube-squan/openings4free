import { TrainingLine } from './courseLines';

export interface CategorizedLine extends TrainingLine {
  index: number;
  category: string;
}

// Categorize lines based on their names
export const categorizeLines = (lines: TrainingLine[]): Map<string, CategorizedLine[]> => {
  const categories = new Map<string, CategorizedLine[]>();
  
  lines.forEach((line, index) => {
    const category = extractCategory(line.name);
    
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

// Extract category from line name
const extractCategory = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  // Check for specific patterns
  if (lowerName.includes('main line') || lowerName.includes('mainline')) {
    return 'Mainline';
  }
  if (lowerName.includes('gambit')) {
    return 'Gambit';
  }
  if (lowerName.includes('attack')) {
    return 'Attack';
  }
  if (lowerName.includes('defense') || lowerName.includes('defence')) {
    return 'Defense';
  }
  if (lowerName.includes('variation')) {
    // Try to extract the specific variation name
    const match = name.match(/(\w+)\s+Variation/i);
    if (match) {
      return 'Variation';
    }
    return 'Variation';
  }
  if (lowerName.includes('system')) {
    return 'System';
  }
  if (lowerName.includes('classical')) {
    return 'Classical';
  }
  if (lowerName.includes('modern')) {
    return 'Modern';
  }
  if (lowerName.includes('anti-')) {
    return 'Anti-Systems';
  }
  if (lowerName.includes('sharp') || lowerName.includes('aggressive')) {
    return 'Sharp Lines';
  }
  if (lowerName.includes('solid') || lowerName.includes('quiet')) {
    return 'Solid Lines';
  }
  if (lowerName.includes('sideline')) {
    return 'Sidelines';
  }
  
  // Check for opening-specific categories
  if (lowerName.includes('yugoslav')) {
    return 'Yugoslav Attack';
  }
  if (lowerName.includes('accelerated')) {
    return 'Accelerated Dragon';
  }
  if (lowerName.includes('jobava')) {
    return 'Jobava London';
  }
  if (lowerName.includes('evans')) {
    return 'Evans Gambit';
  }
  if (lowerName.includes('two knights')) {
    return 'Two Knights';
  }
  if (lowerName.includes('giuoco')) {
    return 'Giuoco Piano';
  }
  
  // Default to opening name prefix
  const colonIndex = name.indexOf(':');
  if (colonIndex > 0) {
    return name.substring(0, colonIndex).trim();
  }
  
  return 'Other';
};

// Get sorted category names with preferred order
export const getSortedCategories = (categories: Map<string, CategorizedLine[]>): string[] => {
  const categoryOrder = [
    'Mainline',
    'Classical',
    'Modern',
    'Attack',
    'Defense',
    'System',
    'Variation',
    'Gambit',
    'Sharp Lines',
    'Solid Lines',
    'Anti-Systems',
    'Sidelines',
    // Opening-specific
    'Yugoslav Attack',
    'Accelerated Dragon',
    'Giuoco Piano',
    'Evans Gambit',
    'Two Knights',
    'Jobava London',
  ];
  
  const allCategories = Array.from(categories.keys());
  
  return allCategories.sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    
    // Known categories first
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // Alphabetical for unknown
    return a.localeCompare(b);
  });
};
