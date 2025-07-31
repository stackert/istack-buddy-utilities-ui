import { createTheme, ThemeOptions } from "@mui/material/styles";

// Professional minimal color palette
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#2c3e50", // Dark blue-gray
      light: "#4a69bd",
      dark: "#1e272e",
    },
    secondary: {
      main: "#34495e", // Medium gray
      light: "#57657e",
      dark: "#2c3e50",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#2c3e50",
      secondary: "#57657e",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "0.875rem",
    },
    body2: {
      fontSize: "0.75rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "6px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
  },
};

const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#3498db", // Bright blue
      light: "#5dade2",
      dark: "#2980b9",
    },
    secondary: {
      main: "#95a5a6", // Light gray
      light: "#bdc3c7",
      dark: "#7f8c8d",
    },
    background: {
      default: "#1a1a1a",
      paper: "#2c2c2c",
    },
    text: {
      primary: "#ecf0f1",
      secondary: "#bdc3c7",
    },
  },
  typography: lightThemeOptions.typography,
  components: lightThemeOptions.components,
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
