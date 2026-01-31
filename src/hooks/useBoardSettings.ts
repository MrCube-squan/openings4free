import { useState, useEffect } from 'react';

export interface BoardTheme {
  name: string;
  light: string;
  dark: string;
}

export const boardThemes: Record<string, BoardTheme> = {
  default: { name: 'Classic', light: 'hsl(35, 35%, 75%)', dark: 'hsl(152, 25%, 32%)' },
  wood: { name: 'Wood', light: '#f0d9b5', dark: '#b58863' },
  blue: { name: 'Ocean', light: '#dee3e6', dark: '#8ca2ad' },
  green: { name: 'Forest', light: '#ffffdd', dark: '#86a666' },
  purple: { name: 'Amethyst', light: '#e8e0f0', dark: '#8877b7' },
  gray: { name: 'Slate', light: '#c0c0c0', dark: '#707070' },
  midnight: { name: 'Midnight', light: '#a9b7c6', dark: '#2c3e50' },
  coral: { name: 'Coral', light: '#ffe4e1', dark: '#cd5c5c' },
};

export interface BoardSettings {
  theme: string;
  showCoordinates: boolean;
}

const STORAGE_KEY = 'openings4free_board_settings';

const defaultSettings: BoardSettings = {
  theme: 'default',
  showCoordinates: true,
};

export const useBoardSettings = () => {
  const [settings, setSettings] = useState<BoardSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<BoardSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const currentTheme = boardThemes[settings.theme] || boardThemes.default;

  return {
    settings,
    updateSettings,
    currentTheme,
    themes: boardThemes,
  };
};
