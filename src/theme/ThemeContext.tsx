import React, { createContext, useContext, useMemo, useState } from "react";
import { Appearance } from "react-native";

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  muted: string;
  primary: string;
  accent: string;
  border: string;
};

type ThemeContextType = {
  isDark: boolean;
  toggle: () => void;
  colors: ThemeColors;
};

const light: ThemeColors = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  muted: "#6B7280",
  primary: "#0EA5A4",
  accent: "#0EA5A4",
  border: "#E6EEF2",
};

const dark: ThemeColors = {
  background: "#0B1220",
  card: "#071024",
  text: "#E6EEF2",
  muted: "#94A3B8",
  primary: "#34D399",
  accent: "#34D399",
  border: "#16324A",
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggle: () => {},
  colors: light,
});

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const system = Appearance.getColorScheme();
  const [isDark, setIsDark] = useState<boolean>(system === "dark");

  const toggle = () => setIsDark((v) => !v);

  const colors = useMemo(() => (isDark ? dark : light), [isDark]);

  return <ThemeContext.Provider value={{ isDark, toggle, colors }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
