import React, { createContext, useMemo, useState, useContext, useEffect } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const ColorModeContext = createContext();

export const useColorMode = () => useContext(ColorModeContext);

export function ColorModeProvider({ children }) {
  // Load saved mode or default to light
  const [mode, setMode] = useState(() => localStorage.getItem("theme") || "light");

  // Toggle between light and dark
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("theme", newMode);
      return newMode;
    });
  };

  // Create theme based on current mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                background: { default: "#f5f5f5", paper: "#ffffff" },
                text: { primary: "#000000" },
                

              }
            : {
                background: { default: "#121212", paper: "#1e1e1e" },
                text: { primary: "#ffffff" },
              }),
        },
        typography: {
          fontFamily: "'Roboto', sans-serif",
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline applies global background and text color */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
