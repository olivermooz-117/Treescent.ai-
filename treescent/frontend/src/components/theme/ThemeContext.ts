import { useContext } from 'react';
import { createContext } from 'react';

export type ThemeContextValue = { isDark: boolean; toggleTheme: () => void };
export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
