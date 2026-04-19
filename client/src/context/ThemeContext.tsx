import React, { createContext, useEffect, useState, useContext } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'; 

    const storedTheme = localStorage.getItem('theme') as Theme | null;

    if (storedTheme) return storedTheme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
  const root = window.document.documentElement;

  root.classList.remove('dark');
  if (theme === 'dark') {
    root.classList.add('dark');
  }

  localStorage.setItem('theme', theme);
}, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context; 
}