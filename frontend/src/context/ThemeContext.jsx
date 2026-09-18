import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('system');

  useEffect(() => {
    const stored = localStorage.getItem('smartspend_theme');
    if (stored) setMode(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('smartspend_theme', mode);
    const target = document.body;
    if (mode === 'dark') {
      target.classList.add('dark');
    } else if (mode === 'light') {
      target.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      target.classList.toggle('dark', prefersDark);
    }
  }, [mode]);

  return <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
