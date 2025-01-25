"use client";

import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// Define your Material UI theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4e54c8",
    },
    secondary: {
      main: "#8f94fb",
    },
    background: {
      default: "#f3f3f3",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
  },
});

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
