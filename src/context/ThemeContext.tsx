"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = "programmer" | "elite-light" | "elite-dark" | "cybersecurity";
export type AccentColor = "indigo" | "emerald" | "rose" | "amber" | "cyan";

const ACCENTS: Record<AccentColor, string> = {
  indigo: "239 84% 45%",
  emerald: "142 71% 30%",
  rose: "347 77% 35%",
  amber: "38 92% 30%",
  cyan: "189 94% 28%",
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('programmer');
  const [accentColor, setAccentColor] = useState<AccentColor>('indigo');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const storedAccent = localStorage.getItem('accentColor') as AccentColor | null;
    if (storedTheme) setTheme(storedTheme);
    if (storedAccent) setAccentColor(storedAccent);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('programmer', 'elite-light', 'elite-dark', 'cybersecurity', 'light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);

    // Dynamic Accent Injection (Scoped to iOS Elite themes)
    if (theme === 'elite-light' || theme === 'elite-dark') {
      const hsl = ACCENTS[accentColor];
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--ring', hsl);
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--ring');
    }
    localStorage.setItem('accentColor', accentColor);
  }, [theme, accentColor]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return {
      theme: 'programmer' as Theme,
      setTheme: () => { },
      accentColor: 'indigo' as AccentColor,
      setAccentColor: () => { }
    };
  }
  return context;
};